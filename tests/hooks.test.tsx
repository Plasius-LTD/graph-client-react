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
    expect(result.current.status).toBe("success");
    expect(result.current.revalidating).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data?.results["user:1"]?.data).toEqual({ id: 1 });

    await act(async () => {
      await result.current.refresh();
    });

    expect(querySpy).toHaveBeenCalledWith(query, { allowStale: true, forceRefresh: true });
  });

  it("sets revalidation state while force refresh is in flight", async () => {
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
    let resolveRefresh: ((value: Awaited<ReturnType<typeof querySpy>>) => void) | undefined;
    querySpy.mockImplementationOnce(async () => ({
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
    querySpy.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRefresh = resolve;
        }),
    );

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <GraphClientProvider client={{ query: querySpy } as unknown as GraphClient}>{children}</GraphClientProvider>
    );

    const { result } = renderHook(
      () => useGraphQuery(query),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).not.toBeNull();
    });

    let refreshPromise: Promise<void> | undefined;
    act(() => {
      refreshPromise = result.current.refresh();
    });

    expect(result.current.revalidating).toBe(true);
    expect(result.current.loading).toBe(false);

    resolveRefresh?.({
      partial: false,
      stale: false,
      generatedAtEpochMs: Date.now(),
      results: {
        "user:1": {
          key: "user:1",
          data: { id: 2 },
          stale: false,
          tags: ["user"],
        },
      },
      errors: [],
    });

    await act(async () => {
      await refreshPromise;
    });

    expect(result.current.revalidating).toBe(false);
    expect(result.current.data?.results["user:1"]?.data).toEqual({ id: 2 });
  });

  it("retries query execution when configured", async () => {
    const querySpy = vi
      .fn()
      .mockRejectedValueOnce(new Error("transient"))
      .mockResolvedValueOnce({
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
      });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <GraphClientProvider client={{ query: querySpy } as unknown as GraphClient}>{children}</GraphClientProvider>
    );

    const { result } = renderHook(
      () => useGraphQuery(query, { retryAttempts: 1, retryDelayMs: 0 }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });

    expect(querySpy).toHaveBeenCalledTimes(2);
    expect(result.current.error).toBeNull();
  });

  it("reruns query for changed inputs on rerender", async () => {
    const querySpy = vi.fn(async (input: GraphQuery) => ({
      partial: false,
      stale: false,
      generatedAtEpochMs: Date.now(),
      results: {
        [input.requests[0]!.key]: {
          key: input.requests[0]!.key,
          data: { key: input.requests[0]!.key },
          stale: false,
          tags: ["user"],
        },
      },
      errors: [],
    }));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <GraphClientProvider client={{ query: querySpy } as unknown as GraphClient}>{children}</GraphClientProvider>
    );

    const { result, rerender } = renderHook(
      ({ currentQuery }: { currentQuery: GraphQuery }) => useGraphQuery(currentQuery),
      {
        initialProps: { currentQuery: query },
        wrapper,
      },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    rerender({
      currentQuery: {
        requests: [{ resolver: "user.profile", key: "user:2" }],
      },
    });

    await waitFor(() => {
      expect(result.current.data?.results["user:2"]?.data).toEqual({ key: "user:2" });
    });

    expect(querySpy).toHaveBeenNthCalledWith(2, {
      requests: [{ resolver: "user.profile", key: "user:2" }],
    }, { allowStale: true, forceRefresh: false });
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
    expect(result.current.status).toBe("error");
    expect(result.current.error?.message).toBe("Graph query failed");
  });

  it("throws when suspense option is enabled", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <GraphClientProvider
        client={{ query: vi.fn(async () => ({ partial: false, stale: false, generatedAtEpochMs: 0, results: {}, errors: [] })) } as unknown as GraphClient}
      >
        {children}
      </GraphClientProvider>
    );

    expect(() => renderHook(() => useGraphQuery(query, { suspense: true }), { wrapper })).toThrow(
      "Suspense mode is not supported by useGraphQuery. Use loading/error/revalidating state mapping.",
    );
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
