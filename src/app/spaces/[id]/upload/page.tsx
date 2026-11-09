"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { uploadWithProgress } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import type { AppConfig, Asset, AssetList as AssetListT } from "@/lib/api-types.gen";
import { canEdit, useSpace } from "@/lib/space-context";
import { nextToStart, precheck, type QueueItem } from "@/lib/upload-queue";
import { formatBytes } from "@/lib/format";
import { AssetList } from "@/components/AssetList";
import { FindGuide } from "@/components/FindGuide";
import { Notice } from "@/components/Feedback";

const CONSENT_TEXT = "이 자료를 올릴 권리가 있고, 함께 나온 사람의 뜻을 존중합니다.";

export default function UploadPage() {
  const { space, reload: reloadSpace } = useSpace();
  const config = useApi<AppConfig>("/config");
  const assets = useApi<AssetListT>(`/spaces/${space.id}/assets`);
  const [consent, setConsent] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const files = useRef(new Map<string, File>());
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const editable = canEdit(space);

  const allowed = config.data?.limits.allowed_extensions ?? [];
  const maxMb = config.data?.limits.max_file_mb ?? 25;

  const update = (key: string, patch: Partial<QueueItem>) =>
    setQueue((q) => q.map((i) => (i.key === key ? { ...i, ...patch } : i)));

  const addFiles = (list: FileList | File[]) => {
    const items: QueueItem[] = [];
    for (const f of Array.from(list)) {
      const key = `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2, 7)}`;
      const problem = precheck(f.name, f.size, allowed, maxMb);
      files.current.set(key, f);
      items.push({ key, name: f.name, size: f.size, status: problem ? "rejected" : "waiting", progress: 0, message: problem || undefined });
    }
    setQueue((q) => [...q, ...items]);
  };

  const start = useCallback(
    async (item: QueueItem) => {
      const file = files.current.get(item.key);
      if (!file) return;
      update(item.key, { status: "uploading", progress: 0, message: undefined });
      const form = new FormData();
      form.append("file", file, file.name);
      form.append("consent", "true");
      const res = await uploadWithProgress<Asset>(`/spaces/${space.id}/assets`, form, (p) => update(item.key, { progress: p }));
      if (res.ok) {
        update(item.key, { status: "done", progress: 1, message: res.status === 200 ? "이미 올린 파일이에요." : undefined });
        files.current.delete(item.key);
        void assets.reload();
        void reloadSpace();
      } else {
        update(item.key, { status: "error", message: res.error?.messageKo });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [space.id],
  );

  useEffect(() => {
    for (const item of nextToStart(queue)) void start(item);
  }, [queue, start]);

  if (!editable) {
    return (
      <div className="space-y-4">
        <Notice>보기 권한이라 자료를 올릴 수 없어요. 공간 소유자에게 편집 권한을 부탁해 보세요.</Notice>
        <AssetList spaceId={space.id} editable={false} list={assets.data} reload={assets.reload} />
      </div>
    );
  }

  const activeQueue = queue.filter((i) => i.status !== "done" || i.message);

  return (
    <div className="space-y-6">
      <section className="card space-y-4">
        <h2 className="font-semibold">자료 올리기</h2>
        <p className="text-[0.95rem] text-ink-soft">
          통화 녹음·음성 메시지(m4a, mp3, wav, aac, amr, ogg), 영상(mp4, mov), 사진(jpg, png, heic)을 여러 개 한 번에 올릴 수 있어요. 파일 하나는 {maxMb}MB까지예요.
        </p>
        <label className="flex items-start gap-3 rounded-2xl bg-paper p-3">
          <input type="checkbox" className="mt-1 h-5 w-5 accent-[var(--color-accent)]" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>
            <span className="font-semibold">{CONSENT_TEXT}</span>
            <span className="mt-1 block text-sm text-ink-soft">녹음에 함께 나온 다른 사람의 목소리는 대화에 쓰지 않도록 다음 단계에서 고를 수 있어요.</span>
          </span>
        </label>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (consent) addFiles(e.dataTransfer.files);
          }}
          className={`rounded-3xl border-2 border-dashed p-6 text-center ${dragging ? "border-accent bg-accent-soft" : "border-line"} ${consent ? "" : "opacity-50"}`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            className="sr-only"
            id="file-input"
            accept={allowed.map((e) => `.${e}`).join(",")}
            disabled={!consent}
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <label htmlFor="file-input" className={`btn-primary ${consent ? "cursor-pointer" : "pointer-events-none"}`} aria-disabled={!consent}>
            파일 고르기
          </label>
          <p className="mt-2 text-sm text-ink-soft">{consent ? "또는 여기로 끌어다 놓으세요" : "위 안내를 확인하고 체크하면 고를 수 있어요"}</p>
        </div>
        {activeQueue.length > 0 && (
          <ul className="space-y-2" aria-live="polite">
            {activeQueue.map((i) => (
              <li key={i.key} className="rounded-2xl border border-line p-3">
                <div className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate">{i.name}</span>
                  <span className="text-sm text-ink-faint">{formatBytes(i.size)}</span>
                </div>
                {i.status === "uploading" && (
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-paper" role="progressbar" aria-valuenow={Math.round(i.progress * 100)} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full bg-accent transition-all" style={{ width: `${Math.round(i.progress * 100)}%` }} />
                  </div>
                )}
                <div className="mt-1 flex items-center gap-2 text-sm">
                  <span className={i.status === "error" || i.status === "rejected" ? "text-alert" : "text-ink-soft"}>
                    {i.status === "waiting" && "차례를 기다리는 중"}
                    {i.status === "uploading" && `올리는 중 ${Math.round(i.progress * 100)}%`}
                    {i.status === "done" && (i.message || "올렸어요")}
                    {(i.status === "error" || i.status === "rejected") && i.message}
                  </span>
                  {i.status === "error" && (
                    <button className="ml-auto font-semibold text-accent-strong underline underline-offset-4" onClick={() => update(i.key, { status: "waiting" })}>
                      다시 시도
                    </button>
                  )}
                  {(i.status === "error" || i.status === "rejected" || i.status === "done") && (
                    <button
                      className={`${i.status === "error" ? "" : "ml-auto"} text-ink-faint`}
                      onClick={() => {
                        files.current.delete(i.key);
                        setQueue((q) => q.filter((x) => x.key !== i.key));
                      }}
                      aria-label="목록에서 빼기"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AssetList spaceId={space.id} editable list={assets.data} reload={assets.reload} />

      {space.counts.pending_voice > 0 && (
        <Link href={`/spaces/${space.id}/voices`} className="btn-primary w-full">
          목소리 확인하러 가기 ({space.counts.pending_voice})
        </Link>
      )}

      <FindGuide />
    </div>
  );
}
