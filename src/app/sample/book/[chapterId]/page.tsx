"use client";

import { useParams } from "next/navigation";
import { useSpace } from "@/lib/space-context";
import { CallView } from "@/components/CallView";

export default function MemoryCallPage() {
  const { space, base } = useSpace();
  const { chapterId } = useParams<{ chapterId: string }>();
  return <CallView space={space} base={base} chapterId={chapterId} />;
}
