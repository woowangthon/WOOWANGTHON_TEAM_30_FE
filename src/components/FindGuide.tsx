"use client";

import { useState } from "react";

const TABS = [
  {
    id: "galaxy",
    label: "갤럭시 통화 녹음",
    steps: [
      "‘내 파일’ 앱 → 내장 저장공간 → Recordings → Call 폴더를 열어 보세요. (기종·버전에 따라 ‘Call’ 또는 ‘통화’ 폴더예요.)",
      "또는 ‘전화’ 앱 → 최근 기록 → 그분과의 통화를 누르면 녹음 파일이 보일 수 있어요.",
      "파일 이름에 날짜가 들어 있어요(예: …_230512_143005.m4a). 여운이 날짜를 자동으로 읽어요.",
    ],
  },
  {
    id: "iphone",
    label: "아이폰",
    steps: [
      "통화 녹음(iOS 18.1 이상): ‘메모’ 앱의 ‘통화 녹음’ 폴더 → 녹음을 길게 눌러 오디오를 ‘파일에 저장’해요.",
      "음성 메모: ‘음성 메모’ 앱 → 녹음 선택 → … → ‘파일에 저장’.",
      "저장한 파일은 이 화면의 ‘파일 고르기’에서 ‘파일’ 탭으로 고를 수 있어요.",
    ],
  },
  {
    id: "kakao",
    label: "카카오톡 음성 메시지",
    steps: [
      "채팅방 → 메뉴(≡) → 설정(톱니바퀴) → ‘대화 내용 내보내기’에서 사진·동영상·음성을 함께 저장할 수 있어요(안드로이드).",
      "저장된 음성 파일(.m4a 등)은 ‘내 파일’ → Download 또는 KakaoTalk 폴더에 있어요.",
      "앱 버전에 따라 메뉴 이름이 조금 다를 수 있어요. 어려우면 가족에게 함께 찾아 달라고 해 보세요.",
    ],
  },
  {
    id: "video",
    label: "휴대폰 동영상",
    steps: [
      "갤러리·사진 앱에서 그분 목소리가 담긴 영상을 골라 올리세요(mp4, mov).",
      "여운은 영상에서 소리만 꺼내 클립을 만들어요. 화면은 쓰지 않아요.",
      "영상이 25MB보다 크면 휴대폰에서 ‘자르기’로 그분이 말하는 부분만 남겨 주세요.",
    ],
  },
  {
    id: "old",
    label: "예전 휴대폰·컴퓨터",
    steps: [
      "예전 휴대폰을 컴퓨터에 연결해 녹음 폴더를 복사한 뒤, 컴퓨터 브라우저에서 올릴 수 있어요.",
      "구글 드라이브·네이버 MYBOX·iCloud에 백업해 두었다면 거기서 내려받아 올려도 돼요.",
    ],
  },
];

export function FindGuide() {
  const [tab, setTab] = useState(TABS[0].id);
  const current = TABS.find((t) => t.id === tab)!;
  return (
    <section className="card" aria-labelledby="find-guide-title">
      <h2 id="find-guide-title" className="font-semibold">녹음은 어디에 있나요?</h2>
      <div role="tablist" className="-mx-1 mt-3 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`chip min-h-10 ${tab === t.id ? "border-accent bg-accent-soft text-accent-strong" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <ol role="tabpanel" className="mt-4 list-decimal space-y-2 pl-5 text-[0.95rem] text-ink-soft">
        {current.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
    </section>
  );
}
