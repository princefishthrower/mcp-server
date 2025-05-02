// for codevideo
// const keywordRepoMap: Array<{ keywords: string[], repoPath: string}> = [
//     {
//         keywords: ["codevideo.io", "CodeVideo homepage"],
//         repoPath: "/Users/chris/enterprise/codevideo/codevideo.io"
//     },
//     {
//         keywords: ["studio.codevideo.io", "Studio", "CodeVideo Studio"],
//         repoPath: "/Users/chris/enterprise/codevideo/studio.codevideo.io"
//     },
//     // types
//     {
//         keywords: ["Types", "CodeVideo Types"],
//         repoPath: "/Users/chris/enterprise/codevideo/codevideo-types"
//     },
//     // exporters
//     {
//         keywords: ["exporters", "CodeVideo Exporters"],
//         repoPath: "/Users/chris/enterprise/codevideo/codevideo-exporters"
//     },
//     // mcp server itself :)
//     {
//         keywords: ["codevideo mcp", "MCP"],
//         repoPath: "/Users/chris/enterprise/codevideo/codevideo-mcp"
//     },
//     // react IDE (GUI layer)
//     {
//         keywords: ["React IDE", "CodeVideo React IDE"],
//         repoPath: "/Users/chris/enterprise/codevideo/codevideo-ide-react"
//     },
//     // virtual IDE
//     {
//         keywords: ["virtual IDE", "CodeVideo Virtual IDE"],
//         repoPath: "/Users/chris/enterprise/codevideo/codevideo-virtual-ide"
//     },
//     // virtual file explorer
//     {
//         keywords: ["virtual file explorer", "CodeVideo Virtual File Explorer"],
//         repoPath: "/Users/chris/enterprise/codevideo/codevideo-virtual-file-explorer"
//     },
//     // virtual terminal
//     {
//         keywords: ["virtual terminal", "CodeVideo Virtual Terminal"],
//         repoPath: "/Users/chris/enterprise/codevideo/codevideo-virtual-terminal"
//     },
//     // virtual mouse
//     {
//         keywords: ["virtual mouse", "CodeVideo Virtual Mouse"],
//         repoPath: "/Users/chris/enterprise/codevideo/codevideo-virtual-mouse"
//     },
//     // virtual author
//     {
//         keywords: ["virtual author", "CodeVideo Virtual Author"],
//         repoPath: "/Users/chris/enterprise/codevideo/codevideo-virtual-author"
//     },
// ]

import { levenshteinDistance } from "../utils/levenshteinDistance.js";

// for compremium
const keywordRepoMap: Array<{ keywords: string[], repoPath: string}> = [
    {
        keywords: ["CPM1", "CPMX1"],
        repoPath: "/Users/chris/solve/compremium/cpm1-software"
    },
    {
        keywords: ["CPM2", "CPMX2"],
        repoPath: "/Users/chris/solve/compremium/cpmx2-software"
    },
    {
        keywords: ["Common", "CPMXCommon", "CPMX Common"],
        repoPath: "/Users/chris/solve/compremium/cpmx-common"
    },
    {
        keywords: ["Connectivity", "CPMXConnectivity", "Cockpit"],
        repoPath: "/Users/chris/solve/compremium/cpm-connectivity"
    },
    {
        keywords: ["CI Components", "CI Components Library", "CI"],
        repoPath: "/Users/chris/solve/compremium/ci-components"
    },
]

// returns the relevant repo path based on the keyword provided
// if no matching keyword is found, it gives context of the nearest matches, i.e. "did you mean...?"
export const listRepoLocations = async (keyword: string) => {
    const keywordLower = keyword.toLowerCase();
    
    // First try exact or substring matches
    const exactMatches = keywordRepoMap.filter(repo => 
        repo.keywords.some(kw => kw.toLowerCase().includes(keywordLower))
    );

    if (exactMatches.length > 0) {
        return {
            content: [{
                type: "text",
                text: `Found matching repo(s): ${exactMatches.map(repo => repo.repoPath).join(", ")}`
            }],
            isError: false
        };
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
            // Get unique repo paths from the closest matches
            const uniqueMatchedRepos = Array.from(new Set(
                fuzzyMatches.map(match => match.repo.repoPath)
            ));
            
            // Show suggested keywords along with their repos
            const suggestions = fuzzyMatches
                .slice(0, 5) // Limit to top 5 suggestions
                .map(match => `${match.keyword} (${match.repo.repoPath})`)
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