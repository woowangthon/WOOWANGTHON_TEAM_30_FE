"use client";

import { useSpace } from "@/lib/space-context";
import { SpaceHome } from "@/components/SpaceHome";

export default function SpaceHomePage() {
  const { space, base } = useSpace();
  return <SpaceHome space={space} base={base} />;
}
