"use client";

import { createContext, useContext } from "react";

/**
 * The catalogue, for client components.
 *
 * getT() is server-only — it reads a cookie — so a "use client" component can't
 * look a string up itself. Small components take a `copy` prop from their
 * server parent; that stops working once a component sits three or four levels
 * below the nearest server boundary (a project card inside a marquee inside a
 * filtered grid), where threading the prop would touch every layer in between.
 *
 * So the root layout puts the resolved catalogue in a context once, and
 * anything below reads it with useT(). The whole catalogue for one locale is a
 * few tens of KB — cheaper than the plumbing it replaces, and it means a new
 * string in a leaf component is a one-line change.
 */
const CopyContext = createContext<Record<string, string>>({});

export function I18nProvider({
  messages,
  children,
}: {
  messages: Record<string, string>;
  children: React.ReactNode;
}) {
  return <CopyContext.Provider value={messages}>{children}</CopyContext.Provider>;
}

/**
 * `const t = useT()`, then `t("nav.home")`.
 *
 * Falls back to the second argument, then to the key itself, so a component
 * rendered outside the provider (a test, a preview route) still shows English
 * rather than blanks.
 */
export function useT(): (key: string, fallback?: string) => string {
  const messages = useContext(CopyContext);
  return (key: string, fallback?: string) => messages[key] ?? fallback ?? key;
}
