import type { Metadata } from "next";
import { Shell, PageTitle } from "@/components/Shell";

export const metadata: Metadata = { title: "개인정보 처리방침(초안) — 여운" };

export default function PrivacyPage() {
  return (
    <Shell back={{ href: "/", label: "처음으로" }}>
      <PageTitle title="개인정보 처리방침 (초안)" sub="친구 테스트용 초안이에요. 정식 서비스 전에 법률 검토를 받아 고칠 예정이에요." />
      <article className="card space-y-5 text-[0.95rem] leading-relaxed">
        <section>
          <h2 className="font-bold">1. 모으는 정보</h2>
          <ul className="list-disc pl-5 text-ink-soft">
            <li>계정: 이메일, 부르는 이름, 비밀번호(argon2 해시로만 저장)</li>
            <li>추억 공간: 그분의 이름·관계·생일·기일, 올린 녹음·영상·사진 원본, 받아쓴 자막과 태그</li>
            <li>미리 남기기: 녹음하는 분의 음성과 동의 시각</li>
            <li>이용 기록: 하루 대화 횟수(대화 내용은 저장하지 않음)</li>
          </ul>
        </section>
        <section>
          <h2 className="font-bold">2. 쓰는 목적</h2>
          <p className="text-ink-soft">올린 분과 초대받은 가족이 그분의 실제 목소리를 정리하고 다시 찾아 듣게 하는 데만 써요. 그분의 목소리나 말투로 새 문장·새 음성을 만들지 않고, 광고나 다른 목적에 쓰지 않아요.</p>
        </section>
        <section>
          <h2 className="font-bold">3. 보관과 삭제</h2>
          <ul className="list-disc pl-5 text-ink-soft">
            <li>파일은 공간별 키로 암호화(AES-GCM)해 보관하고, 짧게 만료되는 링크로만 재생해요.</li>
            <li>자료·공간·계정을 지우면 원본, 클립, 자막, 검색 색인, 처리 기록이 함께 바로 지워져요.</li>
            <li>언제든 전체 내보내기(원본 + 자막)를 할 수 있어요.</li>
          </ul>
        </section>
        <section>
          <h2 className="font-bold">4. 외부 서비스</h2>
          <p className="text-ink-soft">받아쓰기·검색을 위해 외부 AI 서비스(예: OpenAI, Anthropic, Google)를 쓸 수 있어요. 어떤 서비스로 무엇이 가는지는 각 공간의 설정 → 외부 서비스에서 볼 수 있어요. 입력을 학습에 쓰는 무료 등급은 정식 서비스에서 실제 사용자 자료에 쓰지 않아요.</p>
        </section>
        <section>
          <h2 className="font-bold">5. 다른 사람의 목소리</h2>
          <p className="text-ink-soft">녹음에는 함께 대화한 다른 사람의 목소리가 들어 있을 수 있어요. 올릴 때 권리와 그분들의 뜻을 존중한다는 확인을 받고, 목소리 확인 단계에서 다른 사람의 목소리는 대화에 쓰지 않도록 고를 수 있어요.</p>
        </section>
        <section>
          <h2 className="font-bold">6. 문의</h2>
          <p className="text-ink-soft">삭제 요청·문의는 서비스 운영자에게 연락해 주세요(연락처는 정식 서비스 전에 적을 예정).</p>
        </section>
      </article>
    </Shell>
  );
}
