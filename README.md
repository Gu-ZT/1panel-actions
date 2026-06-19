# 1Panel Actions

[English](#english) | [中文](#中文)

---

## English

A GitHub Action to interact with [1Panel](https://1panel.cn) API, enabling automated server management in your CI/CD
workflows.

### Inputs

| Name       | Required | Description                                          |
|------------|----------|------------------------------------------------------|
| `url`      | Yes      | 1Panel URL, e.g. `https://1panel.example.com`        |
| `token`    | Yes      | 1Panel API token                                     |
| `action`   | Yes      | Action to perform                                    |
| `timezone` | No       | UTC offset of 1Panel server, e.g. `+8`. Default `+0` |
| `params`   | No       | Parameters in `name=value` format, one per line      |

### Supported Actions

#### `runScript`

Search and execute a script on 1Panel.

| Param  | Type   | Required | Description               |
|--------|--------|----------|---------------------------|
| `name` | string | Yes      | Name of the script to run |

### Usage Example

```yaml
steps:
  - name: Run 1Panel script
    uses: Gu-ZT/1panel-actions@1.0.3
    with:
      url: ${{ secrets.ONEPANEL_URL }}
      token: ${{ secrets.ONEPANEL_TOKEN }}
      action: runScript
      params: |
        name=Deploy App
```

### Authentication

This action uses 1Panel's API token authentication — the token is hashed with MD5 and a timestamp before being sent.
Your token is never logged or exposed.

### License

MIT — see [LICENSE](LICENSE).

---

## 中文

一个 GitHub Action，用于调用 [1Panel](https://1panel.cn) API，在 CI/CD 流程中实现自动化服务器管理。

### 输入参数

| 参数         | 必填 | 说明                                        |
|------------|----|-------------------------------------------|
| `url`      | 是  | 1Panel 地址，例如 `https://1panel.example.com` |
| `token`    | 是  | 1Panel API 令牌                             |
| `action`   | 是  | 要执行的操作                                    |
| `timezone` | 否  | 1Panel 服务器的 UTC 偏移量，例如 `+8`。默认 `+0`       |
| `params`   | 否  | 参数列表，格式为 `name=value`，每行一个                |

### 支持的操作

#### `runScript`

搜索并执行 1Panel 上的脚本。

| 参数     | 类型     | 必填 | 说明       |
|--------|--------|----|----------|
| `name` | string | 是  | 要运行的脚本名称 |

### 使用示例

```yaml
steps:
  - name: 运行 1Panel 脚本
    uses: Gu-ZT/1panel-actions@1.0.3
    with:
      url: ${{ secrets.ONEPANEL_URL }}
      token: ${{ secrets.ONEPANEL_TOKEN }}
      action: runScript
      params: |
        name=部署应用
```

### 认证方式

本 Action 使用 1Panel 的 API 令牌认证：令牌与时间戳经 MD5 哈希后发送，你的令牌不会被记录或泄露。

### 开源协议

MIT — 详见 [LICENSE](LICENSE)。
