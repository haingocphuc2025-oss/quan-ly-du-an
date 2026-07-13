# Plugin Registry

| Plugin | Provides | Used By | Official Source |
|---|---|---|---|
| Spec Kit | specification, plan, tasks | `/spec`, `/tasks` | https://github.com/github/spec-kit |
| Superpowers | planning, implementation discipline, TDD | `/plan`, `/build`, `/fix` | https://github.com/obra/superpowers |
| Agent Skills | review, verify, engineering gates | `/review`, `/verify` | https://github.com/addyosmani/agent-skills |
| OmniParser | screenshot UI parsing | `/ui-spec` | https://github.com/microsoft/OmniParser |
| Obscura | browser/DOM reconnaissance | `/website-research`, `/dom-analysis` | https://github.com/haingocphuc2025-oss/obscura |
| Context7 | current library documentation | `/architecture`, `/build` | https://github.com/upstash/context7 |
| Playwright MCP | browser automation and E2E | `/capture-ui`, `/compare-ui`, `/regression` | https://github.com/microsoft/playwright-mcp |
| GitHub MCP | issues, PRs, repository actions | `/commit`, `/release` | https://github.com/github/github-mcp-server |
| MCP Servers | filesystem, memory, sequential thinking | multiple skills | https://github.com/modelcontextprotocol/servers |

## Browser Harness

`Browser Harness` là tên năng lực chung trong framework. Hãy ánh xạ nó tới công cụ browser automation bạn đã cài, ưu tiên Playwright MCP hoặc công cụ nội bộ tương đương.

## Fallback

Nếu plugin không có:

- OmniParser → dùng Vision + ảnh + DOM.
- Obscura → dùng Playwright/Browser Harness.
- Context7 → dùng tài liệu chính thức của framework.
- Memory MCP → dùng file `DECISIONS.md`.
