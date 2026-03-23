"use client";

import { useState, useEffect } from "react";

/**
 * Retorna true quando a media query corresponde (ex.: "(max-width: 639px)").
 * No SSR/hidratação inicial usa false para evitar mismatch; atualiza no mount.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);

  return matches;
}
