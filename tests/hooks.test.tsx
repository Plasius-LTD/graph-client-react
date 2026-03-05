import { waitFor } from "@testing-library/dom";
import { act, renderHook } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import type { GraphClient } from "@plasius/graph-client-core";
import type { GraphQuery, WriteCommand, WriteOperation } from "@plasius/graph-contracts";
import { GraphClientProvider } from "../src/provider.js";
import { useGraphMutation, useGraphQuery } from "../src/hooks.js";

const query: GraphQuery = {
  requests: [{ resolver: "user.profile", key: "user:1" }],
};

const command: WriteCommand = {
  idempotencyKey: "idem-1",
  partitionKey: "user",
  aggregateKey: "user:1",
  payload: { id: 1 },
  submittedAtEpochMs: 1,
};

const operation: WriteOperation = {
  operationId: "op-1",
  state: "accepted",
  partitionKey: "user",
  aggregateKey: "user:1",
  acceptedAtEpochMs: 1,
  updatedAtEpochMs: 1,
};

describe("useGraphQuery", () => {
  it("loads query data and supports forced refresh", async () => {
    const querySpy = vi.fn(async () => ({
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
    }));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <GraphClientProvider client={{ query: querySpy } as unknown as GraphClient}>{children}</GraphClientProvider>
    );

    const { result } = renderHook(
      () => useGraphQuery(query),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(querySpy).toHaveBeenCalledWith(query, { allowStale: true, forceRefresh: false });
    expect(result.current.error).toBeNull();
    expect(result.current.data?.results["user:1"]?.data).toEqual({ id: 1 });

    await act(async () => {
      await result.current.refresh();
    });

    expect(querySpy).toHaveBeenCalledWith(query, { allowStale: true, forceRefresh: true });
  });

  it("normalizes query errors when non-Error values are thrown", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <GraphClientProvider
        client={{ query: vi.fn(async () => { throw "boom"; }) } as unknown as GraphClient}
      >
        {children}
      </GraphClientProvider>
    );

    const { result } = renderHook(
      () => useGraphQuery(query),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error?.message).toBe("Graph query failed");
  });

  it("throws if hook is used outside provider", () => {
    expect(() => renderHook(() => useGraphQuery(query))).toThrow(
      "GraphClientContext is missing. Wrap your tree in GraphClientProvider.",
    );
  });
});

describe("useGraphMutation", () => {
  it("returns write operation for successful mutation", async () => {
    const mutationClient = { write: vi.fn(async () => operation) };
    const { result } = renderHook(() => useGraphMutation(mutationClient));

    await act(async () => {
      const response = await result.current.mutate(command);
      expect(response).toEqual(operation);
    });

    expect(mutationClient.write).toHaveBeenCalledWith(command);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("normalizes mutation errors when non-Error values are thrown", async () => {
    const mutationClient = { write: vi.fn(async () => { throw "queue-down"; }) };
    const { result } = renderHook(() => useGraphMutation(mutationClient));

    await act(async () => {
      await expect(result.current.mutate(command)).rejects.toThrow("Graph mutation failed");
    });

    expect(result.current.error?.message).toBe("Graph mutation failed");
    expect(result.current.loading).toBe(false);
  });
});
