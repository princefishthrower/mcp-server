import { levenshteinDistance } from "../utils/levenshteinDistance.js";
import { exec } from "child_process";
import { promisify } from "util";
const execPromise = promisify(exec);

// for compremium - windows powershell compatible
const keywordRepoMap: Array<{ keywords: string[], testCommand: string}> = [
    {
        keywords: ["CPM1", "CPMX1"],
        testCommand: "dotnet test C:\\Users\\frewi\\enterprise\\cpm1-software\\src /p:Platform=x86"
    },
    {
        keywords: ["CPM2", "CPMX2"],
        testCommand: "dotnet test C:\\Users\\frewi\\enterprise\\cpmx2-software\\src /p:Platform=x86"
    },
    {
        keywords: ["Common", "CPMXCommon", "CPMX Common"],
        testCommand: "dotnet test C:\\Users\\frewi\\enterprise\\cpmx-common\\src /p:Platform=x86"
    },
    {
        keywords: ["Connectivity", "CPMXConnectivity", "Cockpit"],
        testCommand: "dotnet test C:\\Users\\frewi\\enterprise\\cpm-connectivity\\src /p:Platform=x86"
    },
    {
        keywords: ["CI Components", "CI Components Library", "CI"],
        testCommand: "dotnet test C:\\Users\\frewi\\enterprise\\ci-components\\src /p:Platform=x86"
    },
]

// returns the relevant test command based on the keyword provided
// if no matching keyword is found, it gives context of the nearest matches, i.e. "did you mean...?"
export const runTestForRepo = async (keyword: string) => {
    const keywordLower = keyword.toLowerCase();
    
    // First try exact or substring matches
    const exactMatches = keywordRepoMap.filter(repo => 
        repo.keywords.some(kw => kw.toLowerCase().includes(keywordLower))
    );

    if (exactMatches.length > 0) {
        // Execute test command for the first match
        const testCommand = exactMatches[0].testCommand;
        
        try {
            // Execute the command directly
            const { stdout, stderr } = await execPromise(testCommand);
            
            return {
                content: [{
                    type: "text",
                    text: `Running tests: ${testCommand}\n\n${stdout}`
                }],
                command: testCommand,
                isError: false
            };
        } catch (error: any) {
            // Handle error when executing command
            return {
                content: [{
                    type: "text",
                    text: `Error executing test command: ${testCommand}\n\n${error.message}`
                }],
                command: testCommand,
                isError: true
            };
        }
    } else {
        // If no exact matches, find fuzzy matches using Levenshtein distance
        const DISTANCE_THRESHOLD = 3; // Max edit distance to consider a word similar
        
        // Calculate distance for each keyword and find the closest matches
        const fuzzyMatches: Array<{repo: typeof keywordRepoMap[0], keyword: string, distance: number}> = [];
        
        for (const repo of keywordRepoMap) {
            for (const kw of repo.keywords) {
                const distance = levenshteinDistance(keywordLower, kw.toLowerCase());
                if (distance <= DISTANCE_THRESHOLD) {
                    fuzzyMatches.push({repo, keyword: kw, distance});
                }
            }
        }
        
        // Sort by distance (closest matches first)
        fuzzyMatches.sort((a, b) => a.distance - b.distance);
        
        if (fuzzyMatches.length > 0) {
            // Get unique test commands from the closest matches
            const uniqueMatchedCommands = Array.from(new Set(
                fuzzyMatches.map(match => match.repo.testCommand)
            ));
            
            // Show suggested keywords along with their test commands
            const suggestions = fuzzyMatches
                .slice(0, 5) // Limit to top 5 suggestions
                .map(match => `${match.keyword} (${match.repo.testCommand})`)
                .join(", ");
                
            return {
                content: [{
                    type: "text",
                    text: `No exact matches found for '${keyword}'. Did you mean: ${suggestions}?`
                }],
                isError: true
            };
        } else {
            // No matches at all
            return {
                content: [{
                    type: "text",
                    text: `No matching repo found for '${keyword}'. Available keywords: ${keywordRepoMap.map(repo => repo.keywords.join(", ")).join("; ")}`
                }],
                isError: true
            };
        }
    }
}