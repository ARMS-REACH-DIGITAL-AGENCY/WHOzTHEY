// Single source of truth for the sponsor/hook/lead schema. Every route that
// touches these tables should call ensureSponsorTables(sql) before querying,
// instead of redefining CREATE TABLE / ALTER TABLE statements locally.
export async function ensureSponsorTables(sql) {
  await sql`create extension if not exists pgcrypto`

  await sql`
    create table if not exists sponsors (
      id uuid primary key default gen_random_uuid(),
      sponsor_name text not null,
      contact_name text,
      contact_email text,
      website_url text,
      cta_url text,
      status text not null default 'draft',
      stripe_customer_id text,
      stripe_subscription_id text,
      ghl_contact_id text,
      tier text,
      dashboard_token text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `

  await sql`
    create table if not exists sponsor_cards (
      id uuid primary key default gen_random_uuid(),
      sponsor_id uuid references sponsors(id) on delete cascade,
      teaser text not null,
      body text,
      cta_label text,
      cta_url text,
      logo_url text,
      accent_color text,
      link_mode text not null default 'panel',
      lead_fields jsonb,
      is_active boolean not null default false,
      starts_at timestamptz,
      ends_at timestamptz,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `

  await sql`
    create table if not exists sponsor_leads (
      id uuid primary key default gen_random_uuid(),
      sponsor_card_id uuid references sponsor_cards(id) on delete cascade,
      sponsor_id uuid references sponsors(id) on delete cascade,
      name text,
      email text,
      phone text,
      answer text,
      session_id text,
      firebase_uid text,
      created_at timestamptz not null default now()
    )
  `

  // Columns added after the original launch — kept idempotent for existing rows.
  await sql`alter table sponsors add column if not exists tier text`
  await sql`alter table sponsors add column if not exists dashboard_token text`
  await sql`create unique index if not exists sponsors_dashboard_token_idx on sponsors (dashboard_token) where dashboard_token is not null`
  await sql`alter table sponsor_cards add column if not exists link_mode text not null default 'panel'`
  await sql`alter table sponsor_cards add column if not exists logo_url text`
  await sql`alter table sponsor_cards add column if not exists lead_fields jsonb`
}
