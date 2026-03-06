import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { GraphQuery, GraphQueryResult, TelemetrySink, WriteCommand, WriteOperation } from "@plasius/graph-contracts";
import { useGraphClient } from "./context.js";

export interface UseGraphQueryState {
  data: GraphQueryResult | null;
  error: Error | null;
  loading: boolean;
  revalidating: boolean;
  status: "loading" | "success" | "error";
  refresh: () => Promise<void>;
}

export interface UseGraphQueryOptions {
  retryAttempts?: number;
  retryDelayMs?: number;
  suspense?: boolean;
  telemetry?: TelemetrySink;
}

const wait = async (delayMs: number): Promise<void> => {
  if (delayMs <= 0) {
    return;
  }

  await new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
};

export const useGraphQuery = (query: GraphQuery, options: UseGraphQueryOptions = {}): UseGraphQueryState => {
  const client = useGraphClient();
  const retryAttempts = Math.max(0, options.retryAttempts ?? 0);
  const retryDelayMs = Math.max(0, options.retryDelayMs ?? 0);
  const telemetry = options.telemetry;
  if (options.suspense) {
    throw new Error("Suspense mode is not supported by useGraphQuery. Use loading/error/revalidating state mapping.");
  }

  const [data, setData] = useState<GraphQueryResult | null>(null);
  const dataRef = useRef<GraphQueryResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [revalidating, setRevalidating] = useState<boolean>(false);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const run = useCallback(async (forceRefresh = false) => {
    const startedAt = Date.now();
    const hasExistingData = dataRef.current !== null;
    setLoading(!hasExistingData);
    setRevalidating(hasExistingData);
    if (!hasExistingData) {
      setStatus("loading");
    }
    telemetry?.metric({
      name: "graph.react.query.run",
      value: 1,
      unit: "count",
      tags: {
        forceRefresh: forceRefresh ? "true" : "false",
        hasExistingData: hasExistingData ? "true" : "false",
      },
    });
    setError(null);
    for (let attempt = 0; attempt <= retryAttempts; attempt += 1) {
      try {
        const result = await client.query(query, { allowStale: true, forceRefresh });
        dataRef.current = result;
        setData(result);
        setStatus("success");
        setLoading(false);
        setRevalidating(false);
        telemetry?.metric({
          name: "graph.react.query.success",
          value: Date.now() - startedAt,
          unit: "ms",
          tags: {
            attempt: String(attempt + 1),
          },
        });
        return;
      } catch (queryError) {
        const resolvedError = queryError instanceof Error ? queryError : new Error("Graph query failed");
        const hasRetriesRemaining = attempt < retryAttempts;
        if (!hasRetriesRemaining) {
          setError(resolvedError);
          setStatus("error");
          setLoading(false);
          setRevalidating(false);
          telemetry?.metric({
            name: "graph.react.query.error",
            value: 1,
            unit: "count",
          });
          telemetry?.error({
            message: resolvedError.message,
            source: "graph-client-react.useGraphQuery",
            code: "GRAPH_REACT_QUERY_FAILED",
          });
          return;
        }

        telemetry?.metric({
          name: "graph.react.query.retry",
          value: 1,
          unit: "count",
          tags: {
            attempt: String(attempt + 1),
          },
        });
        await wait(retryDelayMs);
      }
    }
  }, [client, query, retryAttempts, retryDelayMs, telemetry]);

  useEffect(() => {
    void run(false);
  }, [run]);

  const refresh = useCallback(async () => {
    await run(true);
  }, [run]);

  return useMemo(
    () => ({ data, error, loading, revalidating, status, refresh }),
    [data, error, loading, revalidating, status, refresh],
  );
};

export interface GraphMutationClient {
  write(command: WriteCommand): Promise<WriteOperation>;
}

export interface UseGraphMutationOptions {
  telemetry?: TelemetrySink;
}

export const useGraphMutation = (mutationClient: GraphMutationClient, options: UseGraphMutationOptions = {}) => {
  const telemetry = options.telemetry;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (command: WriteCommand) => {
    const startedAt = Date.now();
    setLoading(true);
    setError(null);
    try {
      const operation = await mutationClient.write(command);
      telemetry?.metric({
        name: "graph.react.mutation.success",
        value: Date.now() - startedAt,
        unit: "ms",
        tags: {
          state: operation.state,
        },
      });
      return operation;
    } catch (mutationError) {
      const resolvedError = mutationError instanceof Error ? mutationError : new Error("Graph mutation failed");
      setError(resolvedError);
      telemetry?.metric({
        name: "graph.react.mutation.error",
        value: 1,
        unit: "count",
      });
      telemetry?.error({
        message: resolvedError.message,
        source: "graph-client-react.useGraphMutation",
        code: "GRAPH_REACT_MUTATION_FAILED",
      });
      throw resolvedError;
    } finally {
      setLoading(false);
    }
  }, [mutationClient, telemetry]);

  return {
    mutate,
    loading,
    error,
  };
};
