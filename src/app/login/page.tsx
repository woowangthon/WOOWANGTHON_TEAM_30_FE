"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, errorMessage } from "@/lib/api";
import { Shell, PageTitle } from "@/components/Shell";
import { ErrorBox } from "@/components/Feedback";

function safeNext(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/spaces";
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/auth/login", { email, password });
      router.replace(safeNext(params.get("next")));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label" htmlFor="email">이메일</label>
        <input id="email" className="field" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="password">비밀번호</label>
        <input id="password" className="field" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error && <ErrorBox message={error} />}
      <button className="btn-primary w-full" disabled={busy}>{busy ? "확인하는 중…" : "로그인"}</button>
      <p className="text-center text-ink-soft">
        처음이신가요? <Link className="font-semibold text-accent-strong underline underline-offset-4" href="/signup">가입하기</Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Shell back={{ href: "/", label: "처음으로" }}>
      <PageTitle title="다시 오셨네요" sub="추억 공간은 올린 분과 초대한 가족만 볼 수 있어요." />
      <Suspense>
        <LoginForm />
      </Suspense>
    </Shell>
  );
}
