import Link from "next/link";

const PROMISES = [
  { title: "원본이 먼저", body: "녹음에 그대로 있는 말이면 언제나 실제 목소리를 먼저 들려 드려요. 그분의 목소리를 합성하지 않아요." },
  { title: "만든 말은 표시하고 근거를", body: "녹음에 없는 말은 그분 말투로 짧게 답하되 ‘AI가 만든 말’로 표시하고, 근거가 된 실제 녹음을 함께 보여 드려요." },
  { title: "여운 안내는 따로", body: "서비스가 하는 말은 ‘여운 안내’로 분명히 구분해요. 그분이 한 말처럼 보이게 쓰지 않아요." },
  { title: "지어내지 않아요", body: "녹음에 없는 사건·사람·날짜는 만들지 않아요. 유언·돈 이야기나 그분의 판단은 대신 말하지 않고, 힘든 마음이 보이면 대화를 멈추고 도움을 연결해요." },
  { title: "기본은 비공개", body: "자료는 올린 분과 초대한 가족만 봐요. 파일은 암호화해 보관하고 언제든 내보내거나 지울 수 있어요." },
];

const STEPS = [
  { icon: "upload", title: "흩어진 녹음 모으기", body: "통화 녹음, 휴대폰 영상, 카카오톡 음성 메시지를 올리면 그분 목소리만 골라 문장 단위로 정리해요." },
  { icon: "ear", title: "목소리 확인", body: "녹음마다 나뉜 목소리를 들어 보고 ‘이 목소리가 누구예요?’만 골라 주세요." },
  { icon: "chat", title: "메시지 보내기", body: "“오늘 면접 보고 왔어” 하고 보내면, 그분 말투로 답장이 와요. 녹음에 그대로 있는 말이면 실제 목소리로 들려 드려요." },
];


const BARS = [6, 14, 9, 18, 12, 22, 15, 10, 19, 8, 16, 11, 20, 7, 13, 17, 9, 14, 6, 11];

function Wave({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 24" className={className} aria-hidden="true">
      {BARS.map((h, i) => (
        <rect key={i} x={i * 6 + 1} y={12 - h / 2} width="3" height={h} rx="1.5" fill="currentColor" />
      ))}
    </svg>
  );
}

function StepIcon({ name }: { name: string }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "upload")
    return (<svg {...common}><path d="M12 15V4" /><path d="m7 9 5-5 5 5" /><path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" /></svg>);
  if (name === "ear")
    return (<svg {...common}><path d="M6 9a6 6 0 1 1 12 0c0 3-2 4-3 5.5S14 18 12 20c-1.5 1.4-4 .6-4-1.5" /><path d="M9 9a3 3 0 0 1 6 0c0 1.5-1.5 2-1.5 3.5" /></svg>);
  return (<svg {...common}><path d="M4 5h16v11H9l-5 4z" /><path d="M8 10h8" /></svg>);
}

function ChatPreview() {
  return (
    <div className="relative isolate mx-auto w-full max-w-sm">
      <div aria-hidden="true" className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-accent-soft via-paper to-sage-soft blur-2xl" />
      <figure className="rounded-[2rem] border border-line bg-card/95 p-5 shadow-[0_20px_50px_-25px_rgba(53,47,42,0.45)]">
        <figcaption className="flex items-center gap-3 border-b border-line pb-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-accent-soft font-serif text-lg font-bold text-accent-strong">김</span>
          <span>
            <span className="block font-semibold">김순자 할머니</span>
            <span className="block text-xs text-ink-faint">예시 화면 · 가상 인물</span>
          </span>
        </figcaption>
        <div className="mt-4 space-y-3 text-[0.95rem]">
          <p className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-md bg-ink px-4 py-2 text-paper">할매 보고 싶어</p>
          <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-line bg-paper px-4 py-3">
            <p className="font-serif leading-relaxed">우리 강아지 얼굴 본 지가 언제고. 보고 싶어서 자꾸 눈에 밟힌다.</p>
            <div className="mt-2 flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1.5 text-accent-strong">
              <span className="text-sm font-semibold">▶ 실제 목소리</span>
              <Wave className="h-4 w-24" />
            </div>
          </div>
          <p className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-md bg-ink px-4 py-2 text-paper">오늘 면접 보고 왔어</p>
          <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-dashed border-guide/40 bg-card px-4 py-3">
            <span className="inline-block rounded-full bg-guide-soft px-2 py-0.5 text-xs font-semibold text-guide">AI가 만든 말</span>
            <p className="mt-1 leading-relaxed">아이고 우리 강아지, 고생 많았제. 따신 밥 한 그릇 꼭 챙겨 묵어라.</p>
            <p className="mt-1 text-xs text-ink-faint">근거 녹음 2개 보기</p>
          </div>
        </div>
      </figure>
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative isolate min-h-dvh overflow-x-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[46rem] bg-[radial-gradient(60rem_30rem_at_15%_-10%,var(--color-accent-soft),transparent_70%),radial-gradient(40rem_28rem_at_95%_10%,var(--color-sage-soft),transparent_70%)]" />
      <header className="mx-auto flex h-16 max-w-5xl items-center px-5">
        <span className="font-serif text-2xl font-bold">여운</span>
        <nav className="ml-auto flex gap-2 text-[0.95rem]">
          <Link href="/login" className="rounded-full px-3 py-2 text-ink-soft hover:text-ink">로그인</Link>
          <Link href="/signup" className="rounded-full bg-ink px-4 py-2 text-paper">시작하기</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-5 pb-20">
        <section className="grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-[1.15fr_1fr]">
          <div>
          <p className="text-accent-strong">소중한 사람의 실제 목소리로 남기는 추억</p>
          <h1 className="mt-3 font-serif text-[1.7rem] font-bold leading-tight sm:text-[2.6rem] lg:text-[2.2rem]">
            <span className="block text-balance">그분이 남긴 말은 그 목소리 그대로,</span>
            <span className="block text-balance">없는 말은 ‘AI가 만든 말’로 표시해요.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-soft">
            휴대폰에 흩어진 통화 녹음과 영상에서 그분의 목소리만 찾아 정리해 두고, 메시지를 보내면 그분 말투로 답장해 드려요. 녹음에 있는 말은 실제 목소리로, 없는 말은 ‘AI가 만든 말’로 표시하고 근거 녹음을 함께 보여 드려요.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/sample" className="btn-primary text-lg">가입 없이 샘플 공간 체험하기</Link>
            <Link href="/signup" className="btn-ghost text-lg">내 추억 공간 만들기</Link>
          </div>
          <p className="mt-3 text-sm text-ink-faint">샘플 공간은 가상 인물 ‘김순자 할머니’로 만들었어요.</p>
          </div>
          <ChatPreview />
        </section>

        <section aria-labelledby="how" className="py-8">
          <h2 id="how" className="font-serif text-2xl font-bold">이렇게 써요</h2>
          <ol className="mt-5 grid gap-4 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="card">
                <span className="flex items-center gap-2 text-sm font-semibold text-accent-strong">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-accent-soft"><StepIcon name={s.icon} /></span>
                  {i + 1}
                </span>
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
