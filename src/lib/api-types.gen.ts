// 자동 생성 파일입니다. 직접 고치지 말고 shared/schema.json을 고친 뒤 `make gen`을 실행하세요.

/** 정해진 태그 목록. 태깅(LLM·규칙)은 이 안에서만 고른다. */
export const TAG_VALUES = ["음식", "요리", "건강", "걱정", "공부", "일", "살림", "돈", "칭찬", "응원", "위로", "사랑", "그리움", "명절", "생일", "날씨", "계절", "여행", "어린시절", "젊은시절", "결혼", "조언", "잔소리", "웃음", "안부", "감사", "노래", "아들", "딸", "손주", "배우자", "부모님", "형제자매", "친구", "이웃", "집", "고향", "시장", "병원", "학교", "직장", "바다", "산", "밭"] as const;
export type Tag = (typeof TAG_VALUES)[number];

/** 대화 의도. 검색 때 관련 태그에 가산점을 준다. */
export const INTENT_VALUES = ["comfort", "cheer", "praise", "advice", "food", "health", "miss", "greeting", "story", "celebrate", "general"] as const;
export type Intent = (typeof INTENT_VALUES)[number];

/** 마음 돌봄 위험 수준. high면 클립보다 도움 안내를 먼저 보여 준다. */
export const CARE_LEVEL_VALUES = ["none", "watch", "high"] as const;
export type CareLevel = (typeof CARE_LEVEL_VALUES)[number];

export const ASSET_KIND_VALUES = ["audio", "video", "photo"] as const;
export type AssetKind = (typeof ASSET_KIND_VALUES)[number];

/** upload: 직접 올림, ahead: 미리 남기기 녹음, sample: 샘플 */
export const ASSET_SOURCE_VALUES = ["upload", "ahead", "sample"] as const;
export type AssetSource = (typeof ASSET_SOURCE_VALUES)[number];

/** 자료 출처 종류(사용자가 고르거나 파일명으로 추정) */
export const ORIGIN_LABEL_VALUES = ["call", "video", "voice_message", "ahead", "other"] as const;
export type OriginLabel = (typeof ORIGIN_LABEL_VALUES)[number];

export const ASSET_STATUS_VALUES = ["uploaded", "queued", "processing", "ready", "failed"] as const;
export type AssetStatus = (typeof ASSET_STATUS_VALUES)[number];

export const STAGE_NAME_VALUES = ["normalize", "stt", "diarize", "segment", "tag", "index"] as const;
export type StageName = (typeof STAGE_NAME_VALUES)[number];

export const STAGE_STATE_VALUES = ["pending", "running", "done", "skipped", "failed"] as const;
export type StageState = (typeof STAGE_STATE_VALUES)[number];

/** 날짜를 어디서 알아냈는지 */
export const DATE_SOURCE_VALUES = ["metadata", "filename", "exif", "user", "upload", "unknown"] as const;
export type DateSource = (typeof DATE_SOURCE_VALUES)[number];

export const SPEAKER_ROLE_VALUES = ["person", "other", "unknown"] as const;
export type SpeakerRole = (typeof SPEAKER_ROLE_VALUES)[number];

export const MEMBER_ROLE_VALUES = ["owner", "editor", "viewer"] as const;
export type MemberRole = (typeof MEMBER_ROLE_VALUES)[number];

/** ready: 재생 가능, placeholder: 샘플 녹음 준비 중, missing: 파일 없음 */
export const AUDIO_STATUS_VALUES = ["ready", "placeholder", "missing"] as const;
export type AudioStatus = (typeof AUDIO_STATUS_VALUES)[number];

export const PROVIDER_FUNCTION_VALUES = ["stt", "diarization", "llm", "embedding"] as const;
export type ProviderFunction = (typeof PROVIDER_FUNCTION_VALUES)[number];

export const PROVIDER_STATUS_VALUES = ["active", "not_configured", "blocked_by_policy", "needs_consent", "model_missing"] as const;
export type ProviderStatus = (typeof PROVIDER_STATUS_VALUES)[number];

export const LINK_STATUS_VALUES = ["active", "completed", "expired", "revoked"] as const;
export type LinkStatus = (typeof LINK_STATUS_VALUES)[number];

export const QUESTION_CATEGORY_VALUES = ["childhood", "youth", "love_family", "to_family", "life_advice", "food", "holidays", "everyday", "health_heart", "custom"] as const;
export type QuestionCategory = (typeof QUESTION_CATEGORY_VALUES)[number];

