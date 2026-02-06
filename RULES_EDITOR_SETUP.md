# Rules Editor Setup

This setup makes rules public-read, editor-write.

## 1) Configure Supabase in site

Edit `rules/supabase-config.js`:

```js
window.PV_SUPABASE = {
    url: "https://YOUR_PROJECT.supabase.co",
    anonKey: "YOUR_SUPABASE_ANON_KEY"
};
```

## 2) Create DB tables + policies

Run `supabase-rules-setup.sql` in Supabase SQL Editor.

## 3) Create editor account(s)

In Supabase Auth, create users for the people allowed to edit rules.

Get each user id from `auth.users` and insert into `public.editors`:

```sql
insert into public.editors (user_id)
values ('USER_UUID_HERE');
```

## 4) How it works

- Everyone can view rules.
- Signed-in users in `public.editors` can open edit mode.
- Add/delete updates are saved in Supabase and shown live to all visitors.

## 5) Note

Do not use service role keys in frontend files. Only use the anon key with RLS enabled.
