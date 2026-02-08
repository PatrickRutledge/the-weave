# Configuring The Weaver

The Weaver is an MCP (Model Context Protocol) server. It runs locally on your machine and connects to your AI coding assistant via stdio transport. No network access required, no API keys needed.

## Claude Code

The simplest setup. Run this command in your terminal:

```bash
claude mcp add the-weaver -- npx -y the-weaver
```

This tells Claude Code to:
1. Download `the-weaver` from npm (if not already cached)
2. Run it as an MCP server
3. Connect via stdio transport

That's it. The next time you start a Claude Code session, The Weaver's tools and perspectives will be available.

To verify the connection:
```bash
claude mcp list
```

To remove it:
```bash
claude mcp remove the-weaver
```

## Cursor

Add The Weaver to your Cursor settings. Open **Settings > MCP Servers** or edit your `settings.json` directly:

```json
{
  "mcpServers": {
    "the-weaver": {
      "command": "npx",
      "args": ["-y", "the-weaver"]
    }
  }
}
```

Restart Cursor after adding the configuration. The Weaver's tools will appear in the MCP tools panel.

## VS Code (with MCP Extension)

If you are using VS Code with an MCP-compatible extension (such as the Copilot MCP extension or a third-party MCP client), add the following to your `settings.json`:

```json
{
  "mcp.servers": {
    "the-weaver": {
      "command": "npx",
      "args": ["-y", "the-weaver"]
    }
  }
}
```

The exact settings key may vary depending on which MCP extension you use. Consult your extension's documentation for the correct configuration format.

## Team Usage: Project Configuration

For team-wide configuration, add a `.mcp.json` file to your project root. This ensures every team member gets the same MCP server setup when they open the project.

```json
{
  "servers": {
    "the-weaver": {
      "command": "npx",
      "args": ["-y", "the-weaver"]
    }
  }
}
```

Commit this file to your repository. When a team member clones the project and opens it in an MCP-compatible editor, The Weaver will be available automatically.

### Version Pinning

To ensure the entire team uses the same version of The Weaver:

```json
{
  "servers": {
    "the-weaver": {
      "command": "npx",
      "args": ["-y", "the-weaver@0.1.0"]
    }
  }
}
```

Replace `0.1.0` with your desired version.

## Local Development

If you are developing The Weaver itself or want to run from a local clone:

```bash
git clone https://github.com/PatrickRutledge/the-weave.git
cd the-weave
npm install
npm run build
```

Then configure your editor to use the local build:

**Claude Code:**
```bash
claude mcp add the-weaver -- node /path/to/the-weave/dist/index.js
```

**Cursor / VS Code settings.json:**
```json
{
  "mcpServers": {
    "the-weaver": {
      "command": "node",
      "args": ["/path/to/the-weave/dist/index.js"]
    }
  }
}
```

For active development with auto-rebuild:
```bash
npm run dev
```

## Troubleshooting

### The Weaver is not appearing in my tools list

1. Verify the server is configured: check your editor's MCP server list
2. Ensure `npx` is available: run `npx --version` in your terminal
3. Ensure Node.js 18+ is installed: run `node --version`
4. Restart your editor after adding the configuration

### "Cannot find module" errors

Clear the npx cache and try again:
```bash
npx -y the-weaver@latest
```

### Connection timeouts

The Weaver communicates via stdio (standard input/output). If you see connection timeouts:
1. Ensure no other process is intercepting stdio
2. Check that your firewall is not blocking local process communication
3. Try running `npx -y the-weaver` directly in a terminal to see if it starts without errors

### Debug output

The Weaver writes diagnostic information to stderr (which does not interfere with the MCP JSON-RPC protocol on stdout). To see debug output, run the server manually:

```bash
npx -y the-weaver 2>weaver-debug.log
```

Then inspect `weaver-debug.log` for errors or warnings.

## Requirements

- **Node.js**: 18 or later
- **npm**: 8 or later (included with Node.js 18+)
- **Editor**: Any MCP-compatible client (Claude Code, Cursor, VS Code with MCP extension)
- **Network**: Only needed for initial `npx` download. After that, everything runs locally.
