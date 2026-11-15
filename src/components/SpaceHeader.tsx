import type { Space } from "@/lib/api-types.gen";
import { Wave } from "./Wave";

/** 추억 공간 위쪽 머리말: 그분 이름 첫 글자, 공간 이름, 관계, 모아 둔 목소리 수. */
export function SpaceHeader({ space, sample }: { space: Space; sample?: boolean }) {
  const c = space.counts;
  const meta = [space.relationship, sample ? "샘플 공간 · 가상 인물" : "추억 공간"].filter(Boolean).join(" · ");
  return (
    <section className="relative mb-5 overflow-hidden rounded-[1.75rem] border border-line bg-gradient-to-br from-accent-soft via-card to-sage-soft p-5 shadow-[0_18px_40px_-28px_rgba(53,47,42,0.45)]">
      <Wave className="pointer-events-none absolute -right-4 bottom-3 h-14 w-48 text-accent/15" />
      <div className="relative flex items-center gap-4">
        <span
          aria-hidden="true"
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-white/70 bg-card font-serif text-2xl font-bold text-accent-strong shadow-sm"
        >
          {space.person_name.slice(0, 1)}
        </span>
        <div className="min-w-0">
          <p className="text-sm text-ink-soft">{meta}</p>
          <h1 className="truncate font-serif text-2xl font-bold leading-tight">{space.name}</h1>
          <p className="mt-1 text-sm text-ink-soft">
            그분 목소리 <b className="font-semibold text-accent-strong">{c.person_clips}</b>개 · 자료 {c.assets}개
          </p>
        </div>
      </div>
    </section>
  );
}
