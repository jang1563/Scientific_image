# Public Release Checklist

Use this checklist before changing repository visibility, sharing a link with recruiters, or using the project as a portfolio artifact.

## Required Gates

- `node --test tests/*.test.ts` passes.
- `node scripts/public-readiness-audit.ts` passes.
- README and `docs/PORTFOLIO_SCORECARD.md` reflect current asset, workflow-pack, template, and test posture.
- Repository index is understandable without private chat context.
- No private source documents, unpublished manuscript notes, local paths, API keys, personal application material, or internal conversation history are committed.
- Generated QA artifacts remain ignored unless deliberately selected as small examples.

## Portfolio Quality Standard

- The first screen of the README explains what the project is and why it is technically interesting.
- A reviewer can find the web app, API, MCP server, asset system, scene graph, exporters, and tests within two minutes.
- The project demonstrates real engineering depth: schema design, deterministic operations, visual rendering, export handling, agent contracts, and test coverage.
- Claims are specific and verifiable from the repository. Avoid inflated marketing language that the code cannot support.
- Known limitations are named without exposing private plans or internal decision history.

## Privacy And Safety Standard

Do not commit:

- API keys, credentials, tokens, cookies, or `.env` files.
- Private user notes, job application details, planning transcripts, or automation logs.
- Proprietary PDFs, manuscripts, clinical documents, unpublished research data, or collaborator material.
- Absolute local paths or machine-specific setup details.
- Large generated decks, screenshots, or PDFs unless they are intentionally curated and privacy-reviewed.

## Release Loop

1. Run tests and public audit.
2. Read `README.md`, `docs/REPOSITORY_INDEX.md`, and `docs/PORTFOLIO_SCORECARD.md` as if you are an external reviewer.
3. Fix the highest-signal gap only.
4. Re-run verification.
5. Commit with a short message describing the visible repo-quality improvement.
