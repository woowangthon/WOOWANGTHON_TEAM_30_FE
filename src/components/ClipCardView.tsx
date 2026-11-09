"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { ClipCard } from "@/lib/api-types.gen";
import { ClipPlayer } from "./ClipPlayer";

/** 그 사람이 실제로 한 말(원본 녹음) 카드. 자막은 DB에 저장된 원문 그대로다. */
export function ClipCardView({
  card,
  spaceId,
  personName,
  canFavorite,
  nearby,
}: {
  card: ClipCard;
  spaceId: string;
  personName: string;
  canFavorite: boolean;
  nearby?: boolean;
}) {
  const [fav, setFav] = useState(card.favorite);
  return (
    <article className="card space-y-3" aria-label={`${personName}의 녹음`}>
      <p className="flex flex-wrap items-center gap-x-2 text-sm text-ink-faint">
        <span className="font-semibold text-accent-strong">{personName}의 목소리</span>
        <span aria-hidden>·</span>
        <span>{card.source_label}</span>
        {nearby && <span className="rounded-full bg-paper px-2 py-0.5 text-xs">가까운 추억</span>}
      </p>
      {card.question && <p className="text-sm text-ink-soft">질문: {card.question}</p>}
      <blockquote className="font-serif text-lg leading-relaxed text-ink">“{card.transcript}”</blockquote>
      <div className="flex flex-wrap items-center gap-3">
        <ClipPlayer url={card.audio_url} status={card.audio_status} label="목소리 듣기" size="lg" />
        {canFavorite && (
          <button
            type="button"
            aria-pressed={fav}
            className={`min-h-11 rounded-full px-3 text-sm ${fav ? "text-accent-strong" : "text-ink-faint"}`}
            onClick={async () => {
              const next = !fav;
              setFav(next);
              try {
                await api.put(`/spaces/${spaceId}/clips/${card.clip_id}/favorite`, { favorite: next });
              } catch {
                setFav(!next);
              }
            }}
          >
            {fav ? "★ 즐겨찾기" : "☆ 즐겨찾기"}
          </button>
        )}
      </div>
      <p className="text-sm text-ink-soft">{card.date_label}</p>
      {card.photos.length > 0 && (
        <div>
          <p className="mb-1 text-xs text-ink-faint">같은 날 사진</p>
          <div className="flex gap-2 overflow-x-auto">
            {card.photos.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.asset_id} src={p.url} alt={p.caption || "같은 날 사진"} className="h-20 w-20 shrink-0 rounded-xl object-cover" loading="lazy" />
            ))}
          </div>
        </div>
      )}
      {card.reason && !nearby && (
        <p className="flex items-start gap-2 text-sm text-guide">
          <span className="shrink-0 rounded-full bg-guide-soft px-2 py-0.5 text-xs font-semibold">여운 안내</span>
          <span>{card.reason}</span>
        </p>
      )}
    </article>
  );
}

/** 서비스가 하는 말. 그 사람의 말과 섞이지 않게 다른 색·라벨로 보여 준다. */
export function GuideBubble({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-guide/20 bg-guide-soft px-4 py-3 text-guide" role="note">
      <span className="mt-0.5 shrink-0 rounded-full bg-guide px-2 py-0.5 text-xs font-semibold text-white">여운 안내</span>
      <p>{text}</p>
    </div>
  );
}
