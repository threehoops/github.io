-- =============================================================
--  Personal homepage — Supabase schema
--  Supabase 대시보드 > SQL Editor 에 전체를 붙여넣고 Run 하세요.
--  ※ 아래 owner 이메일을 config.js 의 ownerEmail 과 똑같이 맞추세요.
-- =============================================================

-- 관리자(사이트 주인) 판별 함수
create or replace function public.is_owner() returns boolean
language sql stable as $$
  select coalesce(lower(auth.jwt() ->> 'email') = lower('threehoops@gmail.com'), false);
$$;

-- ---------- 앨범 게시물 ----------
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  title       text check (char_length(title) <= 80),
  caption     text check (char_length(caption) <= 1000),
  taken_on    date not null,
  image_path  text not null,
  created_at  timestamptz not null default now()
);
create index if not exists posts_taken_on_idx on public.posts (taken_on desc);

-- ---------- 사진 댓글 (이름·이메일 필수) ----------
create table if not exists public.photo_comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts(id) on delete cascade,
  name        text not null check (char_length(btrim(name)) between 1 and 40),
  email       text not null check (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' and char_length(email) <= 120),
  body        text not null check (char_length(btrim(body)) between 1 and 1000),
  created_at  timestamptz not null default now()
);
create index if not exists photo_comments_post_idx on public.photo_comments (post_id, created_at);

-- ---------- 좋아요 (방문자 1인 1회) ----------
create table if not exists public.photo_likes (
  post_id     uuid not null references public.posts(id) on delete cascade,
  visitor_id  uuid not null,
  created_at  timestamptz not null default now(),
  primary key (post_id, visitor_id)
);

-- ---------- 방명록 (이름·이메일 필수) ----------
create table if not exists public.guestbook (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(btrim(name)) between 1 and 40),
  email       text not null check (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' and char_length(email) <= 120),
  message     text not null check (char_length(btrim(message)) between 1 and 1000),
  created_at  timestamptz not null default now()
);

-- =============================================================
--  Row Level Security
-- =============================================================
alter table public.posts          enable row level security;
alter table public.photo_comments enable row level security;
alter table public.photo_likes    enable row level security;
alter table public.guestbook      enable row level security;

-- posts: 누구나 보기, 주인만 쓰기/수정/삭제
drop policy if exists posts_read  on public.posts;
drop policy if exists posts_write on public.posts;
create policy posts_read  on public.posts for select using (true);
create policy posts_write on public.posts for all using (public.is_owner()) with check (public.is_owner());

-- comments: 누구나 보기/작성, 주인만 삭제
drop policy if exists comments_read   on public.photo_comments;
drop policy if exists comments_insert on public.photo_comments;
drop policy if exists comments_delete on public.photo_comments;
create policy comments_read   on public.photo_comments for select using (true);
create policy comments_insert on public.photo_comments for insert with check (true);
create policy comments_delete on public.photo_comments for delete using (public.is_owner());

-- likes: 누구나 개수 보기 (추가/취소는 toggle_like 함수로만)
drop policy if exists likes_read on public.photo_likes;
create policy likes_read on public.photo_likes for select using (true);

-- guestbook: 누구나 보기/작성, 주인만 삭제
drop policy if exists gb_read   on public.guestbook;
drop policy if exists gb_insert on public.guestbook;
drop policy if exists gb_delete on public.guestbook;
create policy gb_read   on public.guestbook for select using (true);
create policy gb_insert on public.guestbook for insert with check (true);
create policy gb_delete on public.guestbook for delete using (public.is_owner());

-- =============================================================
--  이메일 비공개: email 컬럼은 방문자가 읽을 수 없게 컬럼 권한 제한
-- =============================================================
revoke all on public.guestbook      from anon, authenticated;
revoke all on public.photo_comments from anon, authenticated;
revoke all on public.photo_likes    from anon, authenticated;

grant select (id, name, message, created_at)          on public.guestbook to anon, authenticated;
grant insert (name, email, message)                   on public.guestbook to anon, authenticated;
grant delete                                          on public.guestbook to authenticated;

grant select (id, post_id, name, body, created_at)    on public.photo_comments to anon, authenticated;
grant insert (post_id, name, email, body)             on public.photo_comments to anon, authenticated;
grant delete                                          on public.photo_comments to authenticated;

grant select (post_id, visitor_id)                    on public.photo_likes to anon, authenticated;

-- 좋아요 토글 (방문자 브라우저 ID 기준)
create or replace function public.toggle_like(p_post uuid, p_visitor uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_liked boolean;
begin
  if exists (select 1 from photo_likes where post_id = p_post and visitor_id = p_visitor) then
    delete from photo_likes where post_id = p_post and visitor_id = p_visitor;
    v_liked := false;
  else
    insert into photo_likes (post_id, visitor_id) values (p_post, p_visitor);
    v_liked := true;
  end if;
  return json_build_object('liked', v_liked, 'count', (select count(*) from photo_likes where post_id = p_post));
end $$;
grant execute on function public.toggle_like(uuid, uuid) to anon, authenticated;

-- 주인 전용: 이메일 포함 조회
create or replace function public.admin_guestbook()
returns setof public.guestbook language sql security definer set search_path = public as $$
  select * from guestbook where public.is_owner() order by created_at desc limit 500;
$$;
create or replace function public.admin_comments(p_post uuid)
returns setof public.photo_comments language sql security definer set search_path = public as $$
  select * from photo_comments where public.is_owner() and post_id = p_post order by created_at;
$$;
revoke execute on function public.admin_guestbook()     from anon;
revoke execute on function public.admin_comments(uuid)  from anon;
grant  execute on function public.admin_guestbook()     to authenticated;
grant  execute on function public.admin_comments(uuid)  to authenticated;

-- =============================================================
--  사진 저장소 (Storage bucket: album)
-- =============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('album', 'album', true, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists album_owner_insert on storage.objects;
drop policy if exists album_owner_update on storage.objects;
drop policy if exists album_owner_delete on storage.objects;
create policy album_owner_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'album' and public.is_owner());
create policy album_owner_update on storage.objects for update to authenticated
  using (bucket_id = 'album' and public.is_owner());
create policy album_owner_delete on storage.objects for delete to authenticated
  using (bucket_id = 'album' and public.is_owner());
