# Changelog / 更新日志

All notable changes to this project will be documented in this file.

本项目的所有重要变更都将记录在此文件中。

## [1.0.0] - 2026-06-19

### **Added**

- Initial release of 1Panel Actions
- `runScript` action: search and execute scripts on 1Panel server
- Parameter type conversion: automatically convert string inputs to `number` / `boolean` / `string` based on action
  schema
- 1Panel API authentication with MD5 token hashing and timestamp
- Input support: `url`, `token`, `action`, `params`

### **新增**

- 1Panel Actions 初始发布
- `runScript` 操作：搜索并执行 1Panel 服务器上的脚本
- 参数类型转换：根据 action schema 自动将字符串输入转换为 `number` / `boolean` / `string`
- 基于 MD5 令牌哈希和时间戳的 1Panel API 认证
- 输入支持：`url`、`token`、`action`、`params`

## [1.0.1] - 2026-06-19

### **Fixed**

- Missing `return` after `core.setFailed()` in `runScript` — execution continued after error
- Potential `TypeError` when accessing `scriptsRes.data.items` if API returns null data
- Unhandled network errors in `request()` — `fetch` failures now return error response instead of throwing
- Missing input validation for `url` and `token`

### **Changed**

- Removed unnecessary `instanceof Promise` check — `runScript` is always async
- Removed unused `token` field from `paramObj`

### **修复**

- 修复 `runScript` 中 `core.setFailed()` 之后缺少 `return` 导致错误后继续执行的问题
- 修复 API 返回 null data 时访问 `.items` 导致的潜在 `TypeError`
- 修复 `request()` 中未处理的网络异常 — `fetch` 失败现在返回错误响应而非抛出异常
- 修复 `url` 和 `token` 缺少输入校验的问题

### **优化**

- 移除多余的 `instanceof Promise` 检查 — `runScript` 始终返回 Promise
- 移除 `paramObj` 中无用的 `token` 字段

## [1.0.2] - 2026-06-19

### **Fixed**

- Node 24 ESM compatibility: wrapped top-level logic in `main()` function — `return` is illegal at module top level in strict ESM

### **修复**

- Node 24 ESM 兼容：将顶层逻辑包裹在 `main()` 函数中 — 严格 ESM 模块顶层不允许 `return`

[1.0.2]: https://github.com/Gu-ZT/1panel-actions/releases/tag/1.0.2
[1.0.1]: https://github.com/Gu-ZT/1panel-actions/releases/tag/1.0.1
[1.0.0]: https://github.com/Gu-ZT/1panel-actions/releases/tag/1.0.0
