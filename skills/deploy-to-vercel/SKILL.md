---
name: deploy-to-vercel
description: Publishes a website to the user's Vercel project through its existing Git integration or authenticated CLI, verifies the build, and returns the deployment URL. Use for Vercel deployment requests.
license: MIT
---

# Deploy a website to Vercel

This is an independently authored portable workflow for Antigravity. Use the environment's actual Vercel connector or CLI; no Codex-specific deployment helper is required.

## Resolve the target

Inspect the working directory, Git branch, remote, and changes. Read `.vercel/project.json` or `.vercel/repo.json` if present to resolve the project and team. Check `command -v vercel` before using the CLI. Use existing authentication; if missing, let the user complete the normal Vercel login flow. Never ask for credentials in chat or print environment values.

Prefer the linked project and team. If several plausible destinations remain, resolve the destination before creating or transferring any project. Preserve existing files and user changes. A deployment request does not authorize changing account ownership or access permissions.

## Prepare and deploy

- Honor the requested target; use a preview when production was not requested. A push to a configured production branch may deploy production automatically, so inspect the branch mapping first.
- Use the project's documented build and validation commands. Check output directory, API routes, runtime version, environment variable names, and persistent storage requirements.
- Prefer existing Git-connected deployment when authorized. Stage only intended files, commit, and push the explicit branch. Reuse authorization already given by the user for this deployment.
- For a direct CLI preview, use the installed CLI's documented deploy command with an explicit project location and team scope. Common invocation: `vercel deploy <project-path> --scope <team-slug> --yes --no-wait`. Confirm flags with local help if the installed version differs.
- Create missing projects, add integrations, or install tooling only when those actions are within the user's requested deployment scope. Do not silently fall back to another account or unknown upload service.

## Verify and hand off

Wait for a concrete READY state using the connector, provider status check, or `vercel inspect <deployment-url> --scope <team-slug>`. Inspect build logs on failure and fix failures within scope. A successful Git push alone is not proof of a successful deployment.

Return the actual deployment URL and target. Report outstanding authentication, environment variables, storage, or domain verification separately. Never say a deployment works when only the code build passed locally.