/** 기억 대화 답장의 종류. original: 원본 녹음, generated: AI가 만든 말(근거 표시), guide: 여운 안내, crisis: 위기 전환 */
export const TALK_MODE_VALUES = ["original", "generated", "guide", "crisis"] as const;
export type TalkMode = (typeof TALK_MODE_VALUES)[number];

export interface ErrorBody {
  /** 기계가 읽는 오류 코드 (예: not_found, quota_exceeded) */
  code: string;
  /** 사용자에게 보여 줄 한국어 문구 */
  message_ko: string;
}

export interface ErrorResponse {
  error: ErrorBody;
}

export interface Health {
  ok: boolean;
  version: string;
  db: boolean;
}

export interface AppLimits {
  max_file_mb: number;
  /** 0이면 제한 없음 */
  space_quota_mb: number;
  /** 0이면 제한 없음 */
  user_upload_quota_mb: number;
  /** 0이면 제한 없음 */
  chat_daily_limit: number;
  allowed_extensions: string[];
}

export interface AppConfig {
  env: "development" | "staging" | "production" | "test";
  signup_requires_invite: boolean;
  sample_space_id: string | null;
  limits: AppLimits;
  /** 음성으로 말 걸기(실제 음성 인식)가 가능한지 */
  stt_available: boolean;
}

export interface UserPrefs {
  large_text: boolean;
  /** 오래 사용하면 쉬어 가기 안내 */
  rest_reminder: boolean;
  rest_minutes: number;
  /** 입력을 학습에 쓰는 무료 AI 등급 사용 동의 (staging에서만 의미 있음) */
  consent_training_providers: boolean;
}

export interface UserPrefsUpdate {
  large_text?: boolean | null;
  rest_reminder?: boolean | null;
  rest_minutes?: number | null;
  consent_training_providers?: boolean | null;
}

