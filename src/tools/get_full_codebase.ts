import { issueTerminalCommand } from "./issue_terminal_command.js";

// uses the grimoire (golang) CLI tool to get the codebase
export const getFullCodebase = async (absoluteRepoPath: string): Promise<string> => {
    const command = `/Users/chris/go/bin/grimoire ${absoluteRepoPath}`;
    const result = await issueTerminalCommand(command);
    if (result.content.length === 0) {
        return "No content returned from grimoire command"
    }
    if (result.isError) {
        return `Error executing grimoire command: ${result.content[0].text}`
    }

    return result.content[0].text;
}