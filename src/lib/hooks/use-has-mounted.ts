import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/**
 * True only after client hydration. Implemented via useSyncExternalStore
 * (server snapshot = false, client snapshot = true) rather than a
 * `useEffect(() => setState(true), [])`, which the stricter React Compiler
 * / react-hooks lint rule flags as a cascading-render anti-pattern.
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
