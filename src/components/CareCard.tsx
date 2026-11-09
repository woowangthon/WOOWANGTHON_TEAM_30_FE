import Link from "next/link";
import type { CareNotice } from "@/lib/api-types.gen";

/** 마음 돌봄 안내: 위험 신호가 보이면 클립보다 먼저 보여 준다. */
export function CareCard({ care }: { care: CareNotice }) {
  const high = care.level === "high";
  return (
    <section
      role={high ? "alert" : "status"}
      className={`rounded-3xl border p-5 ${high ? "border-alert/30 bg-alert-soft" : "border-sage/30 bg-sage-soft"}`}
    >
      <h3 className={`text-lg font-bold ${high ? "text-alert" : "text-sage"}`}>{care.title}</h3>
      <p className="mt-2 text-ink">{care.message}</p>
      <ul className="mt-4 space-y-2">
        {care.resources.map((r) => (
          <li key={r.phone}>
            <a
              href={`tel:${r.phone}`}
              className={`flex min-h-14 items-center justify-between gap-3 rounded-2xl px-4 py-2 ${high ? "bg-alert text-white" : "bg-card text-ink"}`}
            >
              <span>
                <span className="block font-semibold">{r.name}</span>
                <span className={`block text-sm ${high ? "text-white/85" : "text-ink-soft"}`}>
                  {r.hours}
                  {r.description ? ` · ${r.description}` : ""}
                </span>
              </span>
              <span className="shrink-0 whitespace-nowrap text-xl font-bold">{r.phone}</span>
            </a>
          </li>
        ))}
      </ul>
      <Link href="/help" className="mt-3 inline-block text-sm underline underline-offset-4">
        도움 안내 더 보기
      </Link>
    </section>
  );
}
