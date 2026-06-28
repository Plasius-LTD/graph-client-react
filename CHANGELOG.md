# Changelog

All notable changes to this project will be documented in this file.

The format is based on **[Keep a Changelog](https://keepachangelog.com/en/1.1.0/)**, and this project adheres to **[Semantic Versioning](https://semver.org/spec/v2.0.0.html)**.

---

## [Unreleased]

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.11] - 2026-06-28

- **Added**
  - (placeholder)

- **Changed**
  - Refreshed the published `@plasius/graph-client-core` and `@plasius/graph-contracts` dependencies to their latest released versions.
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.10] - 2026-06-22

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.9] - 2026-06-22

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.7] - 2026-06-01

- **Added**
  - (placeholder)

- **Changed**
  - Removed the unused `react-dom` peer dependency so the published package contract matches the hook/context/provider runtime surface.

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.6] - 2026-05-13

- **Added**
  - (placeholder)

- **Changed**
  - Refreshed dependencies to the latest stable published versions.
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.5] - 2026-05-13

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.4] - 2026-04-21

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.3] - 2026-04-02

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.2] - 2026-03-06

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
[0.1.2]: https://github.com/Plasius-LTD/graph-client-react/releases/tag/v0.1.2
[0.1.3]: https://github.com/Plasius-LTD/graph-client-react/releases/tag/v0.1.3
[0.1.4]: https://github.com/Plasius-LTD/graph-client-react/releases/tag/v0.1.4
[0.1.5]: https://github.com/Plasius-LTD/graph-client-react/releases/tag/v0.1.5
[0.1.6]: https://github.com/Plasius-LTD/graph-client-react/releases/tag/v0.1.6
[0.1.7]: https://github.com/Plasius-LTD/graph-client-react/releases/tag/v0.1.7
[0.1.9]: https://github.com/Plasius-LTD/graph-client-react/releases/tag/v0.1.9
[0.1.10]: https://github.com/Plasius-LTD/graph-client-react/releases/tag/v0.1.10
[0.1.11]: https://github.com/Plasius-LTD/graph-client-react/releases/tag/v0.1.11
