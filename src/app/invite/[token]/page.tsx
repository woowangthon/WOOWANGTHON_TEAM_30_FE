"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, errorMessage } from "@/lib/api";
import { useApi, useMe } from "@/lib/hooks";
import type { InvitePreview } from "@/lib/api-types.gen";
import { Shell, PageTitle } from "@/components/Shell";
import { ErrorBox, Spinner } from "@/components/Feedback";

const ROLE: Record<string, string> = { viewer: "보기", editor: "편집", owner: "소유자" };

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const preview = useApi<InvitePreview>(`/invites/${token}`);
  const me = useMe(false);
  const [err, setErr] = useState("");
  const next = `/invite/${token}`;

  return (
    <Shell>
      {preview.error ? (
        <ErrorBox message={preview.error.messageKo} />
      ) : !preview.data ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
          <PageTitle
            title={`'${preview.data.space_name}' 추억 공간에 초대받았어요`}
            sub={`${preview.data.inviter_name} 님이 ${ROLE[preview.data.role]} 권한으로 초대했어요.`}
          />
          <p className="text-ink-soft">이 공간은 초대받은 가족만 볼 수 있어요. 함께 목소리를 듣고 추억을 나눠 보세요.</p>
          {me.data ? (
            <button
              className="btn-primary w-full"
              onClick={async () => {
                try {
                  const r = await api.post<{ space_id: string }>(`/invites/${token}/accept`);
                  router.replace(`/spaces/${r.space_id}`);
                } catch (e) {
                  setErr(errorMessage(e));
                }
              }}
            >
              {me.data.display_name} 님으로 함께하기
            </button>
          ) : (
            <div className="grid gap-2">
              <Link className="btn-primary" href={`/signup?next=${encodeURIComponent(next)}`}>가입하고 함께하기</Link>
              <Link className="btn-ghost" href={`/login?next=${encodeURIComponent(next)}`}>이미 계정이 있어요</Link>
            </div>
          )}
          {err && <ErrorBox message={err} />}
        </div>
      )}
    </Shell>
  );
}
