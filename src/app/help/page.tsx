import type { Metadata } from "next";
import { Shell, PageTitle } from "@/components/Shell";

export const metadata: Metadata = { title: "도움 안내 — 여운" };

const LINES = [
  { name: "자살예방상담전화", phone: "109", hours: "24시간, 무료", body: "죽고 싶은 마음이 들 때, 누구나 언제든 이야기할 수 있어요." },
  { name: "정신건강위기상담", phone: "1577-0199", hours: "24시간", body: "가까운 정신건강복지센터로 연결돼 상담과 도움을 받을 수 있어요. 사별 후 애도 상담도 물어볼 수 있어요." },
  { name: "긴급 상황", phone: "119", hours: "24시간", body: "지금 당장 위험하다면 119 또는 112로 바로 전화하세요." },
];

export default function HelpPage() {
  return (
    <Shell back={{ href: "/", label: "처음으로" }}>
      <PageTitle title="도움 안내" sub="그리움이 너무 무겁게 느껴질 때, 혼자 견디지 않아도 돼요." />
      <ul className="space-y-3">
        {LINES.map((l) => (
          <li key={l.phone}>
            <a href={`tel:${l.phone}`} className="card flex items-center justify-between gap-4 hover:border-accent/40">
              <span>
                <span className="block text-lg font-semibold">{l.name}</span>
                <span className="block text-sm text-ink-soft">{l.hours} · {l.body}</span>
              </span>
              <span className="shrink-0 whitespace-nowrap text-2xl font-bold text-accent-strong">{l.phone}</span>
            </a>
          </li>
        ))}
      </ul>
      <section className="card mt-6 space-y-3 text-[0.95rem]">
        <h2 className="text-lg font-bold">여운을 쓰는 동안</h2>
        <ul className="list-disc space-y-2 pl-5 text-ink-soft">
          <li>목소리를 듣고 마음이 크게 흔들리면 잠시 멈춰도 괜찮아요. 추억은 그대로 남아 있어요.</li>
          <li>여운은 그분의 목소리를 합성하지 않아요. 녹음에 없는 말은 ‘AI가 만든 말’로 표시하고, 근거가 된 실제 녹음을 함께 보여 드려요.</li>
          <li>오래 머물면 쉬어 가기를 권하는 안내가 나와요. 계정 설정에서 끌 수 있어요.</li>
          <li>밤 10시부터 아침 8시까지는 생일·기일 알림을 새로 띄우지 않아요.</li>
        </ul>
      </section>
    </Shell>
  );
}
