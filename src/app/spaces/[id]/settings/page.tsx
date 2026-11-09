"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, errorMessage } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import type { Invite, MemberList, ProviderList, Space } from "@/lib/api-types.gen";
import { useSpace } from "@/lib/space-context";
import { formatBytes, formatDateKo } from "@/lib/format";
import { ErrorBox, Notice, Spinner } from "@/components/Feedback";

const FN_LABEL: Record<string, string> = { stt: "받아쓰기(음성 인식)", diarization: "목소리 나누기", llm: "녹음 고르기·주제 붙이기(LLM)", embedding: "뜻으로 찾기(임베딩)" };
const STATUS_LABEL: Record<string, string> = {
  active: "사용 중",
  not_configured: "키 없음",
  blocked_by_policy: "정책상 사용 안 함",
  needs_consent: "동의 필요",
  model_missing: "모델 없음",
};
const ROLE_LABEL: Record<string, string> = { owner: "소유자", editor: "편집", viewer: "보기" };

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="card scroll-mt-20 space-y-4" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

function SpaceInfo({ space, onSaved }: { space: Space; onSaved: () => void }) {
  const [f, setF] = useState({
    name: space.name,
    person_name: space.person_name,
    relationship: space.relationship || "",
    birthday: space.birthday || "",
    memorial_day: space.memorial_day || "",
  });
  const [msg, setMsg] = useState("");
  const editable = space.role !== "viewer";
  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await api.patch(`/spaces/${space.id}`, { ...f, relationship: f.relationship || null, birthday: f.birthday || null, memorial_day: f.memorial_day || null });
          setMsg("저장했어요.");
          onSaved();
        } catch (err) {
          setMsg(errorMessage(err));
        }
      }}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div><label className="label" htmlFor="s-name">공간 이름</label><input id="s-name" className="field" disabled={!editable} value={f.name} maxLength={40} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><label className="label" htmlFor="s-person">부르는 말</label><input id="s-person" className="field" disabled={!editable} value={f.person_name} maxLength={40} onChange={(e) => setF({ ...f, person_name: e.target.value })} /></div>
        <div><label className="label" htmlFor="s-rel">관계</label><input id="s-rel" className="field" disabled={!editable} value={f.relationship} maxLength={40} onChange={(e) => setF({ ...f, relationship: e.target.value })} /></div>
        <div><label className="label" htmlFor="s-bday">생일</label><input id="s-bday" type="date" className="field" disabled={!editable} value={f.birthday} onChange={(e) => setF({ ...f, birthday: e.target.value })} /></div>
        <div><label className="label" htmlFor="s-mday">기일</label><input id="s-mday" type="date" className="field" disabled={!editable} value={f.memorial_day} onChange={(e) => setF({ ...f, memorial_day: e.target.value })} /></div>
      </div>
      <p className="text-sm text-ink-soft">생일과 기일이 다가오면 앱 안에서 조용히 알려 드려요(밤 10시~아침 8시에는 알리지 않아요).</p>
      {editable && <button className="btn-primary">저장</button>}
      {msg && <p className="text-sm text-ink-soft" role="status">{msg}</p>}
    </form>
  );
}

