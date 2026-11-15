# 화면 이미지 프롬프트

지금 `public/images/`의 이미지는 디자인 목업에서 잘라 2배로 키운 임시본입니다.
아래 프롬프트로 새로 만든 이미지를 **같은 파일 이름**으로 덮어쓰면 코드 수정 없이 바뀝니다. (webp 권장, jpg/png라면 확장자를 맞춰 코드의 경로도 바꿔 주세요.)

## 공통 스타일 (모든 프롬프트 끝에 붙이기)

```
soft hand-painted gouache and watercolor illustration, warm morning sunlight, gentle leaf shadows on walls, cream, beige and muted sage-green palette, nostalgic and calm Korean home atmosphere, no people, no text, no logo, high detail, soft edges
```

## 필수

| 파일 | 크기·비율 | 쓰는 곳 |
|---|---|---|
| `hero-kitchen.webp` | 1600×1000 (16:10) | 홈 맨 위 공간 카드 오른쪽 |
| `chapter-kitchen.webp` | 1200×440 (약 2.7:1) | 주제 카드 (음식·요리·살림·집) |
| `chapter-table.webp` | 1200×440 | 주제 카드 (가족·사랑·명절·응원) |
| `chapter-walk.webp` | 1200×440 | 주제 카드 (계절·날씨·여행·고향) |

**hero-kitchen**
```
A cozy old Korean grandmother's kitchen corner, round dining table with a pastel plaid tablecloth, a white ceramic mug with leaf pattern and a wooden bowl of tangerines, a wooden chair, lace curtain on a sage-green window frame, sage-green cabinets with a striped towel, steel pot on a gas stove, ladles hanging on the wall. The left third of the image is a soft, empty cream wall fading to light.
```

**chapter-kitchen**
```
Close-up of a cream enamel kettle steaming on an old gas stove, small ceramic jars and a wooden spoon beside it, soft blurred kitchen background, the steam lit by window light.
```

**chapter-table**
```
A Korean family dinner table seen from a low angle, many small banchan dishes (kimchi, braised side dishes, greens), bowls of white rice, wooden table, blurred wooden chairs, warm and homely.
```

**chapter-walk**
```
A quiet neighborhood walking path in early autumn, pink and white cosmos flowers along the side, tall trees with dappled sunlight, a narrow dirt path disappearing into the distance.
```

## 선택 (주제 카드 그림을 더 다양하게)

- `chapter-letter.webp`: a handwritten letter, old family photos and a pair of reading glasses on a wooden desk by the window
- `chapter-study.webp`: a student's desk at night with an open workbook, pencils and a small lunch box wrapped in cloth, warm lamp light
- `chapter-hometown.webp`: a small countryside village with low tiled-roof houses, a vegetable field and distant mountains at golden hour

선택 이미지를 넣으면 `src/components/SpaceHome.tsx`의 `CHAPTER_ART` 목록에 한 줄씩 더하면 됩니다.
