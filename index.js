import * as core from '@actions/core';
import * as crypto from 'crypto';

function convertValue(value, type) {
    switch (type) {
        case 'number': {
            const num = Number(value);
            if (isNaN(num)) throw new Error(`Cannot convert "${value}" to number`);
            return num;
        }
        case 'boolean':
            if (value === 'true' || value === '1') return true;
            if (value === 'false' || value === '0') return false;
            throw new Error(`Cannot convert "${value}" to boolean`);
        case 'string':
            return value;
        default:
            return value;
    }
}

function getHeaders(token, timezoneOffset) {
    const rawTimestamp = Date.now();
    const timestamp = Math.floor(rawTimestamp / 1000) + timezoneOffset * 3600;
    core.info(`[Auth] raw timestamp (ms): ${rawTimestamp}, timezone offset: ${timezoneOffset}h, adjusted (s): ${timestamp}`);
    const calcToken = crypto.createHash('md5').update('1panel' + token + timestamp).digest('hex');
    return {
        'Content-Type': 'application/json',
        '1Panel-Token': calcToken,
        '1Panel-Timestamp': `${timestamp}`
    };
}

async function request(url, token, method, body, timezoneOffset) {
    core.info(`[Request] ${method} ${new URL(url).pathname}`);
    const customHeaders = getHeaders(token, timezoneOffset);
    const fetchUrl = new URL(url);
    let fetchBody = undefined;
    if (method === 'GET' || method === 'DELETE') {
        fetchUrl.search = new URLSearchParams(body).toString();
    } else {
        fetchBody = JSON.stringify(body);
    }
    let fetchRes;
    try {
        fetchRes = await fetch(fetchUrl.href, {
            method,
            headers: customHeaders,
            body: fetchBody
        });
    } catch (e) {
        core.info(`[Request] network error: ${e.message}`);
        return {
            code: 0,
            message: e.message,
            data: null
        };
    }
    core.info(`[Request] response status: ${fetchRes.status}`);
    if (fetchRes.status !== 200) {
        return {
            code: fetchRes.status,
            message: fetchRes.statusText,
            data: null
        };
    }
    return await fetchRes.json();
}

async function runScript(url, token, {name}, timezoneOffset) {
    core.info(`[runScript] searching script "${name}"...`);
    const scriptSearchUrl = `${url}/api/v2/core/script/search`;
    const scriptsRes = await request(scriptSearchUrl, token, 'POST', {
        groupID: 0,
        info: name,
        page: 1,
        pageSize: 100
    }, timezoneOffset);
    if (scriptsRes.code !== 200) {
        core.setFailed(`Get script ${name} failed: ${scriptsRes.message}`);
        return;
    }
    const scripts = scriptsRes.data?.items;
    core.info(`[runScript] found ${scripts ? scripts.length : 0} matching scripts`);
    if (!scripts || !scripts.length) {
        core.setFailed(`Script ${name} not found`);
        return;
    }
    let scriptId = undefined;
    for (let script of scripts) {
        if (script.name !== name) continue;
        scriptId = script.id;
        core.info(`[runScript] matched script id: ${scriptId}`);
    }
    if (!scriptId) {
        core.setFailed(`Script ${name} not found`);
        return;
    }
    const scriptRunUrl = `${url}/api/v2/core/script/run`;
    core.info(`[runScript] executing script...`);
    const runRes = await request(scriptRunUrl, token, 'GET', {
        cols: 80,
        rows: 24,
        script_id: scriptId,
        operateNode: 'local'
    }, timezoneOffset);
    if (runRes.code !== 200) {
        core.setFailed(`Run script ${name} failed: ${runRes.message}`);
        return;
    }
    core.info(`[runScript] script "${name}" executed successfully`);
}

async function runCronjob(url, token, {name}, timezoneOffset) {
    core.info(`[runCronjob] searching cronjob "${name}"...`);
    const searchUrl = `${url}/api/v2/cronjobs/search`;
    const searchRes = await request(searchUrl, token, 'POST', {
        info: name,
        page: 1,
        pageSize: 100
    }, timezoneOffset);
    if (searchRes.code !== 200) {
        core.setFailed(`Get cronjob ${name} failed: ${searchRes.message}`);
        return;
    }
    const items = searchRes.data?.items;
    core.info(`[runCronjob] found ${items ? items.length : 0} matching cronjobs`);
    if (!items || !items.length) {
        core.setFailed(`Cronjob ${name} not found`);
        return;
    }
    let cronjobId = undefined;
    for (let item of items) {
        if (item.name !== name) continue;
        cronjobId = item.id;
        core.info(`[runCronjob] matched cronjob id: ${cronjobId}`);
    }
    if (!cronjobId) {
        core.setFailed(`Cronjob ${name} not found`);
        return;
    }
    const handleUrl = `${url}/api/v2/cronjobs/handle`;
    core.info(`[runCronjob] triggering cronjob...`);
    const handleRes = await request(handleUrl, token, 'POST', {
        id: cronjobId
    }, timezoneOffset);
    if (handleRes.code !== 200) {
        core.setFailed(`Run cronjob ${name} failed: ${handleRes.message}`);
        return;
    }
    core.info(`[runCronjob] cronjob "${name}" triggered successfully`);
}

const actions = {
    'runScript': {
        exec: runScript,
        params: [
            {
                name: 'name',
                type: 'string',
                required: true
            }
        ]
    },
    'runCronjob': {
        exec: runCronjob,
        params: [
            {
                name: 'name',
                type: 'string',
                required: true
            }
        ]
    }
};

async function main() {
    try {
        const action = core.getInput('action');
        const url = core.getInput('url');
        const token = core.getInput('token');
        const timezoneRaw = core.getInput('timezone') || '+0';
        const timezoneOffset = Number(timezoneRaw);
        core.info(`[Main] action: ${action}, timezone: UTC${timezoneRaw}`);
        if (isNaN(timezoneOffset)) {
            core.setFailed(`Invalid timezone "${timezoneRaw}"`);
            return;
        }
        if (!url) {
            core.setFailed('Input "url" is required');
            return;
        }
        if (!token) {
            core.setFailed('Input "token" is required');
            return;
        }
        const params = core.getMultilineInput('params');
        const paramObj = {};
        params.forEach(param => {
            const eqIndex = param.indexOf('=');
            if (eqIndex === -1) return;
            const key = param.slice(0, eqIndex).trim();
            paramObj[key] = param.slice(eqIndex + 1).trim();
        });
        core.info(`[Main] raw params: ${JSON.stringify(paramObj)}`);
        if (!actions[action]) {
            core.setFailed(`Action ${action} not found`);
            return;
        }
        if (actions[action].params) {
            let failed = false;
            actions[action].params.forEach(param => {
                if (!paramObj[param.name]) {
                    core.setFailed(`Param ${param.name} is required`);
                    failed = true;
                    return;
                }
                try {
                    paramObj[param.name] = convertValue(paramObj[param.name], param.type);
                } catch (e) {
                    core.setFailed(`Param ${param.name} must be ${param.type}: ${e.message}`);
                    failed = true;
                }
            });
            if (failed) {
                return;
            }
        }
        core.info(`[Main] converted params: ${JSON.stringify(paramObj)}`);
        await actions[action].exec(url, token, paramObj, timezoneOffset);
    } catch (error) {
        core.setFailed(error.message);
    }
}

await main();
