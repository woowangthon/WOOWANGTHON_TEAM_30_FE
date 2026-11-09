import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-xl px-5 py-16">
      <h1 className="font-serif text-3xl font-bold">여운</h1>
      <p className="mt-3 text-ink-soft">그 사람이 실제로 했던 말을, 실제 목소리 그대로.</p>
      <div className="mt-8 flex gap-3">
        <Link className="btn-primary" href="/signup">시작하기</Link>
        <Link className="btn-ghost" href="/login">로그인</Link>
      </div>
    </main>
  );
}
