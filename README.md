# mcp-server

A custom MCP server.

## Usage

Install the dependencies:

```shell
npm install
```

Build the project:

```shell
npm run build
```

Consume in your Claude desktop configuration:

```json
// ...other MCP servers...
"mcp-local": {
    "command": "node",
    "args": [
        "/path/to/cloned/mcp-server/build/index.js"
    ]
}
// ...other MCP servers...
```