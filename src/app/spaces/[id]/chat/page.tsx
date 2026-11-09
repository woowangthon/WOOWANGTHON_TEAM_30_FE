"use client";

import { Suspense } from "react";
import { useSpace } from "@/lib/space-context";
import { ChatView } from "@/components/ChatView";

export default function ChatPage() {
  const { space } = useSpace();
  return (
    <Suspense>
      <ChatView space={space} canFavorite />
    </Suspense>
  );
}
