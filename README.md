# @plasius/graph-client-react

[![npm version](https://img.shields.io/npm/v/@plasius/graph-client-react.svg)](https://www.npmjs.com/package/@plasius/graph-client-react)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Plasius-LTD/graph-client-react/ci.yml?branch=main&label=build&style=flat)](https://github.com/Plasius-LTD/graph-client-react/actions/workflows/ci.yml)
[![coverage](https://img.shields.io/codecov/c/github/Plasius-LTD/graph-client-react)](https://codecov.io/gh/Plasius-LTD/graph-client-react)
[![License](https://img.shields.io/github/license/Plasius-LTD/graph-client-react)](./LICENSE)
[![Code of Conduct](https://img.shields.io/badge/code%20of%20conduct-yes-blue.svg)](./CODE_OF_CONDUCT.md)
[![Security Policy](https://img.shields.io/badge/security%20policy-yes-orange.svg)](./SECURITY.md)
[![Changelog](https://img.shields.io/badge/changelog-md-blue.svg)](./CHANGELOG.md)

React bindings for `@plasius/graph-client-core` query and mutation workflows.

Apache-2.0. ESM + CJS builds. TypeScript types included.

---

## Requirements

- Node.js 24+ (matches `.nvmrc` and CI/CD)
- React 19 (`peerDependencies`)
- `@plasius/graph-client-core`

This package does not require a `react-dom` peer dependency because its public runtime surface is limited to hooks, context, and provider helpers.

---

## Installation

```bash
npm install @plasius/graph-client-react @plasius/graph-client-core
```

---

## Exports

```ts
import {
  GraphClientProvider,
  useGraphClient,
  useGraphQuery,
  useGraphMutation,
  type UseGraphQueryOptions,
  type UseGraphQueryState,
  type UseGraphMutationOptions,
  type GraphMutationClient,
} from "@plasius/graph-client-react";
```

---

## Quick Start

```tsx
import { GraphClient } from "@plasius/graph-client-core";
import { GraphClientProvider, useGraphQuery } from "@plasius/graph-client-react";

const client = new GraphClient({ transport: { async fetch() { return { data: { ok: true }, version: 1 }; } } });

function Profile() {
  const { data, loading, revalidating, error, refresh } = useGraphQuery(
    {
      requests: [{ resolver: "user.profile", key: "user:1" }],
    },
    { retryAttempts: 1, retryDelayMs: 25 },
  );

  if (loading) return <p>Loading</p>;
  if (error) return <p>{error.message}</p>;

  return (
    <button onClick={() => void refresh()}>
      {revalidating ? "Refreshing..." : JSON.stringify(data?.results)}
    </button>
  );
}

export function App() {
  return (
    <GraphClientProvider client={client}>
      <Profile />
    </GraphClientProvider>
  );
}
```

---

## Development

```bash
npm run clean
npm install
npm run lint
npm run typecheck
npm run test:coverage
npm run build
```

---

## Query State Mapping

- `loading`: first request with no cached hook data.
- `revalidating`: refresh/rerender request when prior hook data exists.
- `status`: `"loading" | "success" | "error"` terminal state for last request.
- `error`: normalized to `Error`.

Suspense is intentionally disabled in current package scope (see ADR-0003). Passing `suspense: true` to `useGraphQuery` throws.

Both hooks support optional `telemetry` (from `TelemetrySink`) to emit analytics signals:

- Query: `graph.react.query.run`, `graph.react.query.success`, `graph.react.query.retry`, `graph.react.query.error`
- Mutation: `graph.react.mutation.success`, `graph.react.mutation.error`

---

## Architecture

- Package ADRs: [`docs/adrs`](./docs/adrs)
- Cross-package ADRs: `plasius-ltd-site/docs/adrs/adr-0020` to `adr-0024`

---

## License

Licensed under the [Apache-2.0 License](./LICENSE).

<!-- BEGIN PLASIUS RELEASE INTEGRITY -->
## Release integrity

CI keeps the administrative contributor registry outside Git and npm package
artifacts using exact, case-normalised path checks. Both CI jobs run only for
trusted repository pushes on the literal `Public CI - Quarantined` group with
`[self-hosted, Linux, X64]` labels; there is no hosted fallback, PR event, callable
workflow or caller-selected runner. Jobs have 15/10-minute limits, checkout
credentials are not persisted, and package-manager cache finalization stays
disabled. Clean `npm ci`, lint, types, audit, build, >=80% coverage and final
package-manifest checks remain mandatory. Maintainer branch pushes need explicit
reviewed workflow admission; remove temporary admissions after delivery.
Publication uses the GitHub-hosted `production` job with Node 24 and a pinned
npm 11.6.2 client. It is token-free and proceeds only while the prepared SHA
is the exact `main` head after successful push-triggered CI. Do not dispatch CD
until the npm trusted-publisher binding is verified.

The stored `platform.public-artifact-integrity.enabled` flag controls staged
public restoration, not mandatory admission. Enabled, disabled and rollback
states all retain source/index/final-manifest and publication checks. No new
capability or runtime/API contract is introduced. Rollback disables the affected
workflow/channel or removes its workflow admission; it never restores the
administrative path or changes runner class. See [ADR-0006](docs/adrs/adr-0006-quarantined-push-ci.md).
<!-- END PLASIUS RELEASE INTEGRITY -->
