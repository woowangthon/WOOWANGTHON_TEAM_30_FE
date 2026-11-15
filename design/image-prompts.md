# 화면 이미지 프롬프트

`landing-hero.webp`, `auth-side.webp`는 새로 만든 그림이 들어가 있어요. 나머지는 디자인 목업에서 잘라 키운 임시본입니다(같은 그림을 여러 이름으로 복사해 둔 것도 있어요).
아래 프롬프트로 새로 만든 이미지를 **같은 파일 이름(webp)** 으로 덮어쓰면 코드 수정 없이 바뀝니다.

## 공통 스타일 (모든 프롬프트 끝에 붙이기)

서비스 색은 '해질녘 여운'(따뜻한 흰 바탕, 먹 갈색, 대추색)이에요. 받은 그림들과 결이 맞도록 따뜻한 수채화와 청화백자 무늬를 유지해요.

```
soft hand-painted watercolor illustration with delicate ink linework, warm morning sunlight, gentle leaf shadows, clean off-white hanji paper tones, small accents of deep indigo blue (like blue-and-white porcelain), muted natural wood colors, nostalgic and calm Korean home atmosphere, no people, no faces, no text, no letters, no logo, high detail, soft edges
```

크기(비율)는 프롬프트 글이 아니라 **생성기의 비율·크기 설정**에서 고르세요. 아래 표의 비율을 쓰면 돼요.

## 파일 목록

| 파일 | 크기·비율 | 쓰는 곳 |
|---|---|---|
| `landing-hero.webp` ✅ | 16:9 가로 (받은 그림 1672×941) | 첫 화면 오른쪽, 대화 미리보기 카드 뒤 배경 |
| `auth-side.webp` ✅ | 9:16 세로 (받은 그림 941×1672) | 로그인·가입·초대 화면 왼쪽 그림 판 |
| `hero-kitchen.webp` ✅ | 1600×1000 (16:10) | 공간 홈 맨 위 카드, 내 공간 목록 카드 띠 |
| `chapter-kitchen.webp` ✅ | 1200×440 (약 2.7:1) | 홈 주제 카드 (음식·요리·살림·집) |
| `chapter-table.webp` ✅ | 1200×440 | 홈 주제 카드 (가족·사랑·명절·응원) |
| `chapter-walk.webp` ✅ | 1200×440 | 홈 주제 카드 (계절·날씨·여행·고향) |
| `ahead-tea.webp` ✅ | 1200×900 (4:3) | 첫 화면 '미리 남겨 두기' 칸 |
| `sidebar-leaves.webp` (선택) | 600×900 (2:3 세로) | 공간 화면 왼쪽 메뉴 아래쪽, 은은한 잎 그림자. 없으면 안 보여요 |
| `empty-letters.webp` ✅ | 1400×500 (약 2.8:1) | 내 공간 목록이 비었을 때 |

## 프롬프트

**landing-hero** — 대화 카드가 오른쪽에 겹치므로 오른쪽은 단순하게
```
A sunlit corner of an old Korean living room by a large window, lace curtain moving softly, a low wooden table with an old smartphone and a cup of barley tea, potted plants on the windowsill, leaf shadows across a cream wall. The right half of the image is calm and simple with soft cream wall and light, leaving space for an overlay.
```

**auth-side** — 세로 그림, 아래쪽에 흰 글씨가 올라가므로 아래는 어둡고 단순하게
```
Vertical composition. An old wooden window frame painted sage green, morning light pouring in through a lace curtain, a wooden chair and a small table with a ceramic mug, long leaf shadows on the floor. The lower third is a soft, slightly darker shaded floor area with little detail, suitable for white text on top.
```

**hero-kitchen** — 왼쪽 1/3에 글씨가 올라가므로 비워 두기
```
A cozy old Korean grandmother's kitchen corner, round dining table with a pastel plaid tablecloth, a white ceramic mug with leaf pattern and a wooden bowl of tangerines, a wooden chair, lace curtain on a sage-green window frame, sage-green cabinets with a striped towel, steel pot on a gas stove, ladles hanging on the wall. The left third of the image is a soft, empty cream wall fading to light.
```

**chapter-kitchen**
```
Wide panoramic close-up of a cream enamel kettle steaming on an old gas stove, small ceramic jars and a wooden spoon beside it, soft blurred kitchen background, the steam lit by window light.
```

**chapter-table**
```
Wide panoramic view of a Korean family dinner table from a low angle, many small banchan dishes (kimchi, braised side dishes, seasoned greens), bowls of white rice, wooden table, blurred wooden chairs in the background, warm and homely.
```

**chapter-walk**
```
Wide panoramic view of a quiet neighborhood walking path in early autumn, pink and white cosmos flowers along the side, tall trees with dappled sunlight, a narrow dirt path disappearing into the distance.
```

**ahead-tea** — 부모님이 질문 카드에 답을 녹음하는 느낌
```
A warm tea table near a window: an old smartphone propped up on a small stand showing a simple recording screen with no text, a handwritten paper card with blank lines, reading glasses, a cup of green tea and a few tangerines, afternoon sunlight.
```

**empty-letters** — 빈 화면이라 조용하고 여백 많게
```
Wide panoramic still life on a wooden desk by a window: a small stack of old family letters tied with string, an empty photo frame, a dried flower and an old cassette tape, lots of soft cream negative space, very calm and quiet mood.
```

## 더 넣고 싶으면 (선택)

주제 카드 그림을 다양하게 하려면 아래를 만들어 넣고 `src/components/SpaceHome.tsx`의 `CHAPTER_ART` 목록에 한 줄씩 더하세요.

- `chapter-letter.webp`: a handwritten letter, old family photos and a pair of reading glasses on a wooden desk by the window
- `chapter-study.webp`: a student's desk at night with an open workbook, pencils and a small lunch box wrapped in cloth, warm lamp light
- `chapter-hometown.webp`: a small countryside village with low tiled-roof houses, a vegetable field and distant mountains at golden hour

**sidebar-leaves** (선택) — 메뉴 바탕에 곱하기로 깔리므로 흰 바탕에 연한 그림자만
```
Vertical image, 2:3 aspect ratio, 600x900 pixels. Soft blurry shadows of leaves and a thin branch cast on a plain warm off-white wall, the shadows concentrated in the lower half and fading out toward the top, very low contrast, pale warm gray-brown shadows only, pure off-white background, no objects, no plants visible, only shadows. Soft hand-painted watercolor texture, no text, no letters, no logo.
```
