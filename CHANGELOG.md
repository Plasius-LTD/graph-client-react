# Changelog

All notable changes to this project will be documented in this file.

The format is based on **[Keep a Changelog](https://keepachangelog.com/en/1.1.0/)**, and this project adheres to **[Semantic Versioning](https://semver.org/spec/v2.0.0.html)**.

---

## [Unreleased]

- **Added**
  - `UseGraphQueryOptions` retry controls (`retryAttempts`, `retryDelayMs`).
  - `revalidating` and `status` fields for consistent query state mapping.
  - Optional hook-level telemetry support for query and mutation observability.
  - ADR-0003 documenting non-suspense hook decision.
  - Hook tests for rerender, retry, and revalidation transitions.
  - Hook tests for telemetry emission on success/error paths.

- **Changed**
  - `useGraphQuery` now explicitly rejects `suspense: true`.
  - README query-state documentation and examples.

- **Fixed**
  - N/A

- **Security**
  - N/A

## [0.1.1] - 2026-03-05

### Added

- Initial package scaffolding.
- Initial source implementation and baseline tests.
- CI/CD workflow baseline for GitHub Actions and npm publish path.


[0.1.1]: https://github.com/Plasius-LTD/graph-client-react/releases/tag/v0.1.1
