"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, errorMessage } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import type { AppConfig } from "@/lib/api-types.gen";
import { Shell, PageTitle } from "@/components/Shell";
import { ErrorBox, Notice } from "@/components/Feedback";

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const config = useApi<AppConfig>("/config");
  const [form, setForm] = useState({ email: "", password: "", display_name: "", invite_code: params.get("code") || "" });
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const needsInvite = config.data?.signup_requires_invite;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/auth/signup", { ...form, invite_code: form.invite_code || null });
      const next = params.get("next");
      router.replace(next && next.startsWith("/") && !next.startsWith("//") ? next : "/spaces");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <form onSubmit={submit} className="space-y-4">
      {needsInvite && <Notice>지금은 친구 테스트 기간이라 초대 코드가 있어야 가입할 수 있어요.</Notice>}
      <div>
        <label className="label" htmlFor="name">부르는 이름</label>
        <input id="name" className="field" required maxLength={40} value={form.display_name} onChange={set("display_name")} placeholder="예: 지은" />
      </div>
      <div>
        <label className="label" htmlFor="email">이메일</label>
        <input id="email" className="field" type="email" autoComplete="email" required value={form.email} onChange={set("email")} />
      </div>
      <div>
        <label className="label" htmlFor="password">비밀번호 (8자 이상)</label>
        <input id="password" className="field" type="password" autoComplete="new-password" minLength={8} required value={form.password} onChange={set("password")} />
      </div>
      {needsInvite && (
        <div>
          <label className="label" htmlFor="invite">초대 코드</label>
          <input id="invite" className="field" required value={form.invite_code} onChange={set("invite_code")} />
        </div>
      )}
      <label className="flex items-start gap-3 text-[0.95rem] text-ink-soft">
        <input type="checkbox" className="mt-1.5 h-5 w-5 accent-[var(--color-accent)]" checked={agree} onChange={(e) => setAgree(e.target.checked)} required />
        <span>
          <Link href="/privacy" className="underline underline-offset-4">개인정보 처리방침</Link>을 읽었고, 올린 자료는 나와 내가 초대한 가족만 본다는 것을 이해했어요.
        </span>
      </label>
      {error && <ErrorBox message={error} />}
      <button className="btn-primary w-full" disabled={busy || !agree}>{busy ? "만드는 중…" : "가입하기"}</button>
      <p className="text-center text-ink-soft">
        이미 계정이 있나요? <Link className="font-semibold text-accent-strong underline underline-offset-4" href="/login">로그인</Link>
      </p>
    </form>
  );
}

export default function SignupPage() {
  return (
    <Shell back={{ href: "/", label: "처음으로" }}>
      <PageTitle title="여운 시작하기" sub="소중한 사람의 실제 목소리를 모아 두는 곳이에요." />
      <Suspense>
        <SignupForm />
      </Suspense>
    </Shell>
  );
}
