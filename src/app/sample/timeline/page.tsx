"use client";

import { useSpace } from "@/lib/space-context";
import { TimelineView } from "@/components/TimelineView";

export default function SampleTimeline() {
  const { space } = useSpace();
  return <TimelineView space={space} canFavorite={false} />;
}
