# Tangent

Tangent adds four Claude Code-style commands to Paseo agents: `/btw` for side questions, `/subtask` for background work that reports back, and `/fork` and `/branch` for copying a conversation into a new tab.

## Commands

- **`/btw <question>`** asks a side question in a "By the way" sidebar panel. The thread starts from a copy of the conversation and is told not to use tools. The main agent never sees it. Follow-ups continue the same thread, and **New thread** archives it.
- **`/subtask <task>`** starts a background child agent with fresh context on the parent's provider, model, mode, and thinking level. When it finishes, its reply is sent to the parent as a `<subtask-result>` message.
- **`/fork <prompt>`** copies the conversation into a new agent, opens it in a new tab, and sends it the prompt. Its answer is sent back to the parent as a `<fork-result>` message.
- **`/branch [prompt]`** works like `/fork` but never reports back.

Reports steer a busy parent instead of interrupting it. Only the reply to Tangent's own prompt is reported; turns you start in the child's tab are not.

## How forking works

Where the provider allows it, Tangent makes a native fork: a copy of the provider's own session, so the fork keeps tool results and the prompt cache.

- **Claude:** copies the session transcript under `~/.claude/projects` (or `CLAUDE_CONFIG_DIR`) with a new session id.
- **Codex:** starts a short-lived `codex app-server` and calls `thread/fork`.
- **OpenCode:** starts a short-lived `opencode serve` on a free local port and calls its session fork endpoint.
- **Pi and Oh My Pi:** copy the session file with a new session id.

The fork is then imported with the `paseo` CLI, which also copies the parent's title, thinking level, and mode, and opens the fork in Paseo Desktop. Copilot, Antigravity, Muse Code, and any failed native fork fall back to a transcript fork: the visible user and assistant messages are attached to a fresh agent.

## Requirements

- Paseo 0.13 or later on the daemon.
- The `paseo` CLI, and `codex` or `opencode` for those providers' native forks. Tangent looks in standard install locations; `PASEO_CLI`, `TANGENT_CODEX_BIN`, and `TANGENT_OPENCODE_BIN` override them.

## Data and permissions

- Forks, `/btw` threads, and subtasks are ordinary agents. Conversation content, including tool results in native forks, goes to the same agent provider the parent uses.
- Native forks write new session files into the provider's own session store beside the original.
- Tangent runs the `paseo`, `codex`, and `opencode` CLIs already installed on the daemon host. It downloads nothing and contacts no service of its own. OpenCode forks use a local server bound to `127.0.0.1`.

## Limitations

- Native forks do not carry over the parent's model on Claude, Pi, or Oh My Pi; the CLI cannot set it.
- Pending reports are kept in memory and are lost if the daemon restarts.
- `/btw` answers appear when complete, not streamed, and time out after 5 minutes.
- On clients other than Paseo Desktop, `/fork` and `/branch` open the sidebar panel, which opens the tab.

See the [README](README.md) for installation and configuration.
