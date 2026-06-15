# npm Package Release

This project is prepared for npm registry distribution as a local stdio MCP server package.

Package target:

- Package name: `@jang1563/scientific-image`
- CLI bin: `scientific-image-mcp`
- Registry: `https://registry.npmjs.org/`
- Access: public
- Runtime: Node `>=24`
- License metadata: `SEE LICENSE IN LICENSE`

The package ships source files because the current MVP intentionally runs on Node 24 without a build step. The MCP server starts from `bin/scientific-image-mcp.js` and imports the source modules directly.

## User Install Path

After the package is published, users can connect an MCP client with `npx`:

```json
{
  "mcpServers": {
    "scientific-image": {
      "command": "npx",
      "args": ["-y", "-p", "@jang1563/scientific-image", "scientific-image-mcp"]
    }
  }
}
```

Codex config:

```toml
[mcp_servers.scientific-image]
command = "npx"
args = ["-y", "-p", "@jang1563/scientific-image", "scientific-image-mcp"]
startup_timeout_sec = 30
tool_timeout_sec = 120
```

Users who prefer a global install can run:

```bash
npm install -g @jang1563/scientific-image
scientific-image-mcp
```

## Release Checklist

Run these commands before publishing:

```bash
node scripts/npm-package-readiness.ts
node scripts/public-readiness-audit.ts
node --test tests/*.test.ts
npm pack --dry-run
```

After logging in to npm, run the publish dry-run:

```bash
npm login
npm publish --dry-run --access public
```

Then publish only after confirming the npm account owns the `@jang1563` scope and the dry-run tarball contents look correct:

```bash
npm publish --access public
```

## What The Package Includes

The `files` whitelist in `package.json` includes:

- `bin/scientific-image-mcp.js`
- `packages/` source modules for MCP, agent resources, assets, scene, deck, plotting, and export
- `apps/api/src/` and `apps/web/` for local inspection surfaces
- public docs, examples, and MCP client setup files
- package readiness and public readiness scripts

Ignored local artifacts such as `output/`, `.scientific-image/`, `.playwright-cli/`, `node_modules/`, and environment files must stay out of the tarball.

## Notes

This is not a hosted MCP service. It is a local-first package that runs an MCP stdio server on the user's machine. Agents should still keep structured scene JSON as the source of truth and use asset IDs, workflow packs, template IDs, style profiles, semantic slots, and appearance overrides rather than raw SVG.
