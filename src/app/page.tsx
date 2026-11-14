import Link from "next/link";

const PROMISES = [
  { title: "원본이 먼저", body: "녹음에 그대로 있는 말이면 언제나 실제 목소리를 먼저 들려 드려요. 그분의 목소리를 합성하지 않아요." },
  { title: "만든 말은 표시하고 근거를", body: "녹음에 없는 말은 그분 말투로 짧게 답하되 ‘AI가 만든 말’로 표시하고, 근거가 된 실제 녹음을 함께 보여 드려요." },
  { title: "여운 안내는 따로", body: "서비스가 하는 말은 ‘여운 안내’로 분명히 구분해요. 그분이 한 말처럼 보이게 쓰지 않아요." },
  { title: "지어내지 않아요", body: "녹음에 없는 사건·사람·날짜는 만들지 않아요. 유언·돈 이야기나 그분의 판단은 대신 말하지 않고, 힘든 마음이 보이면 대화를 멈추고 도움을 연결해요." },
  { title: "기본은 비공개", body: "자료는 올린 분과 초대한 가족만 봐요. 파일은 암호화해 보관하고 언제든 내보내거나 지울 수 있어요." },
];

const STEPS = [
  { title: "흩어진 녹음 모으기", body: "통화 녹음, 휴대폰 영상, 카카오톡 음성 메시지를 올리면 그분 목소리만 골라 문장 단위로 정리해요." },
  { title: "목소리 확인", body: "녹음마다 나뉜 목소리를 들어 보고 ‘이 목소리가 누구예요?’만 골라 주세요." },
  { title: "메시지 보내기", body: "“오늘 면접 보고 왔어” 하고 보내면, 그분 말투로 답장이 와요. 녹음에 그대로 있는 말이면 실제 목소리로 들려 드려요." },
];

export default function Home() {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex h-16 max-w-4xl items-center px-5">
        <span className="font-serif text-2xl font-bold">여운</span>
        <nav className="ml-auto flex gap-2 text-[0.95rem]">
          <Link href="/login" className="rounded-full px-3 py-2 text-ink-soft hover:text-ink">로그인</Link>
          <Link href="/signup" className="rounded-full bg-ink px-4 py-2 text-paper">시작하기</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-5 pb-20">
        <section className="py-12 sm:py-20">
          <p className="text-accent-strong">소중한 사람의 실제 목소리로 남기는 추억</p>
          <h1 className="mt-3 font-serif text-[1.7rem] font-bold leading-tight sm:text-5xl">
            그분이 실제로 했던 말을,
            <br />
            그 목소리 그대로.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-soft">
            휴대폰에 흩어진 통화 녹음과 영상에서 그분의 목소리만 찾아 정리해 두고, 메시지를 보내면 그분 말투로 답장해 드려요. 녹음에 있는 말은 실제 목소리로, 없는 말은 ‘AI가 만든 말’로 표시하고 근거 녹음을 함께 보여 드려요.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/sample" className="btn-primary text-lg">가입 없이 샘플 공간 체험하기</Link>
            <Link href="/signup" className="btn-ghost text-lg">내 추억 공간 만들기</Link>
          </div>
          <p className="mt-3 text-sm text-ink-faint">샘플 공간은 가상 인물 ‘김순자 할머니’로 만들었어요.</p>
        </section>

        <section aria-labelledby="how" className="py-8">
          <h2 id="how" className="font-serif text-2xl font-bold">이렇게 써요</h2>
          <ol className="mt-5 grid gap-4 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="card">
                <span className="text-sm font-semibold text-accent-strong">{i + 1}</span>
                <p className="mt-1 text-lg font-semibold">{s.title}</p>
                <p className="mt-1 text-ink-soft">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="ahead" className="py-8">
          <div className="card bg-sage-soft">
            <h2 id="ahead" className="font-serif text-xl font-bold text-sage">부모님 목소리, 미리 남겨 두기</h2>
            <p className="mt-2 text-ink-soft">
              “어릴 때 살던 동네는 어땠어요?” 같은 질문 카드를 골라 링크를 보내면, 부모님은 로그인 없이 큰 글씨 화면에서 바로 답을 녹음할 수 있어요. 질문과 함께 저장되어 나중에 가장 정확하게 찾아져요.
            </p>
          </div>
        </section>

        <section aria-labelledby="promise" className="py-8">
          <h2 id="promise" className="font-serif text-2xl font-bold">여운의 약속</h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {PROMISES.map((p) => (
              <li key={p.title} className="card">
                <p className="font-semibold">{p.title}</p>
                <p className="mt-1 text-ink-soft">{p.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-10 border-t border-line pt-6 text-sm text-ink-faint">
          <p>
            마음이 많이 힘들 때: 자살예방상담전화 <a className="underline" href="tel:109">109</a> · 정신건강위기상담{" "}
            <a className="underline" href="tel:15770199">1577-0199</a> (24시간)
          </p>
          <p className="mt-2 flex gap-4">
            <Link href="/help" className="underline underline-offset-4">도움 안내</Link>
            <Link href="/privacy" className="underline underline-offset-4">개인정보 처리방침</Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
