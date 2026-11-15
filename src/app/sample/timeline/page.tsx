"use client";

import { Suspense } from "react";
import { useSpace } from "@/lib/space-context";
import { TimelineView } from "@/components/TimelineView";

export default function SampleTimeline() {
  const { space } = useSpace();
  return (
    <Suspense>
      <TimelineView space={space} canFavorite={false} />
    </Suspense>
  );
}
