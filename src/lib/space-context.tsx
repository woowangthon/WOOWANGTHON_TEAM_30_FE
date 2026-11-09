"use client";

import { createContext, useContext } from "react";
import type { Space } from "./api-types.gen";

export interface SpaceCtx {
  space: Space;
  reload: () => Promise<void>;
  base: string; // "/spaces/{id}" 또는 "/sample"
}

export const SpaceContext = createContext<SpaceCtx | null>(null);

export function useSpace(): SpaceCtx {
  const ctx = useContext(SpaceContext);
  if (!ctx) throw new Error("SpaceContext 밖에서 useSpace를 불렀어요");
  return ctx;
}

export function canEdit(space: Space): boolean {
  return !space.is_sample && (space.role === "owner" || space.role === "editor");
}
