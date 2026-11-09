"use client";

import { useSpace } from "@/lib/space-context";
import { TimelineView } from "@/components/TimelineView";

export default function TimelinePage() {
  const { space } = useSpace();
  return <TimelineView space={space} canFavorite />;
}
