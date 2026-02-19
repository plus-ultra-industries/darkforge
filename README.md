# DarkForge

DarkForge is a GitHub Actions-native autonomous software factory PoC.

## Vision
Install workflows in any repo and get a role-based AI pipeline:
Human -> PM -> TPM -> Architect -> Engineers -> Review -> QA -> Merge -> Docs ticket.

## PoC Goals
- Deterministic, label/state-driven orchestration
- Task DAG with dependency-aware unblocking
- Policy gate with CI + QA + satisfaction threshold
- Minimal external infra: GitHub Actions + scripts

## Quick Start
1. Add required repo secrets:
   - `OPENAI_API_KEY` (or model provider key)
   - `DARKFACTORY_GITHUB_TOKEN` (fine-grained PAT, optional if GITHUB_TOKEN perms are enough)
2. Open an issue and add label `df:intake`.
3. Trigger orchestrator manually from Actions tab (`orchestrator.yml`) if needed.

## Status
PoC scaffold only (workflows + schemas + script stubs).
