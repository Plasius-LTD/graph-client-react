import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import type { GraphClient } from "@plasius/graph-client-core";
import type { GraphQuery } from "@plasius/graph-contracts";
import { GraphClientProvider } from "../src/provider.js";
import { useGraphQuery } from "../src/hooks.js";

describe("useGraphQuery", () => {
  it("loads query data from graph client", async () => {
    const query: GraphQuery = {
      requests: [{ resolver: "user.profile", key: "user:1" }],
    };

    const fakeClient: Pick<GraphClient, "query"> = {
      async query() {
        return {
          partial: false,
          stale: false,
          generatedAtEpochMs: Date.now(),
          results: {
            "user:1": {
              key: "user:1",
              data: { id: 1 },
              stale: false,
              tags: ["user"],
            },
          },
          errors: [],
        };
      },
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <GraphClientProvider client={fakeClient as GraphClient}>{children}</GraphClientProvider>
    );

    const { result } = renderHook(
      () => useGraphQuery(query),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.data?.results["user:1"]?.data).toEqual({ id: 1 });
  });
});
