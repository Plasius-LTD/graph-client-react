import { useCallback, useEffect, useMemo, useState } from "react";

import type { GraphQuery, GraphQueryResult, WriteCommand, WriteOperation } from "@plasius/graph-contracts";
import { useGraphClient } from "./context.js";

export interface UseGraphQueryState {
  data: GraphQueryResult | null;
  error: Error | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

export const useGraphQuery = (query: GraphQuery): UseGraphQueryState => {
  const client = useGraphClient();
  const [data, setData] = useState<GraphQueryResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const run = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await client.query(query, { allowStale: true, forceRefresh });
      setData(result);
    } catch (queryError) {
      const resolvedError = queryError instanceof Error ? queryError : new Error("Graph query failed");
      setError(resolvedError);
    } finally {
      setLoading(false);
    }
  }, [client, query]);

  useEffect(() => {
    void run(false);
  }, [run]);

  const refresh = useCallback(async () => {
    await run(true);
  }, [run]);

  return useMemo(
    () => ({ data, error, loading, refresh }),
    [data, error, loading, refresh],
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
