# Model Context Protocol (MCP) Servers Collection

This repository contains a collection of Model Context Protocol (MCP) servers that provide various capabilities to Large Language Models (LLMs). It includes both custom implementations and integrations with reference servers from the [modelcontextprotocol-servers](https://github.com/modelcontextprotocol/servers) project.

## Project Structure

```
.
├── src/
│   ├── npm-docs/         # NPM documentation server
│   └── index.ts          # Main entry point
├── modelcontextprotocol-servers/  # Reference implementations (submodule)
├── package.json          # Workspace configuration
├── tsconfig.json         # Base TypeScript configuration
└── tsconfig.build.json   # Build-specific configuration
```

## Available Servers

### Custom Implementations

#### npm-docs
- Provides comprehensive npm package documentation
- Features:
  - Package metadata retrieval
  - Version information
  - Documentation links
  - Repository details
  - Author information
  - Keywords

### Integrated Reference Servers

#### filesystem
- File system operations with configurable allowed directories
- Directory listing, file reading/writing

#### github
- GitHub API integration
- Repository search, content access
- Requires GitHub Personal Access Token

#### memory
- Knowledge graph management
- Entity and relation storage
- Observation tracking

#### puppeteer
- Browser automation
- Page navigation
- Screenshot capture
- Element interaction

#### git
- Local git repository operations
- Status checking
- Repository management

#### fetch
- Web content retrieval
- HTML to markdown conversion
- Content extraction

#### time
- Timezone operations
- Current time retrieval
- Time conversion

## Prerequisites

1. Node.js environment for TypeScript servers:
   ```bash
   # Install Node.js dependencies
   npm install
   ```

2. Python environment for Python-based servers:
   ```bash
   # Create and activate conda environment
   conda create -n mcp-servers python=3.12
   conda activate mcp-servers

   # Install Python dependencies
   cd modelcontextprotocol-servers/src/git && pip install .
   cd ../fetch && pip install .
   cd ../time && pip install .
   ```

## Setup

1. Clone the repository:
```bash
git clone https://github.com/chris-bluera/MCP.git
cd MCP
```

2. Install dependencies (with conda environment activated):
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Configure environment variables:
- GitHub token for GitHub server
- Any other server-specific configurations

## Using with Cline

1. Configure MCP settings in Cline:
   - For Cursor: Edit `~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
   - For Claude Desktop: Edit `~/Library/Application Support/Claude/claude_desktop_config.json`

2. Add server configurations:
```json
{
  "mcpServers": {
    "mcp-npm-docs": {
      "command": "node",
      "args": ["/path/to/MCP/build/index.js"]
    },
    "filesystem": {
      "command": "node",
      "args": [
        "/path/to/MCP/modelcontextprotocol-servers/src/filesystem/dist/index.js",
        "/allowed/directory/path"
      ]
    },
    "github": {
      "command": "node",
      "args": ["/path/to/MCP/modelcontextprotocol-servers/src/github/dist/index.js"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token-here"
      }
    },
    "memory": {
      "command": "node",
      "args": ["/path/to/MCP/modelcontextprotocol-servers/src/memory/dist/index.js"]
    },
    "puppeteer": {
      "command": "node",
      "args": ["/path/to/MCP/modelcontextprotocol-servers/src/puppeteer/dist/index.js"],
      "env": {
        "DOCKER_CONTAINER": "true"
      }
    },
    "git": {
      "command": "python3",
      "args": ["-m", "mcp_server_git"]
    },
    "fetch": {
      "command": "python3",
      "args": ["-m", "mcp_server_fetch"]
    },
    "time": {
      "command": "python3",
      "args": ["-m", "mcp_server_time"]
    }
  }
}
```

3. Important Notes:
   - Python servers require the conda environment to be active
   - Replace `/path/to/MCP` with your actual repository path
   - Adjust allowed directories for filesystem server
   - Set up proper environment variables (e.g., GitHub token)

### Example Tool Usage in Cline

```typescript
// Get npm package documentation
<use_mcp_tool>
<server_name>mcp-npm-docs</server_name>
<tool_name>get_package_docs</tool_name>
<arguments>
{
  "package": "express"
}
</arguments>
</use_mcp_tool>

// Get current time
<use_mcp_tool>
<server_name>time</server_name>
<tool_name>get_current_time</tool_name>
<arguments>
{
  "timezone": "America/New_York"
}
</arguments>
</use_mcp_tool>

// List directory contents
<use_mcp_tool>
<server_name>filesystem</server_name>
<tool_name>list_directory</tool_name>
<arguments>
{
  "path": "/allowed/directory/path"
}
</arguments>
</use_mcp_tool>
```

## Development

Each server is maintained as a separate module under the `src/` directory. To add a new server:

1. Create a new directory under `src/`
2. Add server-specific package.json and tsconfig.json
3. Implement the server using the MCP SDK
4. Add the server to the main entry point
5. Configure in Cline settings

## Testing

All servers have been tested and verified working:
- Package documentation retrieval
- File system operations
- GitHub API integration
- Knowledge graph management
- Browser automation
- Git operations
- Web content fetching
- Time operations

## License

MIT
