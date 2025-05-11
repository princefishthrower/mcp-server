import { levenshteinDistance } from "../utils/levenshteinDistance.js";

// for codevideo
const codevideoRootDir = "/Users/chris/enterprise/codevideo";
const codevideoKeywordRepoMap: Array<{ keywords: string[], repoPath: string}> = [
    // homepage
    {
        keywords: ["codevideo.io", "CodeVideo homepage"],
        repoPath: `${codevideoRootDir}/codevideo.io`
    },
    // studio
    {
        keywords: ["studio.codevideo.io", "Studio", "CodeVideo Studio"],
        repoPath: `${codevideoRootDir}/studio.codevideo.io`
    },
    // types
    {
        keywords: ["Types", "CodeVideo Types"],
        repoPath: `${codevideoRootDir}/codevideo-types`
    },
    // adapters
    {
        keywords: ["adapters", "CodeVideo Adapters"],
        repoPath: `${codevideoRootDir}/codevideo-adapters`
    },
    // projections
    {
        keywords: ["projections", "CodeVideo Projections"],
        repoPath: `${codevideoRootDir}/codevideo-projections`
    },
    // GUI
    {
        keywords: ["React IDE", "CodeVideo React IDE"],
        repoPath: `${codevideoRootDir}/codevideo-ide-react`
    },
    // virtual IDE
    {
        keywords: ["virtual IDE", "CodeVideo Virtual IDE"],
        repoPath: `${codevideoRootDir}/codevideo-virtual-ide`
    },
    // virtual file explorer
    {
        keywords: ["virtual file explorer", "CodeVideo Virtual File Explorer"],
        repoPath: `${codevideoRootDir}/codevideo-virtual-file-explorer`
    },
    // virtual terminal
    {
        keywords: ["virtual terminal", "CodeVideo Virtual Terminal"],
        repoPath: `${codevideoRootDir}/codevideo-virtual-terminal`
    },
    // virtual mouse
    {
        keywords: ["virtual mouse", "CodeVideo Virtual Mouse"],
        repoPath: `${codevideoRootDir}/codevideo-virtual-mouse`
    },
    // virtual author
    {
        keywords: ["virtual author", "CodeVideo Virtual Author"],
        repoPath: `${codevideoRootDir}/codevideo-virtual-author`
    },
]


// for compremium / docsascode
const compremiumRootDir = "/Users/chris/enterprise/compremium";
const solveKeywordRepoMap: Array<{ keywords: string[], repoPath: string}> = [
    {
        keywords: ["CPM1", "CPMX1"],
        repoPath: `${compremiumRootDir}cpm1-software`
    },
    {
        keywords: ["CPM2", "CPMX2"],
        repoPath: `${compremiumRootDir}cpmx2-software`
    },
    {
        keywords: ["Common", "CPMXCommon", "CPMX Common"],
        repoPath: `${compremiumRootDir}cpmx-common`
    },
    {
        keywords: ["Connectivity", "CPMXConnectivity", "Cockpit"],
        repoPath: `${compremiumRootDir}cpm-connectivity`
    },
    {
        keywords: ["CI Components", "CI Components Library", "CI"],
        repoPath: `${compremiumRootDir}ci-components`
    },
    {
        keywords: ["docsascode", "Docs as Code", "docsascode-generator"],
        repoPath: "/Users/chris/solve/docsascode-generator"
    }
]

// for fullstackcraft
const fullstackcraftKeywordRepoMap: Array<{ keywords: string[], repoPath: string}> = [
    {
        keywords: ["fullstackcraft", "Fullstack Craft website"],
        repoPath: "/Users/chris/enterprise/fullstackcraft.com"
    },
    {
        keywords: ["Chris Blog", "Chris Full Stack Blog"],
        repoPath: "/Users/chris/enterprise/chrisfrew.in"
    },
    {
        keywords: ["MCP server", "mcpserver"],
        repoPath: "/Users/chris/playground/mcp-server"
    }
]

// returns the relevant repo path based on the keyword provided
// if no matching keyword is found, it gives context of the nearest matches, i.e. "did you mean...?"
export const listRepoLocations = async (environment: string, keyword: string) => {
    const keywordLower = keyword.toLowerCase();
    let keywordRepoMap: Array<{ keywords: string[], repoPath: string}> = [];
    
    if (environment === "codevideo") {
        keywordRepoMap = codevideoKeywordRepoMap;
    } else if (environment === "solve") {
        keywordRepoMap = solveKeywordRepoMap;
    } else if (environment === "fullstackcraft") {
        keywordRepoMap = fullstackcraftKeywordRepoMap;
    }
    
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