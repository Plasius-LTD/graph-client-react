import { createContext, useContext } from "react";

import type { GraphClient } from "@plasius/graph-client-core";

export const GraphClientContext = createContext<GraphClient | null>(null);

export const useGraphClient = (): GraphClient => {
  const client = useContext(GraphClientContext);
  if (!client) {
    throw new Error("GraphClientContext is missing. Wrap your tree in GraphClientProvider.");
  }

  return client;
};
