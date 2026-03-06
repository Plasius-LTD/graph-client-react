# ADR-0003: Non-Suspense Hook Contract

## Status

- Accepted
- Date: 2026-03-06
- Version: 1.0

## Context

Consumers need predictable loading, error, and revalidation semantics across mixed React runtimes. Suspense can be adopted later, but inconsistent fallback boundaries across hosts would make current behavior hard to reason about.

## Decision

- `useGraphQuery` is explicitly non-suspense in the current contract.
- Hook state is surfaced via deterministic fields:
  - `loading` for first fetch without prior data,
  - `revalidating` for refresh/rerender fetch with prior data,
  - `error` + `status` for terminal fetch outcome.
- Retry behavior is opt-in and configured in hook options.
- Enabling `suspense` currently throws to avoid accidental mixed behavior.

## Consequences

- Consumers have stable behavior without requiring Suspense boundaries.
- Host apps can migrate to Suspense later via a deliberate ADR and major version update.
- Hook tests focus on rerender, retry, and revalidation transitions.
