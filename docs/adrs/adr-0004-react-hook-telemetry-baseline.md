# ADR-0004: React Hook Telemetry Baseline

## Status

- Accepted
- Date: 2026-03-06
- Version: 1.0

## Context

React hook consumers need visibility into query and mutation behavior (retries, failures, latency) to detect frontend graph access issues early.

## Decision

- Add optional `telemetry` to query/mutation hook options.
- Emit query lifecycle metrics (`run`, `success`, `retry`, `error`).
- Emit mutation success/error metrics and structured errors.

## Consequences

- UI-level graph failures are observable without forcing any analytics SDK dependency.
- Hook analytics remain opt-in and composable through `TelemetrySink`.
