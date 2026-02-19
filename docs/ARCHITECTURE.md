# DarkForge PoC Architecture

## Core Loop
1. Human files intake issue
2. PM expands requirements and scenarios
3. TPM proposes technical options
4. Architect emits task DAG
5. Orchestrator reconciles and unblocks tasks
6. Engineers implement tasks
7. Reviewer + fix loop
8. CI + QA checks
9. Policy gate decides merge readiness
10. Merge triggers docs ticket

## State Model
Task states: blocked -> ready -> in_progress -> done

## Why this PoC works
- Deterministic dependency model
- GitHub-native primitives
- Extendable scripts where YAML becomes brittle
