# mcp-server

A custom MCP server.

## Tools

`generate_solve_prompt` - returns a string describing a workflow for a full stack med tech software engineer
`issue_terminal_command` - issues a command and parses `stdout` and `stderr`
`list_repo_locations` - returns a list of repo locations based on a keyword search. uses Levenshtein distance to suggest closest matches when an exact match is not found
`run_test_for_repo` - designed to be run on a windows machine, runs a `dotnet test` command on a given repo

`get_full_codebase` - currently under development, there an issue with the `grimiore` command it uses under the hood...

## Usage

Install the dependencies:

```shell
npm install
```

Build the project:

```shell
npm run build
```

Consume in your Claude desktop configuration. This server requires an `environment` argument to be passed in, to determine what repos should be looked for within the `list_repo_locations` argument:

```json
// ...other MCP servers...
"mcp-local": {
    "command": "node",
    "args": [
        "/path/to/cloned/mcp-server/build/index.js",
        "--environment",
        "fullstackcraft"
    ]
}
// ...other MCP servers...
```

Of course, the paths listed in the repo maps in `list_repo_locations` must be valid paths on your local machine!