-- ACE database setup. Run this whole file once in the Supabase SQL Editor.

-- profiles: one row per account, created automatically when someone signs up
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text,
  verification_details text,
  bio text,
  portfolio_links text,
  phone text,
  status text not null default 'pending',
  is_admin boolean not null default false,
  created_at timestamptz default now()
);
alter table profiles enable row level security;

create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into profiles (id, email, full_name, role, verification_details)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'verification_details'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- helper functions the security rules use
create function is_approved()
returns boolean
language sql
security definer set search_path = public
as $$
  select exists (select 1 from profiles where id = auth.uid() and status = 'approved');
$$;

create function has_role(allowed text[])
returns boolean
language sql
security definer set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and status = 'approved' and role = any(allowed)
  );
$$;

create function is_admin()
returns boolean
language sql
security definer set search_path = public
as $$
  select exists (select 1 from profiles where id = auth.uid() and is_admin = true);
$$;

-- profile rules: users read their own, approved members read approved profiles, admins read all
create policy "Users can read own profile"
on profiles for select to authenticated
using (auth.uid() = id);

create policy "Approved members can read approved profiles"
on profiles for select to authenticated
using (status = 'approved' and is_approved());

create policy "Admins read all profiles"
on profiles for select to authenticated
using (is_admin());

-- users can only edit these columns on their own row, never status or is_admin
revoke update on profiles from authenticated;
grant update (full_name, role, bio, portfolio_links, phone) on profiles to authenticated;

create policy "Users can edit own profile"
on profiles for update to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- content: films and music videos shown on Discovery
create table content (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null check (type in ('film', 'music_video')),
  description text,
  year int,
  genre text,
  cast_crew text,
  status text not null default 'pending',
  submitted_by uuid references profiles(id),
  created_at timestamptz default now()
);
alter table content enable row level security;

create policy "Anyone can read approved content"
on content for select to anon, authenticated
using (status = 'approved');

create policy "Members submit content"
on content for insert to authenticated
with check (submitted_by = auth.uid() and status = 'pending' and is_approved());

create policy "Members read own submissions"
on content for select to authenticated
using (submitted_by = auth.uid());

create policy "Admins read all content"
on content for select to authenticated
using (is_admin());

-- contact form messages (saved in the database in this version)
create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  from_id uuid not null references profiles(id),
  to_id uuid not null references profiles(id),
  message text not null,
  created_at timestamptz default now()
);
alter table contact_messages enable row level security;

create policy "Approved members can send messages"
on contact_messages for insert to authenticated
with check (from_id = auth.uid() and is_approved());

create policy "Users can read their own messages"
on contact_messages for select to authenticated
using (from_id = auth.uid() or to_id = auth.uid());

-- casting calls and applications
create table casting_calls (
  id uuid primary key default gen_random_uuid(),
  posted_by uuid not null references profiles(id),
  project_name text not null,
  roles_available text not null,
  requirements text,
  how_to_apply text,
  status text not null default 'pending',
  created_at timestamptz default now()
);
alter table casting_calls enable row level security;

create policy "Members read approved calls"
on casting_calls for select to authenticated
using (status = 'approved' and is_approved());

create policy "Posters read own calls"
on casting_calls for select to authenticated
using (posted_by = auth.uid());

create policy "Filmmakers post calls"
on casting_calls for insert to authenticated
with check (posted_by = auth.uid() and has_role(array['Filmmaker', 'Director', 'Producer']));

create policy "Admins read all calls"
on casting_calls for select to authenticated
using (is_admin());

create policy "Admins update calls"
on casting_calls for update to authenticated
using (is_admin()) with check (is_admin());

create table casting_applications (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references casting_calls(id) on delete cascade,
  applicant_id uuid not null references profiles(id),
  note text,
  created_at timestamptz default now(),
  unique (call_id, applicant_id)
);
alter table casting_applications enable row level security;

create policy "Actors apply to calls"
on casting_applications for insert to authenticated
with check (applicant_id = auth.uid() and has_role(array['Actor']));

create policy "Applicants read own applications"
on casting_applications for select to authenticated
using (applicant_id = auth.uid());

create policy "Posters read applications to their calls"
on casting_applications for select to authenticated
using (exists (select 1 from casting_calls c where c.id = call_id and c.posted_by = auth.uid()));

-- admin audit log and the one function admins use to approve, reject, suspend or remove
create table admin_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references profiles(id),
  admin_name text,
  action text not null,
  target_type text not null,
  target_id uuid not null,
  created_at timestamptz default now()
);
alter table admin_log enable row level security;

create policy "Admins read log"
on admin_log for select to authenticated
using (is_admin());

create function admin_review(p_type text, p_id uuid, p_status text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_admin_name text;
begin
  if not is_admin() then
    raise exception 'Not allowed';
  end if;
  if p_status not in ('approved', 'rejected', 'suspended', 'removed') then
    raise exception 'Unknown status';
  end if;

  if p_type = 'profile' then
    update profiles set status = p_status where id = p_id;
    -- approving an account also confirms its email so the user can log in
    if p_status = 'approved' then
      update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now()) where id = p_id;
    end if;
  elsif p_type = 'content' then
    update content set status = p_status where id = p_id;
  elsif p_type = 'casting_call' then
    update casting_calls set status = p_status where id = p_id;
  else
    raise exception 'Unknown type';
  end if;

  select full_name into v_admin_name from profiles where id = auth.uid();
  insert into admin_log (admin_id, admin_name, action, target_type, target_id)
  values (auth.uid(), v_admin_name, p_status, p_type, p_id);
end;
$$;

revoke execute on function admin_review(text, uuid, text) from public;
grant execute on function admin_review(text, uuid, text) to authenticated;

-- sample content for the demo
insert into content (title, type, description, year, genre, cast_crew, status)
values
  ('Sample Film One', 'film', 'Placeholder film for the prototype demo.', 2024, 'Drama', 'Sample Director, Sample Actor', 'approved'),
  ('Sample Music Video One', 'music_video', 'Placeholder music video for the prototype demo.', 2025, 'Afrobeat', 'Sample Artist, Sample Director', 'approved');

-- after registering your own account, make it the admin (replace the email):
-- update profiles set is_admin = true where email = 'YOUR-EMAIL';