"use client";

import { useSpace } from "@/lib/space-context";
import { BookView } from "@/components/BookView";

export default function BookPage() {
  const { space, base } = useSpace();
  return <BookView space={space} base={base} />;
}
