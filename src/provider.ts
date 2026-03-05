import { createElement, type ReactNode } from "react";

import type { GraphClient } from "@plasius/graph-client-core";
import { GraphClientContext } from "./context.js";

export interface GraphClientProviderProps {
  client: GraphClient;
  children: ReactNode;
}

export function GraphClientProvider(props: GraphClientProviderProps) {
  const { client, children } = props;
  return createElement(GraphClientContext.Provider, { value: client }, children);
}
