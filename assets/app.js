/* Personal homepage — album, likes, comments, guestbook.
   Backend: Supabase (when configured) or a local demo store. */
(function () {
  "use strict";
  const C = window.SITE_CONFIG || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------------- i18n ---------------- */
  const T = {
    ko: {
      nav_about: "소개", nav_career: "경력", nav_album: "앨범", nav_guestbook: "방명록",
      cta_album: "앨범 보기", cta_guestbook: "방명록 남기기",
      about_title: "About", career_title: "Career", edu_title: "Education",
      album_title: "Album", album_desc: "연도별로 정리한 순간들. 사진에 좋아요와 댓글을 남겨주세요.",
      album_new: "새 사진 올리기", album_edit: "사진 정보 수정", album_empty: "아직 올라온 사진이 없습니다.",
      sort_new: "최신순", sort_old: "오래된순", all: "전체", photos: "장",
      gb_title: "Guestbook", gb_desc: "반가운 인사나 안부를 남겨주세요. 이름과 이메일은 꼭 입력해야 합니다.",
      f_name: "이름", f_email: "이메일", f_message: "메시지", f_comment: "댓글을 남겨주세요",
      f_email_note: "이메일은 공개되지 않습니다.", f_submit: "남기기", f_post: "등록",
      f_pick: "클릭해서 사진을 선택하세요", f_title: "제목", f_date: "촬영일", f_caption: "설명", f_save: "저장",
      f_password: "비밀번호", login: "로그인", admin: "관리자", admin_login: "관리자 로그인", logout: "로그아웃",
      demo_pw: "미리보기 모드 비밀번호: demo", comments: "댓글", no_comments: "첫 댓글을 남겨보세요.",
      edit: "수정", delete: "삭제", confirm_delete: "정말 삭제할까요?",
      err_name: "이름을 입력해주세요.", err_email: "올바른 이메일을 입력해주세요.", err_msg: "내용을 입력해주세요.",
      err_file: "사진을 선택해주세요.", err_date: "촬영일을 입력해주세요.", err_generic: "문제가 생겼어요. 잠시 후 다시 시도해주세요.",
      err_login: "로그인 정보가 올바르지 않습니다.", ok_gb: "방명록이 등록되었습니다. 감사합니다!", ok_saved: "저장되었습니다.",
      logged_in: "관리자로 로그인했습니다.", logged_out: "로그아웃했습니다.", protected: "사진은 저장하거나 복사할 수 없습니다.",
      uploading: "업로드 중…", rights: "All rights reserved.",
      demo_banner: "미리보기 모드 — Supabase를 연결하면 실제 저장됩니다. (README 참고)"
    },
    en: {
      nav_about: "About", nav_career: "Career", nav_album: "Album", nav_guestbook: "Guestbook",
      cta_album: "View album", cta_guestbook: "Sign guestbook",
      about_title: "About", career_title: "Career", edu_title: "Education",
      album_title: "Album", album_desc: "Moments, grouped by year. Feel free to like and comment.",
      album_new: "Upload photo", album_edit: "Edit photo", album_empty: "No photos yet.",
      sort_new: "Newest", sort_old: "Oldest", all: "All", photos: "photos",
      gb_title: "Guestbook", gb_desc: "Leave a note or say hello. Name and email are required.",
      f_name: "Name", f_email: "Email", f_message: "Message", f_comment: "Write a comment",
      f_email_note: "Your email is never shown publicly.", f_submit: "Submit", f_post: "Post",
      f_pick: "Click to choose a photo", f_title: "Title", f_date: "Date taken", f_caption: "Caption", f_save: "Save",
      f_password: "Password", login: "Sign in", admin: "Admin", admin_login: "Admin sign-in", logout: "Sign out",
      demo_pw: "Preview mode password: demo", comments: "Comments", no_comments: "Be the first to comment.",
      edit: "Edit", delete: "Delete", confirm_delete: "Delete this?",
      err_name: "Please enter your name.", err_email: "Please enter a valid email.", err_msg: "Please write something.",
      err_file: "Please choose a photo.", err_date: "Please enter the date.", err_generic: "Something went wrong. Please try again.",
      err_login: "Invalid sign-in details.", ok_gb: "Thanks for your note!", ok_saved: "Saved.",
      logged_in: "Signed in as owner.", logged_out: "Signed out.", protected: "Photos can't be saved or copied.",
      uploading: "Uploading…", rights: "All rights reserved.",
      demo_banner: "Preview mode — connect Supabase to save for real (see README)."
    }
  };
  let lang = store.get("lang", (navigator.language || "ko").startsWith("ko") ? "ko" : "en");
  const t = (k) => (T[lang] && T[lang][k]) || T.ko[k] || k;
  const L = (o) => (o && typeof o === "object" ? o[lang] ?? o.ko : o);
  const fmtDate = (d) => {
    if (!d) return "";
    const dt = new Date(String(d).length <= 10 ? d + "T00:00:00" : d);
    return dt.toLocaleDateString(lang === "ko" ? "ko-KR" : "en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  /* ---------------- Icons ---------------- */
  const ICON = {
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v11H3v-11zm6.5 0h3.8v1.6h.06c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.77 2.5 4.77 5.75v5.6h-4v-4.96c0-1.18-.02-2.7-1.7-2.7-1.7 0-1.96 1.28-1.96 2.6v5.06h-4v-11z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none"/></svg>',
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/></svg>',
    website: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg>'
  };
  const LABEL = { linkedin: "LinkedIn", instagram: "Instagram", email: "Email", website: "Company website" };

  /* ---------------- Backends ---------------- */
  function uuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => { const r = (Math.random() * 16) | 0; return (c === "x" ? r : (r & 3) | 8).toString(16); });
  }
  const visitorId = (() => { let v = store.get("visitor_id"); if (!v) { v = uuid(); store.set("visitor_id", v); } return v; })();

  async function resizeImage(file, max = 1600, q = 0.85) {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
      const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const cv = document.createElement("canvas");
      cv.width = Math.round(img.naturalWidth * s); cv.height = Math.round(img.naturalHeight * s);
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      return await new Promise((res) => cv.toBlob(res, "image/jpeg", q));
    } finally { URL.revokeObjectURL(url); }
  }

  /* Demo backend — stores in this browser only */
  function DemoAPI() {
    const K = "demo_db_v1";
    let db = store.get(K, null);
    if (!db) {
      db = { posts: (C.demoPosts || []).map((p, i) => ({ id: "demo-" + i, created_at: new Date().toISOString(), ...p })), comments: [], likes: [], guestbook: [
        { id: uuid(), name: "Minh", email: "minh@example.com", message: "Great to see your new homepage! See you in Hanoi.", created_at: new Date(Date.now() - 864e5 * 3).toISOString() }
      ] };
      store.set(K, db);
    }
    const save = () => store.set(K, db);
    let owner = store.get("demo_owner", false);
    return {
      demo: true,
      async init() {},
      isOwner: () => owner,
      async signIn(email, pw) { if (pw !== "demo") throw new Error("login"); owner = true; store.set("demo_owner", true); },
      async signOut() { owner = false; store.set("demo_owner", false); },
      async listPosts() {
        return db.posts.map((p) => ({ ...p, url: p.image, like_count: db.likes.filter((l) => l.post_id === p.id).length, comment_count: db.comments.filter((c) => c.post_id === p.id).length }));
      },
      async likedSet() { return new Set(db.likes.filter((l) => l.visitor_id === visitorId).map((l) => l.post_id)); },
      async toggleLike(id) {
        const i = db.likes.findIndex((l) => l.post_id === id && l.visitor_id === visitorId);
        if (i >= 0) db.likes.splice(i, 1); else db.likes.push({ post_id: id, visitor_id: visitorId });
        save();
        return { liked: i < 0, count: db.likes.filter((l) => l.post_id === id).length };
      },
      async savePost(data, file) {
        if (data.id) { Object.assign(db.posts.find((p) => p.id === data.id), data); }
        else {
          const blob = await resizeImage(file, 1200, 0.8);
          const image = await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
          db.posts.push({ id: uuid(), created_at: new Date().toISOString(), image, ...data });
        }
        try { save(); } catch (e) {}
      },
      async deletePost(id) { db.posts = db.posts.filter((p) => p.id !== id); db.comments = db.comments.filter((c) => c.post_id !== id); save(); },
      async listComments(id) { return db.comments.filter((c) => c.post_id === id).sort((a, b) => a.created_at.localeCompare(b.created_at)); },
      async addComment(c) { db.comments.push({ id: uuid(), created_at: new Date().toISOString(), ...c }); save(); },
      async deleteComment(id) { db.comments = db.comments.filter((c) => c.id !== id); save(); },
      async listGuestbook() { return [...db.guestbook].sort((a, b) => b.created_at.localeCompare(a.created_at)); },
      async addGuestbook(g) { db.guestbook.push({ id: uuid(), created_at: new Date().toISOString(), ...g }); save(); },
      async deleteGuestbook(id) { db.guestbook = db.guestbook.filter((g) => g.id !== id); save(); }
    };
  }

  /* Supabase backend */
  function SupaAPI() {
    let sb, session = null;
    const bucket = C.storageBucket || "album";
    const isOwner = () => !!(session && session.user && session.user.email && session.user.email.toLowerCase() === String(C.ownerEmail).toLowerCase());
    const chk = ({ data, error }) => { if (error) throw error; return data; };
    return {
      demo: false,
      async init() {
        await new Promise((res, rej) => {
          const s = document.createElement("script");
          s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js";
          s.onload = res; s.onerror = rej; document.head.appendChild(s);
        });
        sb = window.supabase.createClient(C.supabaseUrl, C.supabaseAnonKey);
        session = (await sb.auth.getSession()).data.session;
        sb.auth.onAuthStateChange((_e, s) => { session = s; });
      },
      isOwner,
      async signIn(email, password) { const r = await sb.auth.signInWithPassword({ email, password }); if (r.error) throw r.error; session = r.data.session; if (!isOwner()) { await sb.auth.signOut(); session = null; throw new Error("not owner"); } },
      async signOut() { await sb.auth.signOut(); session = null; },
      async listPosts() {
        const rows = chk(await sb.from("posts").select("id,title,caption,taken_on,image_path,created_at"));
        const count = async (table) => {
          try { const r = chk(await sb.from(table).select("post_id")); const m = {}; r.forEach((x) => (m[x.post_id] = (m[x.post_id] || 0) + 1)); return m; }
          catch (e) { console.warn(table, e); return {}; }
        };
        const [likes, comments] = await Promise.all([count("photo_likes"), count("photo_comments")]);
        return rows.map((p) => ({ ...p, url: sb.storage.from(bucket).getPublicUrl(p.image_path).data.publicUrl,
          like_count: likes[p.id] || 0, comment_count: comments[p.id] || 0 }));
      },
      async likedSet() { const rows = chk(await sb.from("photo_likes").select("post_id").eq("visitor_id", visitorId)); return new Set(rows.map((r) => r.post_id)); },
      async toggleLike(id) { return chk(await sb.rpc("toggle_like", { p_post: id, p_visitor: visitorId })); },
      async savePost(data, file) {
        const fields = { title: data.title || null, caption: data.caption || null, taken_on: data.taken_on };
        if (data.id) { chk(await sb.from("posts").update(fields).eq("id", data.id)); return; }
        const blob = await resizeImage(file);
        const path = `${data.taken_on.slice(0, 4)}/${uuid()}.jpg`;
        chk(await sb.storage.from(bucket).upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" }));
        try { chk(await sb.from("posts").insert({ ...fields, image_path: path })); }
        catch (e) { await sb.storage.from(bucket).remove([path]); throw e; }
      },
      async deletePost(id) {
        const row = chk(await sb.from("posts").select("image_path").eq("id", id).single());
        chk(await sb.from("posts").delete().eq("id", id));
        await sb.storage.from(bucket).remove([row.image_path]);
      },
      async listComments(id) {
        if (isOwner()) return chk(await sb.rpc("admin_comments", { p_post: id }));
        return chk(await sb.from("photo_comments").select("id,name,body,created_at").eq("post_id", id).order("created_at"));
      },
      async addComment(c) { chk(await sb.from("photo_comments").insert(c)); },
      async deleteComment(id) { chk(await sb.from("photo_comments").delete().eq("id", id)); },
      async listGuestbook() {
        if (isOwner()) return chk(await sb.rpc("admin_guestbook"));
        return chk(await sb.from("guestbook").select("id,name,message,created_at").order("created_at", { ascending: false }).limit(200));
      },
      async addGuestbook(g) { chk(await sb.from("guestbook").insert(g)); },
      async deleteGuestbook(id) { chk(await sb.from("guestbook").delete().eq("id", id)); }
    };
  }

  const api = C.supabaseUrl && C.supabaseAnonKey ? SupaAPI() : DemoAPI();

  /* ---------------- UI helpers ---------------- */
  let toastTimer;
  function toast(msg) { const el = $("#toast"); el.textContent = msg; el.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => (el.hidden = true), 2400); }
  function openModal(id) { $(id).hidden = false; document.body.style.overflow = "hidden"; }
  function closeModal(el) { el.hidden = true; if (!$$(".modal").some((m) => !m.hidden)) document.body.style.overflow = ""; }
  $$(".modal").forEach((m) => m.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeModal(m); }));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") $$(".modal").forEach((m) => !m.hidden && closeModal(m)); });
  const msg = (form, text, ok) => { const p = $(".form-msg", form); p.textContent = text || ""; p.className = "form-msg " + (ok ? "ok" : "err"); };
  const setBg = (el, url) => { el.style.backgroundImage = url ? `url("${String(url).replace(/"/g, "%22")}")` : ""; };

  function validatePerson(form, fields) {
    $$(".invalid", form).forEach((e) => e.classList.remove("invalid"));
    const v = Object.fromEntries(new FormData(form));
    if (v.website) return { spam: true };
    for (const [name, key] of fields) {
      const val = (v[name] || "").trim();
      const bad = name === "email" ? !EMAIL_RE.test(val) : !val;
      if (bad) { form.elements[name].classList.add("invalid"); form.elements[name].focus(); msg(form, t(key)); return null; }
      v[name] = val;
    }
    return v;
  }
  // remember name/email for convenience
  function rememberPerson(v) { store.set("person", { name: v.name, email: v.email }); fillPerson(); }
  function fillPerson() { const p = store.get("person", null); if (!p) return; ["#gbForm", "#cForm"].forEach((s) => { const f = $(s); if (!f.elements.name.value) f.elements.name.value = p.name; if (!f.elements.email.value) f.elements.email.value = p.email; }); }

  /* ---------------- Static content ---------------- */
  function renderStatic() {
    document.documentElement.lang = lang;
    $("#langBtn").textContent = lang === "ko" ? "EN" : "KO";
    $$("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
    $$("[data-ph]").forEach((el) => (el.placeholder = t(el.dataset.ph)));
    $$("[data-c]").forEach((el) => { const v = L(C[el.dataset.c]); if (v) el.textContent = v; });
    $(".name-ko").textContent = C.name?.ko || ""; $(".name-en").textContent = C.name?.en || "";
    setBg($("#heroPhoto"), C.heroImage); setBg($("#avatar"), C.profileImage);
    $("#introText").innerHTML = (L(C.intro) || []).map((p) => `<p>${esc(p)}</p>`).join("");
    $("#stats").innerHTML = (C.stats || []).map((s) => `<div class="stat"><b>${esc(s.value)}</b><span>${esc(L(s))}</span></div>`).join("");
    $("#timeline").innerHTML = (C.career || []).map((c) => `<li><div class="t-period">${esc(lang === "ko" ? c.period.replace("Present", "현재") : c.period)}</div><div class="t-org">${esc(c.org)}</div><div class="t-role">${esc(L(c))}</div></li>`).join("");
    $("#edu").innerHTML = (C.education || []).map((e) => `<li>${esc(L(e))}</li>`).join("");
    const links = Object.entries(C.links || {}).filter(([k, v]) => v && ICON[k]).map(([k, v]) => {
      const href = k === "email" ? "mailto:" + v : v;
      return `<a href="${esc(href)}" ${k === "email" ? "" : 'target="_blank" rel="noopener"'} aria-label="${LABEL[k]}" title="${LABEL[k]}">${ICON[k]}</a>`;
    }).join("");
    $("#heroSocials").innerHTML = links; $("#footSocials").innerHTML = links;
    const y0 = Number(C.copyrightStart) || new Date().getFullYear(), y1 = new Date().getFullYear();
    $("#year").textContent = y0 < y1 ? `${y0}–${y1}` : String(y1);
    $("#adminBtn").textContent = api.isOwner() ? t("logout") : t("admin");
    $("#vWm").textContent = C.watermark || "";
    document.body.classList.toggle("is-owner", api.isOwner());
    document.body.classList.toggle("demo", !!api.demo);
    $("#demoBanner").hidden = !api.demo || demoBannerClosed;
  }

  let demoBannerClosed = false;
  $("#demoBanner").addEventListener("click", (e) => { demoBannerClosed = true; e.currentTarget.hidden = true; });

  /* ---------------- Album ---------------- */
  let loadError = "", posts = [], liked = new Set(), yearFilter = "all", sortDir = "desc", current = null;
  async function loadAlbum() {
    loadError = "";
    try { posts = await api.listPosts(); } catch (e) { console.error(e); posts = []; loadError = e?.message || String(e); }
    try { liked = await api.likedSet(); } catch (e) { console.warn(e); liked = new Set(); }
    renderAlbum();
  }
  function renderAlbum() {
    const years = [...new Set(posts.map((p) => p.taken_on.slice(0, 4)))].sort((a, b) => b - a);
    if (yearFilter !== "all" && !years.includes(yearFilter)) yearFilter = "all";
    $("#yearChips").innerHTML = ["all", ...years].map((y) => `<button type="button" class="chip${y === yearFilter ? " on" : ""}" data-year="${y}">${y === "all" ? t("all") : y}</button>`).join("");
    const dir = sortDir === "desc" ? -1 : 1;
    const cmp = (a, b) => (a.taken_on === b.taken_on ? a.created_at.localeCompare(b.created_at) : a.taken_on.localeCompare(b.taken_on)) * dir;
    const shownYears = (yearFilter === "all" ? years : [yearFilter]).sort((a, b) => (a - b) * dir);
    $("#albumGroups").innerHTML = shownYears.map((y) => {
      const list = posts.filter((p) => p.taken_on.startsWith(y)).sort(cmp);
      return `<div class="year-group"><div class="year-head"><h3>${y}</h3><span class="muted small">${list.length} ${t("photos")}</span></div>
        <div class="grid">${list.map((p) => `<button type="button" class="post" data-id="${esc(p.id)}">
          <div class="post-img protected" style="background-image:url('${esc(p.url)}')"></div>
          <div class="post-meta"><div class="post-title">${esc(p.title || fmtDate(p.taken_on))}</div>
          <div class="post-sub"><span>${esc(fmtDate(p.taken_on))}</span><span><span>${liked.has(p.id) ? "♥" : "♡"} ${p.like_count}</span><span>💬 ${p.comment_count}</span></span></div></div>
        </button>`).join("")}</div></div>`;
    }).join("");
    $("#albumEmpty").hidden = posts.length > 0;
    $("#albumEmpty").textContent = loadError && api.isOwner() ? `${t("err_generic")} (${loadError})` : t("album_empty");
  }
  $("#yearChips").addEventListener("click", (e) => { const b = e.target.closest("[data-year]"); if (!b) return; yearFilter = b.dataset.year; renderAlbum(); });
  $$(".seg button").forEach((b) => b.addEventListener("click", () => { sortDir = b.dataset.sort; $$(".seg button").forEach((x) => x.classList.toggle("on", x === b)); renderAlbum(); }));
  $("#albumGroups").addEventListener("click", (e) => { const b = e.target.closest(".post"); if (b) openViewer(b.dataset.id); });

  async function openViewer(id) {
    current = posts.find((p) => p.id === id); if (!current) return;
    setBg($("#vPhoto"), current.url);
    $("#vDate").textContent = fmtDate(current.taken_on);
    $("#vTitle").textContent = current.title || "";
    $("#vCaption").textContent = current.caption || "";
    updateLikeBtn();
    $("#vComments").innerHTML = ""; $("#vCommentCount").textContent = "";
    msg($("#cForm"), "");
    openModal("#viewer");
    loadComments();
  }
  function updateLikeBtn() {
    const on = liked.has(current.id);
    $("#vLike").classList.toggle("on", on);
    $(".heart", $("#vLike")).textContent = on ? "♥" : "♡";
    $("#vLikeCount").textContent = current.like_count;
  }
  async function loadComments() {
    const id = current.id;
    let list = [];
    try { list = await api.listComments(id); } catch (e) { console.error(e); }
    if (!current || current.id !== id) return;
    current.comment_count = list.length;
    $("#vCommentCount").textContent = list.length || "";
    $("#vComments").innerHTML = list.length ? list.map((c) => `<li><div><span class="c-name">${esc(c.name)}</span><span class="c-date">${esc(fmtDate(c.created_at))}</span>
      ${api.isOwner() ? `${c.email ? ` <span class="owner-email">${esc(c.email)}</span>` : ""} <button class="link-btn danger small" data-del-c="${esc(c.id)}">${t("delete")}</button>` : ""}</div>
      <div class="c-body">${esc(c.body)}</div></li>`).join("") : `<li class="muted">${t("no_comments")}</li>`;
    renderAlbum();
  }
  $("#vComments").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-del-c]"); if (!b || !confirm(t("confirm_delete"))) return;
    try { await api.deleteComment(b.dataset.delC); loadComments(); } catch (err) { toast(t("err_generic")); }
  });
  $("#vLike").addEventListener("click", async () => {
    const btn = $("#vLike"); btn.disabled = true;
    try { const r = await api.toggleLike(current.id); r.liked ? liked.add(current.id) : liked.delete(current.id); current.like_count = r.count; updateLikeBtn(); renderAlbum(); }
    catch (e) { console.error(e); toast(t("err_generic")); }
    btn.disabled = false;
  });
  $("#cForm").addEventListener("submit", async (e) => {
    e.preventDefault(); const f = e.currentTarget;
    const v = validatePerson(f, [["name", "err_name"], ["email", "err_email"], ["body", "err_msg"]]); if (!v || v.spam) return;
    const btn = $("button[type=submit]", f); btn.disabled = true;
    try { await api.addComment({ post_id: current.id, name: v.name, email: v.email, body: v.body }); rememberPerson(v); f.elements.body.value = ""; msg(f, ""); await loadComments(); }
    catch (err) { console.error(err); msg(f, t("err_generic")); }
    btn.disabled = false;
  });

  /* Owner: upload / edit / delete */
  let editing = null, pickedFile = null;
  function openEditor(post) {
    editing = post || null; pickedFile = null;
    const f = $("#postForm"); f.reset(); msg(f, "");
    $("#editorTitle").textContent = t(post ? "album_edit" : "album_new");
    $("#dropZone").hidden = !!post;
    $("#preview").hidden = true; $("#dropText").hidden = false;
    f.elements.title.value = post?.title || "";
    f.elements.caption.value = post?.caption || "";
    f.elements.taken_on.value = post?.taken_on || new Date().toISOString().slice(0, 10);
    openModal("#editor");
  }
  $("#newPostBtn").addEventListener("click", () => openEditor());
  $("#vEdit").addEventListener("click", () => { closeModal($("#viewer")); openEditor(current); });
  $("#vDelete").addEventListener("click", async () => {
    if (!confirm(t("confirm_delete"))) return;
    try { await api.deletePost(current.id); closeModal($("#viewer")); toast(t("ok_saved")); loadAlbum(); } catch (e) { console.error(e); toast(t("err_generic")); }
  });
  $("#postForm").elements.file.addEventListener("change", (e) => {
    pickedFile = e.target.files[0] || null; if (!pickedFile) return;
    const img = $("#preview"); img.src = URL.createObjectURL(pickedFile); img.hidden = false; $("#dropText").hidden = true;
  });
  $("#postForm").addEventListener("submit", async (e) => {
    e.preventDefault(); const f = e.currentTarget;
    if (!editing && !pickedFile) return msg(f, t("err_file"));
    const taken_on = f.elements.taken_on.value; if (!taken_on) return msg(f, t("err_date"));
    const btn = $("button[type=submit]", f); btn.disabled = true; msg(f, t("uploading"), true);
    try {
      await api.savePost({ id: editing?.id, title: f.elements.title.value.trim(), caption: f.elements.caption.value.trim(), taken_on }, pickedFile);
      closeModal($("#editor")); toast(t("ok_saved")); yearFilter = "all"; await loadAlbum();
    } catch (err) { console.error(err); msg(f, t("err_generic") + (err?.message ? ` (${err.message})` : "")); }
    btn.disabled = false;
  });

  /* ---------------- Guestbook ---------------- */
  async function loadGuestbook() {
    let list = [];
    try { list = await api.listGuestbook(); } catch (e) { console.error(e); }
    $("#gbList").innerHTML = list.map((g) => `<li class="gb-item"><div class="gb-top"><span class="gb-name">${esc(g.name)}</span>
      <span class="muted small">${esc(fmtDate(g.created_at))}${api.isOwner() ? ` · <button class="link-btn danger small" data-del-g="${esc(g.id)}">${t("delete")}</button>` : ""}</span></div>
      ${api.isOwner() && g.email ? `<div class="owner-email">${esc(g.email)}</div>` : ""}
      <p class="gb-msg">${esc(g.message)}</p></li>`).join("");
  }
  $("#gbList").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-del-g]"); if (!b || !confirm(t("confirm_delete"))) return;
    try { await api.deleteGuestbook(b.dataset.delG); loadGuestbook(); } catch (err) { toast(t("err_generic")); }
  });
  $("#gbForm").addEventListener("submit", async (e) => {
    e.preventDefault(); const f = e.currentTarget;
    const v = validatePerson(f, [["name", "err_name"], ["email", "err_email"], ["message", "err_msg"]]); if (!v || v.spam) return;
    const btn = $("button[type=submit]", f); btn.disabled = true;
    try { await api.addGuestbook({ name: v.name, email: v.email, message: v.message }); rememberPerson(v); f.elements.message.value = ""; msg(f, t("ok_gb"), true); loadGuestbook(); }
    catch (err) { console.error(err); msg(f, t("err_generic")); }
    btn.disabled = false;
  });

  /* ---------------- Admin ---------------- */
  $("#adminBtn").addEventListener("click", async () => {
    if (api.isOwner()) { await api.signOut(); toast(t("logged_out")); refreshAll(); return; }
    const f = $("#loginForm"); f.reset(); msg(f, ""); f.elements.email.value = C.ownerEmail || ""; openModal("#login"); f.elements.password.focus();
  });
  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault(); const f = e.currentTarget;
    try { await api.signIn(f.elements.email.value.trim(), f.elements.password.value); closeModal($("#login")); toast(t("logged_in")); refreshAll(); }
    catch (err) { console.error(err); msg(f, t("err_login") + (err && err.message ? " (" + err.message + ")" : "")); }
  });

  /* ---------------- Photo protection (deterrence) ---------------- */
  const inProtected = (el) => el && el.closest && el.closest(".protected, .post, .viewer-box, .hero-photo");
  document.addEventListener("contextmenu", (e) => { if (inProtected(e.target)) { e.preventDefault(); toast(t("protected")); } });
  document.addEventListener("dragstart", (e) => { if (inProtected(e.target)) e.preventDefault(); });
  document.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase(); const typing = /input|textarea/i.test(e.target.tagName);
    if ((e.ctrlKey || e.metaKey) && (k === "s" || k === "p" || (k === "c" && !typing && !$("#viewer").hidden))) { e.preventDefault(); toast(t("protected")); }
  });

  /* ---------------- Boot ---------------- */
  $("#langBtn").addEventListener("click", () => { lang = lang === "ko" ? "en" : "ko"; store.set("lang", lang); refreshAll(); });
  function refreshAll() { renderStatic(); loadAlbum(); loadGuestbook(); }
  (async function boot() {
    renderStatic(); fillPerson();
    try { await api.init(); } catch (e) { console.error("Supabase load failed", e); }
    refreshAll();
  })();
})();
