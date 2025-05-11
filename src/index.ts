import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { issueTerminalCommand } from "./tools/issue_terminal_command.js";
import { listRepoLocations } from "./tools/list_repo_locations.js";
import { generateSolvePrompt } from "./tools/generate_solve_prompt.js";
import { runTestForRepo } from "./tools/run_test_for_repo.js";

const args = process.argv.slice(2);
const environmentFlag = args.find(arg => arg.startsWith('--environment=')) || 
                        args.find(arg => arg === '--environment' && args[args.indexOf(arg) + 1]) ?
                        args[args.indexOf('--environment') + 1] :
                        args.find(arg => arg.startsWith('--environment='))?.split('=')[1] || 'default';

const environment = environmentFlag;

const server = new Server({
    name: "mcp-server",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {
            
        }
    }
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "generate_solve_prompt",
                description: "Generates the solve prompt based on the prompt.",
                inputSchema: {
                    type: "object",
                    properties: {
                        prompt: { type: "string" },
                    },
                    required: ["prompt"]
                }
            },
            {
                name: "issue_terminal_command",
                description: "Executes a terminal command and returns the result.",
                inputSchema: {
                    type: "object",
                    properties: {
                        command: { type: "string" },
                    },
                    required: ["command"]
                }
            },
            {
                name: 'list_repo_locations',
                description: 'Given a keyword, returns the relevant repo path based on the keyword provided. If no matching keyword is found, it gives context of the nearest matches.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        keyword: { type: 'string' },
                    },
                    required: ['keyword']
                }
            },
            {
                name: 'run_test_for_repo',
                description: 'Given a keyword, returns the relevant test command based on the keyword provided. If no matching keyword is found, it gives context of the nearest matches.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        keyword: { type: 'string' },
                    },
                    required: ['keyword']
                }
            }
        ]
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "generate_solve_prompt") {
        const args = request.params.arguments as { prompt: string };
        const { prompt } = args;
        return { toolResult: await generateSolvePrompt(prompt) };
    }
    else if (request.params.name === "issue_terminal_command") {
        const args = request.params.arguments as { command: string };
        const { command } = args;
        return { toolResult: await issueTerminalCommand(command) };
    }
    else if (request.params.name === "list_repo_locations") {
        const args = request.params.arguments as { keyword: string };
        const { keyword } = args;
        return { toolResult: await listRepoLocations(environment, keyword) };
    }
    else if (request.params.name === 'run_test_for_repo') {
        const args = request.params.arguments as { keyword: string };
        const { keyword } = args;
        return { toolResult: await runTestForRepo(keyword) };
    }
    throw new McpError(ErrorCode.MethodNotFound, "Tool not found");
});

const transport = new StdioServerTransport();
await server.connect(transport);