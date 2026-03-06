import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { GraphQuery, GraphQueryResult, WriteCommand, WriteOperation } from "@plasius/graph-contracts";
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
    const hasExistingData = dataRef.current !== null;
    setLoading(!hasExistingData);
    setRevalidating(hasExistingData);
    if (!hasExistingData) {
      setStatus("loading");
    }
    setError(null);
    for (let attempt = 0; attempt <= retryAttempts; attempt += 1) {
      try {
        const result = await client.query(query, { allowStale: true, forceRefresh });
        dataRef.current = result;
        setData(result);
        setStatus("success");
        setLoading(false);
        setRevalidating(false);
        return;
      } catch (queryError) {
        const resolvedError = queryError instanceof Error ? queryError : new Error("Graph query failed");
        const hasRetriesRemaining = attempt < retryAttempts;
        if (!hasRetriesRemaining) {
          setError(resolvedError);
          setStatus("error");
          setLoading(false);
          setRevalidating(false);
          return;
        }

        await wait(retryDelayMs);
      }
    }
  }, [client, query, retryAttempts, retryDelayMs]);

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

export const useGraphMutation = (mutationClient: GraphMutationClient) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (command: WriteCommand) => {
    setLoading(true);
    setError(null);
    try {
      return await mutationClient.write(command);
    } catch (mutationError) {
      const resolvedError = mutationError instanceof Error ? mutationError : new Error("Graph mutation failed");
      setError(resolvedError);
      throw resolvedError;
    } finally {
      setLoading(false);
    }
  }, [mutationClient]);

  return {
    mutate,
    loading,
    error,
  };
};
