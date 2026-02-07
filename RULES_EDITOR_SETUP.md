# Rules Editor Setup

This setup makes rules public-read, editor-write.

## 1) Configure Supabase in site

Edit `supabase-config.js`:

```js
window.PV_SUPABASE = {
    url: "https://YOUR_PROJECT.supabase.co",
    anonKey: "YOUR_SUPABASE_ANON_KEY"
};
```

## 2) Create DB tables + policies

Run `supabase-rules-setup.sql` in Supabase SQL Editor.

This script is idempotent. You can re-run it to apply new constraints/indexes to existing tables.

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
- Add/delete/reorder updates are saved in Supabase and shown live to all visitors.
- Rule changes are audited in `public.rule_audit`.
- Site content settings are stored in `public.site_settings`.
- Lightweight traffic events are stored in `public.site_events`.

## 5) Note

Do not use service role keys in frontend files. Only use the anon key with RLS enabled.

## 6) Optimization details now included

- `rules.position` is constrained to positive values.
- `rules.text` is constrained to trimmed length between 4 and 500.
- `rules.text` is unique case-insensitively after trim.
- Added indexes for `position` and `updated_at`.
- Added `reorder_rules(uuid[])` RPC for safe drag-drop order saves.