export interface User {
  id: string;
  email: string;
  display_name: string;
  prefs: UserPrefs;
  created_at: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  display_name: string;
  invite_code?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface DeleteAccountRequest {
  password: string;
}

export interface SpaceCounts {
  assets: number;
  clips: number;
  /** 대화에 쓰이는(그 사람 목소리로 확인된) 클립 수 */
  person_clips: number;
  photos: number;
  /** 목소리 확인이 필요한 자료 수 */
  pending_voice: number;
  processing: number;
}

export interface Space {
  id: string;
  /** 공간 이름 (예: 엄마) */
  name: string;
  /** 그 사람의 이름 또는 부르는 말 */
  person_name: string;
  relationship?: string | null;
  birthday?: string | null;
  memorial_day?: string | null;
  note?: string | null;
  is_sample: boolean;
  role: MemberRole;
  counts: SpaceCounts;
  storage_bytes: number;
  /** 0이면 제한 없음 */
  storage_limit_bytes: number;
  created_at: string;
}

export interface SpaceCreate {
  name: string;
  person_name: string;
  relationship?: string | null;
  birthday?: string | null;
  memorial_day?: string | null;
  note?: string | null;
}

export interface SpaceUpdate {
  name?: string | null;
  person_name?: string | null;
  relationship?: string | null;
  birthday?: string | null;
  memorial_day?: string | null;
  note?: string | null;
}

export interface DeleteSpaceRequest {
  /** 실수 방지를 위해 공간 이름을 그대로 입력 */
  confirm_name: string;
}

export interface AssetStage {
  name: StageName;
  state: StageState;
  /** 예: '음성 인식 키가 없어 기본 방식으로 처리했어요' */
  note?: string | null;
}

export interface Asset {
  id: string;
  kind: AssetKind;
  source: AssetSource;
  origin: OriginLabel;
  filename: string;
  size_bytes: number;
  duration_sec?: number | null;
  recorded_at?: string | null;
  date_source: DateSource;
  status: AssetStatus;
  stages: AssetStage[];
  /** 0~1 */
  progress: number;
  error?: ErrorBody | null;
  clip_count: number;
  /** 사진일 때 서명된 미리보기 URL */
  thumb_url?: string | null;
  created_at: string;
}

export interface AssetUpdate {
  recorded_at?: string | null;
  origin?: OriginLabel | null;
}

export interface AssetList {
  assets: Asset[];
}

export interface PhotoRef {
  asset_id: string;
  /** 짧게 만료되는 서명 URL */
  url: string;
  date?: string | null;
  caption?: string | null;
}

/** 그 사람이 실제로 한 말(원본 녹음 클립). transcript는 언제나 DB에 저장된 원문 자막이며 AI가 만든 문장이 아니다. */
export interface ClipCard {
  clip_id: string;
  transcript: string;
  date?: string | null;
  /** 예: 2019년 2월 4일 / 날짜 모름 */
  date_label?: string | null;
  /** 예: 통화 녹음 · 2019년 2월 */
  source_label: string;
  audio_url?: string | null;
  audio_status: AudioStatus;
  start_sec: number;
  end_sec: number;
  photos: PhotoRef[];
  /** 미리 남기기 질문에 대한 답일 때 그 질문 */
  question?: string | null;
  tags: Tag[];
  favorite: boolean;
  /** 여운 안내: 이 클립을 고른 이유(그 사람의 말이 아님) */
  reason?: string | null;
}

export interface Clip {
  id: string;
  asset_id: string;
  speaker_id?: string | null;
  start_sec: number;
  end_sec: number;
  text: string;
  text_edited: boolean;
  tags: Tag[];
  /** 대화에 쓰이는지(최종 판단) */
  included: boolean;
  /** 클립별 직접 포함/제외. null이면 화자 선택을 따름 */
  include_override?: boolean | null;
  audio_url?: string | null;
  audio_status: AudioStatus;
  confidence?: number | null;
}

export interface ClipUpdate {
  text?: string | null;
  include_override?: boolean | null;
  /** true면 클립별 설정을 지우고 화자 선택을 따른다 */
  clear_override?: boolean | null;
  tags?: Tag[] | null;
}

export interface Speaker {
  id: string;
  asset_id: string;
  /** 예: 목소리 1 */
  label: string;
  role: SpeakerRole;
  clip_count: number;
  total_sec?: number | null;
  /** 대표 구간 */
  samples: Clip[];
}

export interface SpeakerUpdate {
  role: SpeakerRole;
}

export interface VoiceReviewAsset {
  asset: Asset;
  speakers: Speaker[];
  /** false면 화자 분리 없이 파일 단위로 고른다 */
  diarized: boolean;
  needs_review: boolean;
}

export interface VoiceReview {
  person_name: string;
  assets: VoiceReviewAsset[];
  pending_count: number;
}

export interface ClipList {
  clips: Clip[];
}

export interface ChatRequest {
  message: string;
}

export interface CareResource {
  name: string;
  phone: string;
  hours: string;
  description?: string | null;
}

export interface CareNotice {
  level: CareLevel;
  title: string;
  message: string;
  resources: CareResource[];
}

/** 여운 안내: 서비스가 하는 말. 그 사람이 한 말처럼 보이게 쓰지 않는다. */
export interface GuideMessage {
  text: string;
}

export interface ChatResponse {
  care?: CareNotice | null;
  guide: GuideMessage;
  clips: ClipCard[];
  /** false면 '딱 맞는 녹음은 없어요' */
  matched: boolean;
  /** 맞는 녹음이 없을 때 보여 줄 가까운 추억 */
  nearby: ClipCard[];
  intent?: Intent | null;
  keywords: string[];
  /** 클립을 고른 방식 (mock, anthropic 등) */
  picker: string;
  remaining_today?: number | null;
}

export interface TranscribeResponse {
  text: string;
}

/** STT 결과 형식 */
export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  speaker?: string | null;
  confidence?: number | null;
}

/** LLM 의도 파악 출력. 서버에서 이 스키마로 검증한다. */
export interface LLMIntent {
  intent: Intent;
  keywords: string[];
  tags: Tag[];
  risk: CareLevel;
}

export interface LLMPick {
  clip_id: string;
  reason: string;
}

/** LLM 클립 고르기 출력. 후보에 없는 clip_id, 지어낸 인용은 서버가 버린다. */
export interface LLMSelection {
  picks: LLMPick[];
  no_good_match: boolean;
  guide: string;
}

export interface LLMClipTags {
  clip_id: string;
  tags: Tag[];
}

export interface LLMTagging {
  clips: LLMClipTags[];
}

export interface TimelineItem {
  kind: "clip" | "photo";
  clip?: ClipCard | null;
  photo?: PhotoRef | null;
}

export interface TimelineDay {
  date: string | null;
  label: string;
  items: TimelineItem[];
}

export interface Timeline {
  days: TimelineDay[];
  /** 1년 전(또는 그 전) 오늘 */
  on_this_day: TimelineItem[];
  tag_counts: Record<string, number>;
  total: number;
}

export interface FavoriteUpdate {
  favorite: boolean;
}

export interface QuestionCard {
  id: string;
  category: QuestionCategory;
  text: string;
  tags?: Tag[];
}

export interface QuestionCategoryInfo {
  id: QuestionCategory;
  label: string;
}

export interface QuestionDeck {
  categories: QuestionCategoryInfo[];
  cards: QuestionCard[];
}

