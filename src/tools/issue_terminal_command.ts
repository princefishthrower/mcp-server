import { exec } from 'child_process';
import { promisify } from 'util';

// List of allowed commands (read-only operations)
// const ALLOWED_COMMANDS = [
//     'ls', 'dir', 'cat', 'head', 'tail', 'grep',
//     'pwd', 'echo', 'date', 'whoami', 'df', 'du', 'ps',
//     'wc', 'which', 'whereis', 'type', 'file', 'uname',
//     'history', 'man', 'env', 'printenv', 'grimoire', '/Users/chris/go/bin/grimoire'
// ];

export const issueTerminalCommand = async (command: string) => {
    // Extract the base command (first word before any space or special character)
    const baseCommand = command.trim().split(/\s+/)[0];

    if (baseCommand === 'find') {
        return {
            content: [{
                type: "text",
                text: `Error: The 'find' command is very slow when searching across the entire local device. If you are looking for a repository, use the 'list_repo_locations' tool. Otherwise, use tools like tree and ls to search within a specific directory.`
            }],
            isError: true
        };
    }
    
    // Check if the base command is in the allowed list
    // if (!ALLOWED_COMMANDS.includes(baseCommand)) {
    //     return {
    //         content: [{
    //             type: "text",
    //             text: `Error: Command '${baseCommand}' is not allowed for security reasons. Only read-only commands like ${ALLOWED_COMMANDS.slice(0, 5).join(', ')}, etc. are permitted.`
    //         }],
    //         isError: true
    //     };
    // }

    try {
        const execPromise = promisify(exec);

        const { stdout, stderr } = await execPromise(command);

        if (stderr) {
            return {
                content: [{
                    type: "text",
                    text: `Error: ${stderr}`
                }],
                isError: true
            };
        }

        return {
            content: [{
                type: "text",
                text: stdout
            }],
            isError: false
        };
    } catch (error: any) {
        return {
            content: [{
                type: "text",
                text: `Error executing command: ${error.message}`
            }],
            isError: true
        };
    }
}