"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { josa } from "@/lib/format";

/** 공간 홈의 가장 큰 입력: 말을 걸면 대화 화면으로 넘어간다. */
export function AskBox({ base, personName, disabled }: { base: string; personName: string; disabled?: boolean }) {
  const router = useRouter();
  const [text, setText] = useState("");
  return (
    <form
      className="card bg-card p-4 sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        router.push(`${base}/chat?q=${encodeURIComponent(text.trim())}`);
      }}
    >
      <label htmlFor="ask" className="block font-serif text-xl font-bold">
        {josa(personName, "에게", "에게")} 말을 걸어 보세요
      </label>
      <p className="mt-1 text-[0.95rem] text-ink-soft">
        새 말을 지어내지 않아요. {josa(personName, "이", "가")} 실제로 했던 말을 녹음에서 찾아 들려드려요.
      </p>
      <textarea
        id="ask"
        rows={3}
        maxLength={500}
        className="field mt-4 resize-none text-lg"
        placeholder="예: 오늘 면접 보고 왔어"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            (e.currentTarget.form as HTMLFormElement).requestSubmit();
          }
        }}
      />
      <button className="btn-primary mt-3 w-full text-lg" disabled={disabled || !text.trim()}>
        말 걸기
      </button>
    </form>
  );
}