export interface RecordingLinkCreate {
  question_ids: string[];
  custom_questions?: string[];
  /** 녹음하는 분께 보일 보낸 사람 이름 */
  sender_name?: string | null;
  /** 녹음하는 분께 보일 한마디 */
  message?: string | null;
  expires_days?: number;
}

export interface LinkQuestion {
  id: string;
  text: string;
  answered: boolean;
  asset_id?: string | null;
}

export interface RecordingLink {
  id: string;
  /** 만들 때 한 번만 내려 준다 (토큰은 서버에 해시로만 저장) */
  url?: string | null;
  status: LinkStatus;
  sender_name?: string | null;
  questions: LinkQuestion[];
  answered_count: number;
  expires_at: string;
  created_at: string;
}

export interface RecordingLinkList {
  links: RecordingLink[];
}

/** 로그인 없이 녹음하는 화면에 내려 주는 정보 */
export interface RecorderSession {
  sender_name?: string | null;
  message?: string | null;
  questions: LinkQuestion[];
  expires_at: string;
  consent_text: string;
  max_seconds: number;
}

export interface ProviderInfo {
  function: ProviderFunction;
  provider: string;
  display_name: string;
  is_external: boolean;
  /** 입력 데이터를 학습에 쓰는 등급인지 */
  trains_on_input: boolean;
  /** 이 서비스로 보내는 데이터 (예: 오디오, 자막 텍스트) */
  data_sent: string;
  retention_note: string;
  status: ProviderStatus;
  note?: string | null;
}

export interface ProviderList {
  providers: ProviderInfo[];
  /** 여운이 자료를 보관하는 기간 안내 */
  retention: string[];
}

export interface Member {
  user_id: string;
  display_name: string;
  email: string;
  role: MemberRole;
}

export interface MemberList {
  members: Member[];
  invites: Invite[];
}

export interface MemberUpdate {
  role: MemberRole;
}

export interface InviteCreate {
  role: MemberRole;
}

export interface Invite {
  id: string;
  role: MemberRole;
  url?: string | null;
  expires_at: string;
}

export interface InvitePreview {
  space_name: string;
  inviter_name: string;
  role: MemberRole;
}

/** 앱 안 알림(기일·생일). 밤 늦게(22시~8시) 새로 띄우지 않는다. */
export interface Notice {
  id: string;
  kind: "birthday" | "memorial" | "on_this_day";
  space_id: string;
  title: string;
  message: string;
}

export interface NoticeList {
  notices: Notice[];
}

export interface Collection {
  id: string;
  title: string;
  clip_ids: string[];
  clips?: ClipCard[];
  created_at: string;
}

export interface CollectionCreate {
  title: string;
  clip_ids?: string[];
}

export interface CollectionUpdate {
  title?: string | null;
  clip_ids?: string[] | null;
}

export interface CollectionList {
  collections: Collection[];
}

export interface TalkTurn {
  role: "user" | "reply";
  text: string;
}

export interface TalkRequest {
  message: string;
  history?: TalkTurn[];
}

export interface TalkResponse {
  mode: TalkMode;
  /** generated면 AI가 만든 말(그 사람 말투), 그 밖에는 여운 안내 */
  text: string;
  /** original: 들려줄 원본 */
  clips: ClipCard[];
  /** generated: 근거가 된 원본 */
  sources: ClipCard[];
  care?: CareNotice | null;
  provider: string;
  remaining_today?: number | null;
}

/** 녹음에서 뽑은 그 사람의 말하기 특징 (대화 답의 말투를 맞추는 데만 쓴다) */
export interface LLMPersonaCard {
  /** 듣는 가족을 부르는 말 (예: 우리 강아지) */
  calls_user: string;
  /** 자기를 부르는 말 (예: 할매) */
  self_ref: string;
  /** 어미·사투리·말버릇 요약 */
  speech_style: string;
  /** 자주 쓰는 표현 (자막 그대로) */
  phrases: string[];
  /** 자주 나오는 이야기 주제 */
  topics: string[];
}

/** 대화 답장 하나. use_clip_id가 후보 안의 클립이면 그 원본 녹음을 그대로 답장으로 쓴다. */
export interface LLMTalkReply {
  refuse: boolean;
  /** 원본 녹음 하나가 그대로 답이 되면 그 clip_id, 아니면 빈 문자열 */
  use_clip_id: string;
  text: string;
  source_clip_ids: string[];
}

/** 목소리로 화자를 나누지 못한 녹음을 내용으로 나눈 결과. labels는 문장 순서대로 A 또는 B. */
export interface LLMSpeakerSplit {
  labels: ("A" | "B")[];
}
