# 서준영 개인 홈페이지 — 설치 가이드

GitHub Pages(무료 호스팅)와 Supabase(무료 DB)를 연결해 운영하는 구성입니다.
주소: **https://threehoops.github.io**

```
index.html            페이지 구조
config.js             ★ 소개글·경력·링크·사진 경로·Supabase 키 (대부분 여기만 수정)
assets/style.css      디자인
assets/app.js         앨범·좋아요·댓글·방명록 동작
images/               hero.jpg(메인), profile.jpg(프로필), album/(미리보기용 샘플)
supabase/schema.sql   DB 테이블과 보안 규칙
email-signature.html  Gmail 서명 (따로 사용)
```

---

## 0. 먼저 미리보기

`index.html`을 브라우저로 열면 바로 미리보기(데모) 모드로 동작합니다.
데모 모드에서는 글·댓글·좋아요가 내 브라우저에만 임시 저장됩니다.
하단 `관리자` 버튼을 누르고 비밀번호 `demo`를 입력하면 사진 업로드도 시험해 볼 수 있습니다.

## 1. GitHub Pages에 올리기 (5분)

1. https://github.com 에 아이디 `threehoops`로 가입합니다. (이미 다른 사람이 쓰고 있으면 다른 아이디로 정하고, 아래 이름도 그 아이디로 바꾸세요.)
2. 오른쪽 위 **+ → New repository**를 누르고, 이름을 정확히 `threehoops.github.io`로, **Public**으로 만듭니다.
3. 저장소 화면에서 **uploading an existing file**을 누르고, 이 폴더 안의 파일과 폴더를 전부 끌어다 놓은 뒤 **Commit changes**를 누릅니다.
   (`index.html`이 저장소 맨 위에 있어야 합니다.)
4. 1–2분 뒤 `https://threehoops.github.io`에 접속하면 홈페이지가 보입니다.
   안 보이면 **Settings → Pages**에서 Branch가 `main` / `/ (root)`인지 확인하세요.

## 2. Supabase 만들기 (게시판 실제 저장용, 10분)

1. https://supabase.com 에 GitHub 계정으로 가입합니다. **New project**를 누르고 Region은 **Southeast Asia (Singapore)**를 고릅니다. DB 비밀번호는 아무 강한 값이면 됩니다.
2. 왼쪽 **SQL Editor**에 `supabase/schema.sql` 전체를 붙여넣고 **Run**합니다.
   - 파일 맨 위 `threehoops@gmail.com`이 앨범 관리자 이메일입니다. 다른 이메일을 쓰려면 이 값과 `config.js`의 `ownerEmail`을 함께 바꾸세요.
3. 관리자 계정 만들기: **Authentication → Users → Add user → Create new user**
   - Email: 위 관리자 이메일, Password: 원하는 비밀번호, **Auto Confirm User** 체크
4. 다른 사람이 가입하지 못하게 막기: **Authentication → Sign In / Providers**에서 **Allow new users to sign up**을 끕니다.
5. 키 복사: **Project Settings → API**(또는 상단 **Connect**)에서 다음 두 값을 복사합니다.
   - Project URL → `config.js`의 `supabaseUrl`
   - anon public key(또는 publishable key) → `supabaseAnonKey`
   - 이 키는 공개용이라 웹사이트에 넣어도 됩니다. **service_role / secret 키는 절대 넣지 마세요.**
6. GitHub 저장소에서 `config.js`를 열고 연필 아이콘으로 수정한 뒤 Commit합니다. 1–2분 뒤 새로고침하면 데모 배너가 사라지고 실제로 저장됩니다.

## 3. 운영하기

- **사진 올리기**: 페이지 맨 아래 `관리자` → 비밀번호로 로그인 → 앨범의 **새 사진 올리기**. 촬영일 기준으로 연도별 그룹이 자동으로 만들어집니다. 사진은 업로드 전에 1600px로 줄여서 원본이 서버에 남지 않습니다.
- **수정·삭제**: 관리자로 로그인한 상태에서 사진을 열면 수정/삭제 버튼이 보입니다. 부적절한 댓글과 방명록도 삭제할 수 있습니다.
- **이메일 확인**: 방문자가 남긴 이메일은 관리자 로그인 상태에서만 보입니다. 방문자에게는 DB 권한 수준에서 가려져 있습니다.
- **소개·경력·링크 수정**: `config.js`의 문장만 고치면 됩니다. 한국어(ko)와 영어(en)를 각각 적습니다.
- **사진 교체**: `images/hero.jpg`, `images/profile.jpg`를 같은 이름의 새 파일로 덮어쓰면 됩니다. 메인 사진은 세로 사진(4:5)이 가장 잘 어울립니다.
- 샘플 앨범(`images/album`, `config.js`의 `demoPosts`)은 데모 모드에서만 쓰입니다. 실제 앨범에 넣고 싶은 사진은 관리자 화면에서 올리세요.

## 4. 알아두실 점

- **사진 보호의 한계**: 우클릭, 드래그, 길게 눌러 저장, Ctrl+S/C/P, 인쇄를 막고 워터마크를 넣었습니다. 하지만 웹에 보이는 사진은 화면 캡처나 개발자 도구로 가져가는 것까지 완벽히 막을 수는 없습니다. 꼭 지켜야 하는 원본은 올리지 않는 것이 가장 안전합니다.
- **Supabase 무료 플랜**: 일정 기간(약 1주) 요청이 전혀 없으면 프로젝트가 일시정지될 수 있습니다. 그럴 땐 대시보드에서 **Restore**를 누르면 데이터 그대로 복구됩니다. 용량은 DB 500MB, 사진 저장소 1GB로, 1600px 사진 기준 수천 장까지 충분합니다.
- **좋아요**는 로그인 없이 브라우저당 1회입니다(다시 누르면 취소).
- **스팸 방지**: 이름·이메일 형식 검사와 자동 등록 봇을 걸러내는 숨김 필드가 들어 있습니다.
- **나중에 도메인 연결**: `.com` 도메인을 사면 GitHub **Settings → Pages → Custom domain**에 입력하고, 도메인 업체에서 안내하는 DNS 4개(A 레코드)를 등록하면 됩니다.