function Family({ space }: { space: Space }) {
  const members = useApi<MemberList>(`/spaces/${space.id}/members`);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [role, setRole] = useState<"viewer" | "editor">("viewer");
  const [err, setErr] = useState("");
  const isOwner = space.role === "owner";
  if (!members.data) return <Spinner />;
  return (
    <div className="space-y-4">
      <ul className="divide-y divide-line">
        {members.data.members.map((m) => (
          <li key={m.user_id} className="flex flex-wrap items-center gap-2 py-3">
            <span className="font-semibold">{m.display_name}</span>
            <span className="text-sm text-ink-faint">{m.email}</span>
            {isOwner && m.role !== "owner" ? (
              <span className="ml-auto flex items-center gap-2">
                <select
                  className="rounded-xl border border-line px-2 py-1"
                  value={m.role}
                  aria-label={`${m.display_name}의 권한`}
                  onChange={async (e) => {
                    await api.patch(`/spaces/${space.id}/members/${m.user_id}`, { role: e.target.value }).catch(() => {});
                    void members.reload();
                  }}
                >
                  <option value="viewer">보기</option>
                  <option value="editor">편집</option>
                </select>
                <button
                  className="text-sm text-ink-faint hover:text-alert"
                  onClick={async () => {
                    if (confirm(`${m.display_name} 님을 이 공간에서 내보낼까요?`)) {
                      await api.del(`/spaces/${space.id}/members/${m.user_id}`).catch(() => {});
                      void members.reload();
                    }
                  }}
                >
                  내보내기
                </button>
              </span>
            ) : (
              <span className="chip ml-auto">{ROLE_LABEL[m.role]}</span>
            )}
          </li>
        ))}
      </ul>
      <p className="text-sm text-ink-soft">보기: 대화·타임라인만 · 편집: 자료 올리기·목소리 확인·미리 남기기까지 · 소유자: 내보내기·삭제·초대</p>
      {isOwner && (
        <div className="space-y-3 rounded-2xl bg-paper p-4">
          <p className="font-semibold">가족 초대하기</p>
          <div className="flex flex-wrap gap-2">
            <select className="field max-w-40" value={role} onChange={(e) => setRole(e.target.value as "viewer" | "editor")} aria-label="초대 권한">
              <option value="viewer">보기 권한</option>
              <option value="editor">편집 권한</option>
            </select>
            <button
              className="btn-primary"
              onClick={async () => {
                setErr("");
                try {
                  setInvite(await api.post<Invite>(`/spaces/${space.id}/invites`, { role }));
                  void members.reload();
                } catch (e) {
                  setErr(errorMessage(e));
                }
              }}
            >
              초대 링크 만들기
            </button>
          </div>
          {invite?.url && (
            <div className="space-y-2">
              <input readOnly className="field font-mono text-sm" value={invite.url} onFocus={(e) => e.currentTarget.select()} aria-label="초대 링크" />
              <p className="text-sm text-ink-soft">이 링크는 지금 한 번만 보여요. {formatDateKo(invite.expires_at)}까지, 한 사람만 쓸 수 있어요.</p>
              <button className="btn-soft" onClick={() => navigator.clipboard?.writeText(invite.url || "")}>링크 복사</button>
            </div>
          )}
          {members.data.invites.length > 0 && (
            <p className="text-sm text-ink-soft">아직 쓰지 않은 초대 링크 {members.data.invites.length}개</p>
          )}
          {err && <ErrorBox message={err} />}
        </div>
      )}
    </div>
  );
}

