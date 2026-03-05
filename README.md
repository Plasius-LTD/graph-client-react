# @plasius/graph-client-react

[![npm version](https://img.shields.io/npm/v/@plasius/graph-client-react.svg)](https://www.npmjs.com/package/@plasius/graph-client-react)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Plasius-LTD/graph-client-react/ci.yml?branch=main&label=build&style=flat)](https://github.com/Plasius-LTD/graph-client-react/actions/workflows/ci.yml)
[![coverage](https://img.shields.io/codecov/c/github/Plasius-LTD/graph-client-react)](https://codecov.io/gh/Plasius-LTD/graph-client-react)
[![License](https://img.shields.io/github/license/Plasius-LTD/graph-client-react)](./LICENSE)
[![Code of Conduct](https://img.shields.io/badge/code%20of%20conduct-yes-blue.svg)](./CODE_OF_CONDUCT.md)
[![Security Policy](https://img.shields.io/badge/security%20policy-yes-orange.svg)](./SECURITY.md)
[![Changelog](https://img.shields.io/badge/changelog-md-blue.svg)](./CHANGELOG.md)

[![CI](https://github.com/Plasius-LTD/graph-client-react/actions/workflows/ci.yml/badge.svg)](https://github.com/Plasius-LTD/graph-client-react/actions/workflows/ci.yml)
[![CD](https://github.com/Plasius-LTD/graph-client-react/actions/workflows/cd.yml/badge.svg)](https://github.com/Plasius-LTD/graph-client-react/actions/workflows/cd.yml)

React bindings for `@plasius/graph-client-core` query and mutation workflows.

Apache-2.0. ESM + CJS builds. TypeScript types included.

---

## Requirements

- Node.js 24+ (matches `.nvmrc` and CI/CD)
- React 19 (`peerDependencies`)
- `@plasius/graph-client-core`

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
  const { data, loading, error, refresh } = useGraphQuery({
    requests: [{ resolver: "user.profile", key: "user:1" }],
  });

  if (loading) return <p>Loading</p>;
  if (error) return <p>{error.message}</p>;

  return <button onClick={() => void refresh()}>{JSON.stringify(data?.results)}</button>;
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

## Architecture

- Package ADRs: [`docs/adrs`](./docs/adrs)
- Cross-package ADRs: `plasius-ltd-site/docs/adrs/adr-0020` to `adr-0024`

---

## License

Licensed under the [Apache-2.0 License](./LICENSE).
