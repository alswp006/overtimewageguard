# 디자인 품질 감사 보고서

- 대상: overtimewageguard (Vite + React + TDS 앱인토스 미니앱)
- 범위: src/App.tsx, src/router.tsx, src/pages/*, src/components/*, src/hooks/*, src/lib/*
- 검증: `npx tsc --noEmit` 통과, `npx vitest run` 40/40 통과, `npx vite build` 성공

## 요약 점수

| 항목 | 점수 (0-4) |
| --- | --- |
| 접근성 (Accessibility) | 3 |
| 성능 (Performance) | 3 |
| 다크모드 (Theming) | 4 |
| TDS 준수 (Design System Compliance) | 3 |

---

## 1. 접근성 — 3/4

**긍정적**
- 모든 1차 CTA가 `FixedBottomCTA`/TDS `Button`으로 구현되어 네이티브 포커스·키보드 활성화(Enter/Space)를 그대로 상속한다.
- 아이콘 전용 버튼이 코드베이스에 존재하지 않는다(`IconButton`/`<img>` 미사용) — 라벨 없는 터치 타겟 자체가 없다.
- `AppErrorBoundary`의 폴백 재시도 버튼은 네이티브 `<button type="button">` + 텍스트 라벨("다시 시도")로 구현되어 TDS 렌더 실패 상황에서도 스크린리더가 인식 가능하다.
- 탭 순서는 DOM 순서(top → 본문 → bottom CTA)를 그대로 따르며 별도 `tabIndex` 조작이 없어 예측 가능하다.
- 색상은 전부 `tdsColor` 토큰(`var(--tds-color-*)` → `--adaptive*` → 시스템 색상 폴백)을 경유하므로 TDS가 보장하는 AA 명암비를 그대로 상속한다.

**미흡**
- `RecordsPage`의 기록 리스트(`ListRow`)가 시각적으로는 날짜/시간 텍스트로 구분되지만, 진행 중 근무("근무중")와 완료 근무를 구분하는 정보가 색상이나 아이콘 없이 텍스트에만 의존한다. 스크린리더 사용자에게는 문제 없으나 저시력 사용자에게는 상태 구분이 약할 수 있다 (P2 — 기능 변경 없이 배지/색상 추가가 필요해 자동 수정 대상 아님).
- `EmptyState`의 `<div>` 컨테이너에 `role`이나 `aria-live`가 없어, 기록 추가 후 빈 상태 → 목록으로 전환될 때 스크린리더가 변경을 자동 공지하지 않는다 (P2, 동작 변경 소지가 있어 보고만 함).

---

## 2. 성능 — 3/4

**긍정적**
- `computeMonthlySummary`(O(n) reduce)는 `HomePage`/`ReportPage` 모두 `useMemo(..., [records, settings])`로 감싸 불필요한 재계산을 막는다.
- `RecordsPage`의 정렬된 리스트도 `useMemo`로 캐시된다.
- localStorage 훅(`useRecords`/`useSettings`/`usePayslips`)의 CRUD 함수는 전부 `useCallback`으로 안정된 참조를 유지해 하위 리렌더를 유발하지 않는다.
- 이미지 자산이 프로젝트에 전혀 없어 lazy-loading 이슈가 존재하지 않는다.
- `package.json` 의존성은 CLAUDE.md가 요구하는 플랫폼 필수 패키지(TDS, AIT SDK, emotion, react-router)로만 구성되어 불필요한 라이브러리가 없다.

**수정함 (P1)**
- `src/components/AppErrorBoundary.tsx`: `type ErrorInfo`를 import했지만 어디서도 사용하지 않던 미사용 import를 제거함. (동작 변경 없음, `npx tsc --noEmit` / `npx vite build` / `npx vitest run` 모두 재확인 통과)

**미흡 (보고만, 수정 안 함)**
- 프로덕션 번들이 1.2MB(gzip 393KB)로 Vite 경고 임계치(500KB)를 초과한다. 원인은 `@toss/tds-mobile` + `@toss/tds-mobile-ait` 자체의 크기이며, 이 패키지들은 CLAUDE.md에 의해 제거·대체가 금지된 플랫폼 필수 의존성이다. 코드 스플리팅(`React.lazy` 라우트 분할)으로 초기 로드는 줄일 수 있으나, 페이지가 3개뿐인 현재 규모에서는 효과가 제한적이라 "just in case" 수정을 하지 않았다 (P2, 페이지 수가 늘어날 때 재검토 권장).
- `src/hooks/usePayslips.ts`와 그에 딸린 `PayslipCheck` 타입·`storage.ts`의 `getPayslips`/`setPayslips`가 어떤 페이지에서도 import되지 않는 죽은 코드다. 삭제 여부는 비즈니스 로직/향후 로드맵 판단이 필요해 P2로만 보고한다.

---

## 3. 다크모드 — 4/4

- 색상 토큰이 `src/lib/theme.ts` 한 곳(`tdsColor`)에서만 정의되고, 전 컴포넌트가 이를 통해서만 색을 사용한다. 코드베이스 전체에서 하드코딩 HEX(`#RRGGBB` 등) 검색 결과 0건.
- 모든 토큰이 `var(--tds-color-*, var(--adaptive*, <시스템색>))` 3단 폴백 체인을 따른다 — TDS 토큰 부재 시에도 어댑티브 토큰, 최종적으로 OS 시스템 색상(`Canvas`/`CanvasText`/`LinkText`/`GrayText`)으로 자연스럽게 대체되어 라이트/다크 전환 시 대비가 깨지지 않는다.
- `AppErrorBoundary`의 네이티브 폴백 버튼도 인라인 스타일에서 `tdsColor.primary`/`tdsColor.onPrimary`만 사용해 예외적으로 하드코딩된 색이 없다.
- `main.tsx`(`@AI:ANCHOR`)의 `TDSMobileAITProvider`가 그대로 유지되어 `--adaptive*` CSS 변수가 정상 주입된다 — 수정하지 않음(요구사항대로 보존 확인만 수행).

이 항목은 만점이며 추가 조치 불필요.

---

## 4. TDS 준수 — 3/4

**긍정적**
- Tailwind 클래스(`className="..."`) 사용 0건 — 전체 검색 결과 없음.
- `Button` variant는 `fill`(기본값, 미지정) / `weak` 두 가지만 사용되며 `node_modules/@toss/tds-mobile`의 실제 `TDSButtonVariant` 타입과 대조 확인함. 1차 CTA는 전부 `display="block"` 또는 `SubmitFooter`(FixedBottomCTA)로 구성되어 "좌측 글자폭" 함정이 없다.
- `ListRow`에 `padding` prop을 넘기는 곳이 없음(전체 검색 결과 0건) — `border="none"`만 사용.
- `FixedBottomCTA`/`SubmitFooter` 내부에 `<Button>`을 중첩한 곳이 없음(버튼-안-버튼 무효 HTML 없음).
- 페이지 3개 모두 `ScreenScaffold`(PageShell + top + body + bottom 슬롯) 골격을 사용하고, 결과/비교 정보는 `Card`로 묶여 있다.
- SDK 호출(`generateHapticFeedback`)이 `try/catch`로 가드되어 있다(`BottomCTA.tsx`).

**미흡**
- `Card`/`PageShell`/`ScreenScaffold`/`EmptyState`/`AppErrorBoundary`의 폴백 버튼이 TDS `Spacing` 컴포넌트 대신 인라인 `style={{ margin, padding }}`으로 간격을 준다. 다만 이들은 CLAUDE.md가 "이미 구현됨 — import해서 쓰고 재구현 금지"라고 명시한 사전 제작 골격 컴포넌트 자체이므로, 내부 구현을 뜯어고치는 것은 감사 범위(비즈니스 로직 변경 금지, 확신 없으면 미수정)를 벗어난다고 판단해 손대지 않았다 (P2, 정보성 기록).
- `TextField` 컴포넌트가 프로젝트 어디에도 사용되지 않는다(입력은 전부 버튼/탭 기반 근태 기록이라 텍스트 입력 화면이 없음) — 위반이 아니라 해당 없음(N/A)으로 처리.

**감점 사유**: Card 계열 골격 컴포넌트의 커스텀 padding/margin이 "TDS Spacing 미사용" 규칙과 문자 그대로는 배치되어 3점(완전한 4점은 아님)으로 평가했다. 단, 이는 설계상 허용된 재사용 컴포넌트 내부 구현이라 자동 수정 대상에서 제외함.

---

## 적용한 수정 사항 (P0/P1)

| 파일 | 내용 | 검증 |
| --- | --- | --- |
| `src/components/AppErrorBoundary.tsx` | 미사용 `ErrorInfo` type import 제거 | `tsc --noEmit` ✅ / `vite build` ✅ / `vitest run` 40/40 ✅ |

## P2/P3 (보고만, 미수정)

1. (P2·성능) 미사용 `usePayslips`/`PayslipCheck`/`getPayslips`/`setPayslips` 죽은 코드 — 삭제는 로드맵 판단 필요.
2. (P2·성능) 프로덕션 번들 1.2MB(gzip 393KB) — TDS/AIT SDK 자체 크기, 필수 의존성이라 축소 불가. 페이지 증가 시 라우트 코드 스플리팅 검토.
3. (P2·접근성) 진행 중/완료 근무 기록의 시각적 구분이 텍스트에만 의존.
4. (P2·접근성) `EmptyState`↔목록 전환 시 `aria-live` 부재.
5. (P2·TDS 준수) 골격 컴포넌트(Card/PageShell/ScreenScaffold/EmptyState)의 인라인 margin/padding — 사전 제작 컴포넌트라 범위 밖으로 판단.