function Providers({ space }: { space: Space }) {
  const p = useApi<ProviderList>(`/spaces/${space.id}/providers`);
  if (!p.data) return <Spinner />;
  return (
    <div className="space-y-4">
      <p className="text-[0.95rem] text-ink-soft">자료가 어떤 외부 서비스로 가는지 보여 드려요. 외부 서비스는 찾고 고르는 데만 쓰고, 그분의 목소리나 말을 새로 만드는 데는 쓰지 않아요.</p>
      <ul className="space-y-3">
        {p.data.providers.map((x) => (
          <li key={`${x.function}-${x.provider}-${x.status}`} className={`rounded-2xl border p-4 ${x.status === "active" ? "border-line" : "border-dashed border-line opacity-80"}`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{FN_LABEL[x.function]}</span>
              <span className={`chip ${x.status === "active" ? "border-sage text-sage" : ""}`}>{STATUS_LABEL[x.status]}</span>
            </div>
            <p className="mt-1">{x.display_name}</p>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm text-ink-soft">
              <dt>보내는 것</dt><dd>{x.data_sent}</dd>
              <dt>외부 전송</dt><dd>{x.is_external ? "예" : "아니요"}</dd>
              <dt>학습 사용</dt><dd className={x.trains_on_input ? "font-semibold text-alert" : ""}>{x.trains_on_input ? "입력을 학습에 쓸 수 있는 등급" : "학습에 쓰지 않음"}</dd>
              <dt>보관</dt><dd>{x.retention_note}</dd>
            </dl>
            {x.note && <p className="mt-2 text-sm text-guide">{x.note}</p>}
          </li>
        ))}
      </ul>
      {p.data.providers.some((x) => x.status === "needs_consent") && (
        <Notice>
          학습에 쓰는 무료 AI를 쓰려면 <Link href="/account#consent" className="underline underline-offset-4">계정 설정</Link>에서 안내를 읽고 동의해 주세요. 동의하지 않아도 기본 방식으로 모든 기능을 쓸 수 있어요.
        </Notice>
      )}
    </div>
  );
}

function Privacy({ space }: { space: Space }) {
  const p = useApi<ProviderList>(`/spaces/${space.id}/providers`);
  return (
    <div className="space-y-3 text-[0.95rem]">
      <p>이 공간은 <strong>나와 내가 초대한 가족만</strong> 볼 수 있어요. 검색 엔진에도 노출되지 않아요.</p>
      <ul className="list-disc space-y-1 pl-5 text-ink-soft">
        {p.data?.retention.map((r) => <li key={r}>{r}</li>)}
      </ul>
      <p className="text-sm text-ink-soft">
        사용량: {formatBytes(space.storage_bytes)}
        {space.storage_limit_bytes ? ` / ${formatBytes(space.storage_limit_bytes)}` : ""}
      </p>
      <Link href="/privacy" className="text-sm underline underline-offset-4">개인정보 처리방침 전체 보기</Link>
    </div>
  );
}

function Danger({ space }: { space: Space }) {
  const router = useRouter();
  const [confirmName, setConfirmName] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  if (space.role !== "owner") {
    return <p className="text-ink-soft">내보내기와 삭제는 공간 소유자만 할 수 있어요.</p>;
  }
  return (
    <div className="space-y-5">
      <div>
        <p className="font-semibold">전체 내보내기</p>
        <p className="text-sm text-ink-soft">올린 원본 파일과 자막(JSON)을 zip 파일 하나로 받아요. 받은 파일은 암호가 풀린 상태라 안전한 곳에 보관해 주세요.</p>
        <a className="btn-soft mt-2" href={`/api/spaces/${space.id}/export`} download>
          zip으로 내려받기
        </a>
      </div>
      <div className="rounded-2xl border border-alert/30 p-4">
        <p className="font-semibold text-alert">공간 완전히 지우기</p>
        <p className="mt-1 text-sm text-ink-soft">
          원본 파일, 클립, 자막, 검색 색인, 처리 기록, 녹음 링크, 가족 초대가 모두 지워지고 되돌릴 수 없어요. 먼저 내보내기를 해 두시길 권해요.
        </p>
        <label className="label mt-3" htmlFor="confirm-name">확인을 위해 공간 이름 &lsquo;{space.name}&rsquo;을 입력해 주세요</label>
        <input id="confirm-name" className="field" value={confirmName} onChange={(e) => setConfirmName(e.target.value)} />
        {err && <ErrorBox message={err} />}
        <button
          className="btn-danger mt-3 w-full"
          disabled={confirmName !== space.name || busy}
          onClick={async () => {
            setBusy(true);
            try {
              await api.post(`/spaces/${space.id}/delete`, { confirm_name: confirmName });
              router.replace("/spaces");
            } catch (e) {
              setErr(errorMessage(e));
              setBusy(false);
            }
          }}
        >
          {busy ? "지우는 중…" : "이 공간을 완전히 지우기"}
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { space, reload } = useSpace();
  const links = [
    ["info", "공간 정보"],
    ["family", "가족"],
    ["privacy", "개인정보"],
    ["providers", "외부 서비스"],
    ["data", "내보내기·삭제"],
    ["help", "도움 안내"],
  ];
  return (
    <div className="space-y-5">
      <nav aria-label="설정 목차" className="flex flex-wrap gap-2">
        {links.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="chip min-h-10">{label}</a>
        ))}
      </nav>
      <Section id="info" title="공간 정보"><SpaceInfo space={space} onSaved={reload} /></Section>
      <Section id="family" title="가족"><Family space={space} /></Section>
      <Section id="privacy" title="개인정보"><Privacy space={space} /></Section>
      <Section id="providers" title="외부 서비스"><Providers space={space} /></Section>
      <Section id="data" title="내보내기·삭제"><Danger space={space} /></Section>
      <Section id="help" title="도움 안내">
        <p className="text-[0.95rem]">마음이 많이 힘들 때는 혼자 견디지 마세요. 자살예방상담전화 <a className="font-bold underline" href="tel:109">109</a>(24시간), 정신건강위기상담 <a className="font-bold underline" href="tel:15770199">1577-0199</a>.</p>
        <p className="text-sm text-ink-soft">오래 머물면 쉬어 가기를 권하는 안내, 큰 글씨는 <Link href="/account" className="underline underline-offset-4">계정·화면 설정</Link>에서 바꿀 수 있어요.</p>
        <Link href="/help" className="btn-soft">도움 안내 전체 보기</Link>
      </Section>
    </div>
  );
}
