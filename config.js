/* =========================================================
   사이트 설정 파일 — 내용은 대부분 여기서만 고치면 됩니다.
   ========================================================= */
window.SITE_CONFIG = {

  /* 1) Supabase 연결 정보 (README 3단계 참고)
        비워두면 '미리보기(데모) 모드'로 동작합니다.
        데모 모드에서는 글이 내 브라우저에만 임시 저장됩니다. */
  supabaseUrl: "https://abcdefgh.supabase.co",          // 예: "https://abcdefgh.supabase.co"
  supabaseAnonKey: "e31578f1-6749-41a0-ad1e-d74d4b133b0c",      // 예: "eyJhbGciOi..." (anon public key)
  ownerEmail: "threehoops@gmail.com",   // 앨범 관리자 로그인 이메일
  storageBucket: "album",

  /* 2) 기본 정보 */
  name:   { ko: "서준영", en: "Junyoung Seo" },
  role:   { ko: "법인장 · General Director", en: "General Director" },
  company:{ ko: "퓨넥스테크 · 한에너지솔루션 (HES)", en: "FUNEX TECH · HanEnergy Solutions (HES)" },
  location:{ ko: "베트남 호찌민 · 하노이 / 말레이시아", en: "Ho Chi Minh · Hanoi, Vietnam / Malaysia" },

  /* 3) 사진 — images 폴더의 파일을 같은 이름으로 바꾸면 그대로 적용됩니다 */
  heroImage: "images/hero.jpg",
  profileImage: "images/profile.jpg",

  /* 4) 소개 글 */
  tagline: {
    ko: "에너지와 사람을 잇는 일을 합니다.",
    en: "Connecting energy, partners and people."
  },

  /* 이름 위에 표시되는 문구 */
  quote: "If you want to go fast, go alone. If you want to go far, go together.",

  /* 하단 저작권 표기 시작 연도 */
  copyrightStart: 2025,
  intro: {
    ko: [
      "안녕하세요, 서준영입니다. 2008년 슈나이더 일렉트릭에서 시작해 17년 넘게 전기·전력 분야의 영업과 사업개발을 해왔습니다.",
      "한국에서는 OEM 영업팀장으로 BESS·로봇·DC 보호 등 신규 오퍼를 시장에 안착시켰고, 베트남에서는 약 100개 한국계 FDI 핵심 고객사의 사업개발을 맡았습니다.",
      "지금은 LS일렉트릭 공식 대리점 퓨넥스테크와 칠러·공조 솔루션 기업 한에너지솔루션(HES)의 법인장으로, 베트남과 말레이시아에서 수변전·배전 설비와 칠러·HVAC 프로젝트를 이끌고 있습니다.",
      "특히 데이터센터의 전력·공조 설비부터 DCIM, BMS까지 전력과 냉각, 운영 관리를 하나로 잇는 솔루션에 집중하고 있습니다."
    ],
    en: [
      "Hi, I'm Junyoung Seo. Since joining Schneider Electric in 2008, I have spent 17+ years in sales and business development across the electrical power industry.",
      "In Korea I led the OEM sales team and launched new offers such as BESS, robotics and DC protection; in Vietnam I developed around 100 Korean FDI key accounts.",
      "Today I serve as General Director of FUNEX TECH, an LS ELECTRIC authorized distributor, and HanEnergy Solutions (HES), a chiller and HVAC solutions company, leading power distribution and cooling projects in Vietnam and Malaysia.",
      "My focus is data center infrastructure: power and cooling systems, DCIM and BMS, connecting energy, cooling and operations into one solution."
    ]
  },

  /* 5) 한눈에 보는 숫자 */
  stats: [
    { value: "17+", ko: "년 업계 경력", en: "Years in industry" },
    { value: "3",   ko: "개국 근무 (KR·VN·MY)", en: "Countries (KR·VN·MY)" },
    { value: "100+",ko: "핵심 고객사 관리", en: "Key accounts managed" }
  ],

  /* 6) 경력 — 위에서부터 최신순 */
  career: [
    { period: "2025 – Present", org: "FUNEX TECH CO., LTD · HanEnergy Solutions (HES)",
      ko: "법인장 · LS일렉트릭 공식 대리점 (전력기기·수변전) / 칠러·공조(HVAC) 솔루션",
      en: "General Director · LS ELECTRIC Authorized Distributor (power distribution) / Chiller & HVAC solutions" },
    { period: "2022 – 2025", org: "Schneider Electric Korea",
      ko: "OEM 영업팀장 · Industry Automation & Power Product", en: "OEM Sales Team Leader · Industry Automation & Power Product" },
    { period: "2018 – 2022", org: "Schneider Electric Vietnam",
      ko: "End User Key Account 영업·사업개발 매니저 (베트남·캄보디아)", en: "Key Account Sales & Business Development Manager (Regional)" },
    { period: "2008 – 2018", org: "Schneider Electric Korea",
      ko: "OEM 영업 · 저압 제품 오퍼 매니저 · 채널 영업 · 필드서비스 영업", en: "OEM Sales · LV Offer Manager · Channel Sales · Field Service Sales" }
  ],

  education: [
    { ko: "연세대학교 MBA", en: "MBA, Yonsei University" },
    { ko: "홍익대학교 전기공학 학사", en: "B.E. Electrical Engineering, Hongik University" },
    { ko: "NUS Digital Marketing 과정 수료", en: "Digital Marketing, National University of Singapore" }
  ],

  /* 7) 링크 아이콘 — 필요 없는 줄은 지우세요 */
  links: {
    linkedin:  "https://www.linkedin.com/in/jun-young-seo-a734a062",
    instagram: "https://www.instagram.com/jun_young.seo",
    email:     "threehoops@gmail.com",
    website:   "https://funex-tech.com/"
  },

  /* 8) 사진 보호용 워터마크 문구 */
  watermark: "© Junyoung Seo",

  /* 9) 데모 모드에서 보여줄 샘플 앨범 (실제 운영 시에는 사용되지 않음) */
  demoPosts: [
    { title: "Lake Louise", caption: "빙하 호수의 색이 정말 비현실적이었던 날.", taken_on: "2025-06-20", image: "images/album/lake-louise.jpg" },
    { title: "Lake Minnewanka", caption: "", taken_on: "2025-06-19", image: "images/album/lake-minnewanka.jpg" },
    { title: "Lookout", caption: "로키 산맥 전망대에서.", taken_on: "2025-06-22", image: "images/album/lookout-2.jpg" },
    { title: "Summer break", caption: "", taken_on: "2025-06-23", image: "images/album/summer-break.jpg" },
    { title: "Banff · Cascade Gardens", caption: "흐린 날의 밴프도 좋았다.", taken_on: "2025-06-18", image: "images/album/banff-garden.jpg" },
    { title: "Golden, BC", caption: "", taken_on: "2025-06-22", image: "images/album/lookout-1.jpg" },
    { title: "Meeting", caption: "고객 미팅 중 한 컷.", taken_on: "2025-06-24", image: "images/profile.jpg" }
  ]
};
