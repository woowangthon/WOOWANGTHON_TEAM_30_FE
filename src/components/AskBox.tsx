"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icons";

/** 공간 홈의 말 걸기 줄: 보내면 대화 화면으로 넘어가 바로 답장을 받는다. */
export function AskBox({ base, personName, disabled }: { base: string; personName: string; disabled?: boolean }) {
  const router = useRouter();
  const [text, setText] = useState("");
  return (
    <form
      className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        router.push(`${base}/chat?q=${encodeURIComponent(text.trim())}`);
      }}
    >
      <div className="flex items-center gap-3 sm:w-[17rem] sm:shrink-0">
        <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent-soft font-serif text-lg font-bold text-accent-strong">
          {personName.slice(0, 1)}
        </span>
        <span className="min-w-0">
          <label htmlFor="ask" className="block font-serif text-[1.05rem] font-bold leading-snug">
            {personName}에게 말을 걸어 보세요
          </label>
          <span className="block text-xs text-ink-faint">녹음에 있는 말은 실제 목소리로</span>
        </span>
      </div>
      <div className="flex flex-1 items-center gap-2 rounded-2xl border border-line bg-paper/60 p-1.5 pl-4 focus-within:border-accent">
        <input
          id="ask"
          maxLength={500}
          className="h-11 min-w-0 flex-1 bg-transparent text-[1.02rem] placeholder:text-ink-faint focus:outline-none"
          placeholder="예: 오늘 면접 보고 왔어"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled}
        />
        <button className="btn-primary min-h-11 rounded-xl px-4" disabled={disabled || !text.trim()}>
          <Icon name="send" size={18} />
          <span>말 걸기</span>
        </button>
      </div>
    </form>
  );
}
