"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, errorMessage } from "@/lib/api";
import { useApi, useMe } from "@/lib/hooks";
import type { AppConfig, User, UserPrefsUpdate } from "@/lib/api-types.gen";
import { readTextSize, saveTextSize } from "@/lib/prefs";
import { Shell, PageTitle } from "@/components/Shell";
import { ErrorBox, Spinner } from "@/components/Feedback";

function Toggle({ id, checked, onChange, label, sub }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <input id={id} type="checkbox" className="mt-1 h-6 w-6 accent-[var(--color-accent)]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="block font-semibold">{label}</span>
        {sub && <span className="block text-sm text-ink-soft">{sub}</span>}
      </span>
    </label>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const me = useMe(true);
  const config = useApi<AppConfig>("/config");
  const [user, setUser] = useState<User | null>(null);
  const [large, setLarge] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (me.data) setUser(me.data);
  }, [me.data]);
  useEffect(() => setLarge(readTextSize() === "large"), []);

  async function save(patch: UserPrefsUpdate) {
    setErr("");
    try {
      setUser(await api.patch<User>("/me/prefs", patch));
    } catch (e) {
      setErr(errorMessage(e));
    }
  }

  if (!user) return <Shell back={{ href: "/spaces", label: "내 공간" }}><Spinner /></Shell>;
  const p = user.prefs;

  return (
    <Shell back={{ href: "/spaces", label: "내 공간" }}>
      <PageTitle title="계정·화면 설정" sub={`${user.display_name} 님 (${user.email})`} />
      <div className="space-y-5">
        <section className="card space-y-4">
          <h2 className="text-lg font-bold">화면</h2>
          <Toggle
            id="large"
            checked={large}
            label="큰 글씨"
            sub="글자와 버튼을 크게 보여 줘요. 이 기기에 저장돼요."
            onChange={(v) => {
              setLarge(v);
              saveTextSize(v ? "large" : "normal");
              void save({ large_text: v });
            }}
          />
        </section>

        <section className="card space-y-4">
          <h2 className="text-lg font-bold">마음 돌봄</h2>
          <Toggle
            id="rest"
            checked={p.rest_reminder}
            label="쉬어 가기 안내"
            sub="오래 머물면 잠깐 쉬어 가도 괜찮다고 부드럽게 알려 드려요."
            onChange={(v) => save({ rest_reminder: v })}
          />
          {p.rest_reminder && (
            <label className="flex items-center gap-3 text-[0.95rem]">
              <span>안내 시간</span>
              <select className="rounded-xl border border-line px-3 py-2" value={p.rest_minutes} onChange={(e) => save({ rest_minutes: Number(e.target.value) })}>
                {[20, 30, 40, 60, 90].map((m) => (
                  <option key={m} value={m}>{m}분 뒤</option>
                ))}
              </select>
            </label>
          )}
        </section>

        <section id="consent" className="card scroll-mt-20 space-y-3">
          <h2 className="text-lg font-bold">무료 AI 사용 동의</h2>
          <p className="text-[0.95rem] text-ink-soft">
            일부 무료 AI 서비스(예: Gemini 무료 등급)는 보낸 내용을 제품 개선(학습)에 쓸 수 있어요. 동의하면 그런 서비스로도 받아쓰기·검색을 할 수 있어요.
            {config.data?.env === "production" ? " 정식 서비스에서는 동의와 상관없이 쓰지 않아요." : ""} 동의하지 않아도 모든 기능을 기본 방식으로 쓸 수 있어요.
          </p>
          <Toggle
            id="consent-train"
            checked={p.consent_training_providers}
            label="안내를 읽었고, 학습에 쓰는 무료 AI 사용에 동의해요"
            onChange={(v) => save({ consent_training_providers: v })}
          />
        </section>

        {err && <ErrorBox message={err} />}

        <section className="card space-y-3 border-alert/30">
          <h2 className="text-lg font-bold text-alert">계정 지우기</h2>
          <p className="text-[0.95rem] text-ink-soft">계정과 내가 만든 모든 공간(원본·클립·자막·색인)이 지워지고 되돌릴 수 없어요. 초대받은 공간은 그대로 남아요.</p>
          <label className="label" htmlFor="del-pw">비밀번호</label>
          <input id="del-pw" type="password" className="field" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
          <button
            className="btn-danger w-full"
            disabled={!pw}
            onClick={async () => {
              if (!confirm("정말 계정을 지울까요? 되돌릴 수 없어요.")) return;
              try {
                await api.post("/me/delete", { password: pw });
                router.replace("/");
              } catch (e) {
                setErr(errorMessage(e));
              }
            }}
          >
            계정과 모든 자료 지우기
          </button>
        </section>
      </div>
    </Shell>
  );
}
