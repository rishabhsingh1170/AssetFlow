-- AssetFlow Supabase/PostgreSQL schema
-- Run in Supabase SQL editor or through a migration tool.

begin;

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

do $$ begin
  create type app_role as enum ('admin', 'asset_manager', 'department_head', 'employee');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type record_status as enum ('active', 'inactive');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type asset_status as enum (
    'available',
    'allocated',
    'reserved',
    'under_maintenance',
    'lost',
    'retired',
    'disposed'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type asset_condition as enum ('new', 'good', 'fair', 'poor', 'damaged');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type holder_type as enum ('employee', 'department');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type allocation_status as enum ('active', 'returned', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type transfer_status as enum ('requested', 'approved', 'rejected', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type booking_status as enum ('upcoming', 'ongoing', 'completed', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type maintenance_priority as enum ('low', 'medium', 'high', 'critical');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type maintenance_status as enum (
    'pending',
    'approved',
    'rejected',
    'technician_assigned',
    'in_progress',
    'resolved',
    'cancelled'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type audit_cycle_status as enum ('draft', 'scheduled', 'in_progress', 'closed', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type audit_item_status as enum ('pending', 'verified', 'missing', 'damaged');
exception when duplicate_object then null;
end $$;

create table if not exists departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null,
  parent_department_id uuid references departments(id) on delete set null,
  head_user_id uuid,
  status record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (code),
  check (length(trim(name)) > 0),
  check (length(trim(code)) > 0),
  check (parent_department_id is null or parent_department_id <> id)
);

create table if not exists app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  department_id uuid references departments(id) on delete set null,
  full_name text not null,
  email text not null,
  role app_role not null default 'employee',
  status record_status not null default 'active',
  phone text,
  employee_code text,
  promoted_by uuid references app_users(id) on delete set null,
  promoted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email),
  unique (employee_code),
  check (length(trim(full_name)) > 0),
  check (email = lower(email))
);

do $$ begin
  alter table departments
    add constraint departments_head_user_fk
    foreign key (head_user_id) references app_users(id) on delete set null;
exception when duplicate_object then null;
end $$;

create table if not exists asset_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null,
  description text,
  custom_fields jsonb not null default '{}'::jsonb,
  status record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name),
  unique (code),
  check (jsonb_typeof(custom_fields) = 'object')
);

create sequence if not exists asset_tag_seq start 1;

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null,
  department_id uuid references departments(id) on delete set null,
  address text,
  status record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (code)
);

create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  asset_tag text not null default ('AF-' || lpad(nextval('asset_tag_seq')::text, 6, '0')),
  name text not null,
  category_id uuid not null references asset_categories(id) on delete restrict,
  serial_number text,
  acquisition_date date,
  acquisition_cost numeric(14,2),
  condition asset_condition not null default 'good',
  status asset_status not null default 'available',
  location_id uuid references locations(id) on delete set null,
  owning_department_id uuid references departments(id) on delete set null,
  is_shared_bookable boolean not null default false,
  qr_code text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  retired_at timestamptz,
  disposed_at timestamptz,
  created_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (asset_tag),
  unique (serial_number),
  check (acquisition_cost is null or acquisition_cost >= 0),
  check (jsonb_typeof(metadata) = 'object'),
  check (
    (status <> 'retired' or retired_at is not null)
    and (status <> 'disposed' or disposed_at is not null)
  )
);

create table if not exists asset_allocations (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id) on delete restrict,
  holder_type holder_type not null,
  holder_user_id uuid references app_users(id) on delete restrict,
  holder_department_id uuid references departments(id) on delete restrict,
  allocated_by uuid references app_users(id) on delete set null,
  allocated_at timestamptz not null default now(),
  expected_return_at timestamptz,
  returned_at timestamptz,
  return_received_by uuid references app_users(id) on delete set null,
  checkout_condition asset_condition not null,
  checkin_condition asset_condition,
  checkin_notes text,
  status allocation_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (holder_type = 'employee' and holder_user_id is not null and holder_department_id is null)
    or
    (holder_type = 'department' and holder_department_id is not null and holder_user_id is null)
  ),
  check (expected_return_at is null or expected_return_at > allocated_at),
  check ((status = 'returned') = (returned_at is not null))
);

create unique index if not exists one_active_allocation_per_asset
  on asset_allocations(asset_id)
  where status = 'active';

create index if not exists asset_allocations_holder_user_idx
  on asset_allocations(holder_user_id)
  where status = 'active';

create index if not exists asset_allocations_holder_department_idx
  on asset_allocations(holder_department_id)
  where status = 'active';

create table if not exists asset_transfer_requests (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id) on delete restrict,
  from_allocation_id uuid references asset_allocations(id) on delete set null,
  requested_by uuid not null references app_users(id) on delete restrict,
  target_holder_type holder_type not null,
  target_user_id uuid references app_users(id) on delete restrict,
  target_department_id uuid references departments(id) on delete restrict,
  reason text,
  status transfer_status not null default 'requested',
  approved_by uuid references app_users(id) on delete set null,
  approved_at timestamptz,
  rejected_by uuid references app_users(id) on delete set null,
  rejected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (target_holder_type = 'employee' and target_user_id is not null and target_department_id is null)
    or
    (target_holder_type = 'department' and target_department_id is not null and target_user_id is null)
  )
);

create table if not exists resource_bookings (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id) on delete restrict,
  booked_by uuid not null references app_users(id) on delete restrict,
  department_id uuid references departments(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status booking_status not null default 'upcoming',
  purpose text,
  cancelled_by uuid references app_users(id) on delete set null,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check ((status = 'cancelled') = (cancelled_at is not null))
);

alter table resource_bookings
  drop constraint if exists no_overlapping_active_bookings;

alter table resource_bookings
  add constraint no_overlapping_active_bookings
  exclude using gist (
    asset_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  )
  where (status in ('upcoming', 'ongoing'));

create index if not exists resource_bookings_asset_time_idx
  on resource_bookings using gist (asset_id, tstzrange(starts_at, ends_at, '[)'));

create table if not exists maintenance_requests (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id) on delete restrict,
  requested_by uuid not null references app_users(id) on delete restrict,
  issue_description text not null,
  priority maintenance_priority not null default 'medium',
  status maintenance_status not null default 'pending',
  approved_by uuid references app_users(id) on delete set null,
  approved_at timestamptz,
  rejected_by uuid references app_users(id) on delete set null,
  rejected_at timestamptz,
  technician_user_id uuid references app_users(id) on delete set null,
  started_at timestamptz,
  resolved_at timestamptz,
  resolution_notes text,
  estimated_cost numeric(14,2),
  actual_cost numeric(14,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(trim(issue_description)) > 0),
  check (estimated_cost is null or estimated_cost >= 0),
  check (actual_cost is null or actual_cost >= 0),
  check (resolved_at is null or started_at is null or resolved_at >= started_at)
);

create table if not exists audit_cycles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  scope_department_id uuid references departments(id) on delete set null,
  scope_location_id uuid references locations(id) on delete set null,
  starts_on date not null,
  ends_on date not null,
  status audit_cycle_status not null default 'draft',
  created_by uuid references app_users(id) on delete set null,
  closed_by uuid references app_users(id) on delete set null,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);

create table if not exists audit_cycle_auditors (
  audit_cycle_id uuid not null references audit_cycles(id) on delete cascade,
  auditor_user_id uuid not null references app_users(id) on delete restrict,
  assigned_at timestamptz not null default now(),
  primary key (audit_cycle_id, auditor_user_id)
);

create table if not exists audit_items (
  id uuid primary key default gen_random_uuid(),
  audit_cycle_id uuid not null references audit_cycles(id) on delete cascade,
  asset_id uuid not null references assets(id) on delete restrict,
  auditor_user_id uuid references app_users(id) on delete set null,
  status audit_item_status not null default 'pending',
  notes text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (audit_cycle_id, asset_id)
);

create table if not exists audit_discrepancies (
  id uuid primary key default gen_random_uuid(),
  audit_item_id uuid not null unique references audit_items(id) on delete cascade,
  asset_id uuid not null references assets(id) on delete restrict,
  discrepancy_type audit_item_status not null,
  description text,
  resolved_by uuid references app_users(id) on delete set null,
  resolved_at timestamptz,
  resolution_notes text,
  created_at timestamptz not null default now(),
  check (discrepancy_type in ('missing', 'damaged'))
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  title text not null,
  body text,
  type text not null,
  related_table text,
  related_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_unread_idx
  on notifications(user_id, created_at desc)
  where read_at is null;

create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references app_users(id) on delete set null,
  action text not null,
  entity_table text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_entity_idx
  on activity_logs(entity_table, entity_id, created_at desc);

create table if not exists file_attachments (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'assetflow',
  object_path text not null,
  original_file_name text,
  mime_type text,
  size_bytes bigint,
  owner_user_id uuid references app_users(id) on delete set null,
  entity_table text not null,
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  unique (bucket, object_path),
  check (size_bytes is null or size_bytes >= 0)
);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function sync_asset_status_after_allocation()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' and new.status = 'active' then
    update assets set status = 'allocated', updated_at = now() where id = new.asset_id;
  elsif tg_op = 'UPDATE' and old.status = 'active' and new.status = 'returned' then
    update assets set status = 'available', condition = coalesce(new.checkin_condition, condition), updated_at = now()
    where id = new.asset_id and status = 'allocated';
  end if;
  return new;
end;
$$;

create or replace function sync_asset_status_after_maintenance()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'approved' and old.status is distinct from new.status then
    update assets set status = 'under_maintenance', updated_at = now() where id = new.asset_id;
  elsif new.status = 'resolved' and old.status is distinct from new.status then
    update assets set status = 'available', updated_at = now() where id = new.asset_id;
  end if;
  return new;
end;
$$;

create or replace function create_asset_allocation(
  p_asset_id uuid,
  p_holder_type holder_type,
  p_holder_user_id uuid,
  p_holder_department_id uuid,
  p_allocated_by uuid,
  p_expected_return_at timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_asset assets%rowtype;
  v_allocation_id uuid;
begin
  select * into v_asset
  from assets
  where id = p_asset_id
  for update;

  if not found then
    raise exception 'Asset not found';
  end if;

  if v_asset.status <> 'available' then
    raise exception 'Asset % is currently % and cannot be allocated', v_asset.asset_tag, v_asset.status;
  end if;

  insert into asset_allocations (
    asset_id,
    holder_type,
    holder_user_id,
    holder_department_id,
    allocated_by,
    expected_return_at,
    checkout_condition
  )
  values (
    p_asset_id,
    p_holder_type,
    p_holder_user_id,
    p_holder_department_id,
    p_allocated_by,
    p_expected_return_at,
    v_asset.condition
  )
  returning id into v_allocation_id;

  return v_allocation_id;
end;
$$;

create or replace function create_resource_booking(
  p_asset_id uuid,
  p_booked_by uuid,
  p_department_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_purpose text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_asset assets%rowtype;
  v_booking_id uuid;
begin
  select * into v_asset
  from assets
  where id = p_asset_id
  for update;

  if not found then
    raise exception 'Resource not found';
  end if;

  if not v_asset.is_shared_bookable then
    raise exception 'Asset % is not a bookable shared resource', v_asset.asset_tag;
  end if;

  if v_asset.status not in ('available', 'reserved') then
    raise exception 'Resource % is currently % and cannot be booked', v_asset.asset_tag, v_asset.status;
  end if;

  insert into resource_bookings (
    asset_id,
    booked_by,
    department_id,
    starts_at,
    ends_at,
    purpose
  )
  values (p_asset_id, p_booked_by, p_department_id, p_starts_at, p_ends_at, p_purpose)
  returning id into v_booking_id;

  update assets set status = 'reserved', updated_at = now()
  where id = p_asset_id and status = 'available';

  return v_booking_id;
end;
$$;

create or replace function return_asset_allocation(
  p_allocation_id uuid,
  p_return_received_by uuid,
  p_checkin_condition asset_condition,
  p_checkin_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_allocation asset_allocations%rowtype;
begin
  select * into v_allocation
  from asset_allocations
  where id = p_allocation_id
  for update;

  if not found then
    raise exception 'Allocation not found';
  end if;

  if v_allocation.status <> 'active' then
    raise exception 'Allocation % is not active', p_allocation_id;
  end if;

  update asset_allocations
  set
    status = 'returned',
    returned_at = now(),
    return_received_by = p_return_received_by,
    checkin_condition = p_checkin_condition,
    checkin_notes = p_checkin_notes
  where id = p_allocation_id;

  return p_allocation_id;
end;
$$;

create or replace function approve_transfer_request(
  p_transfer_request_id uuid,
  p_approved_by uuid,
  p_expected_return_at timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request asset_transfer_requests%rowtype;
  v_asset assets%rowtype;
  v_current_allocation asset_allocations%rowtype;
  v_new_allocation_id uuid;
begin
  select * into v_request
  from asset_transfer_requests
  where id = p_transfer_request_id
  for update;

  if not found then
    raise exception 'Transfer request not found';
  end if;

  if v_request.status <> 'requested' then
    raise exception 'Transfer request % is already %', p_transfer_request_id, v_request.status;
  end if;

  select * into v_asset
  from assets
  where id = v_request.asset_id
  for update;

  select * into v_current_allocation
  from asset_allocations
  where asset_id = v_request.asset_id and status = 'active'
  for update;

  if not found then
    raise exception 'No active allocation found for transfer';
  end if;

  update asset_allocations
  set
    status = 'returned',
    returned_at = now(),
    return_received_by = p_approved_by,
    checkin_condition = checkout_condition,
    checkin_notes = 'Closed by approved transfer request'
  where id = v_current_allocation.id;

  insert into asset_allocations (
    asset_id,
    holder_type,
    holder_user_id,
    holder_department_id,
    allocated_by,
    expected_return_at,
    checkout_condition
  )
  values (
    v_request.asset_id,
    v_request.target_holder_type,
    v_request.target_user_id,
    v_request.target_department_id,
    p_approved_by,
    p_expected_return_at,
    v_asset.condition
  )
  returning id into v_new_allocation_id;

  update asset_transfer_requests
  set
    status = 'approved',
    approved_by = p_approved_by,
    approved_at = now()
  where id = p_transfer_request_id;

  return v_new_allocation_id;
end;
$$;

create or replace function sync_asset_status_after_booking()
returns trigger
language plpgsql
as $$
begin
  if new.status in ('completed', 'cancelled') and old.status is distinct from new.status then
    if not exists (
      select 1 from resource_bookings
      where asset_id = new.asset_id
        and id <> new.id
        and status in ('upcoming', 'ongoing')
    ) then
      update assets
      set status = 'available', updated_at = now()
      where id = new.asset_id and status = 'reserved';
    end if;
  end if;

  return new;
end;
$$;

do $$ declare
  t text;
begin
  foreach t in array array[
    'departments',
    'app_users',
    'asset_categories',
    'locations',
    'assets',
    'asset_allocations',
    'asset_transfer_requests',
    'resource_bookings',
    'maintenance_requests',
    'audit_cycles',
    'audit_items'
  ] loop
    execute format('drop trigger if exists set_%I_updated_at on %I', t, t);
    execute format(
      'create trigger set_%I_updated_at before update on %I for each row execute function set_updated_at()',
      t,
      t
    );
  end loop;
end $$;

drop trigger if exists asset_allocation_status_sync on asset_allocations;
create trigger asset_allocation_status_sync
after insert or update of status, checkin_condition on asset_allocations
for each row execute function sync_asset_status_after_allocation();

drop trigger if exists maintenance_asset_status_sync on maintenance_requests;
create trigger maintenance_asset_status_sync
after update of status on maintenance_requests
for each row execute function sync_asset_status_after_maintenance();

drop trigger if exists booking_asset_status_sync on resource_bookings;
create trigger booking_asset_status_sync
after update of status on resource_bookings
for each row execute function sync_asset_status_after_booking();

create or replace view active_allocation_overdues as
select
  aa.*,
  a.asset_tag,
  a.name as asset_name
from asset_allocations aa
join assets a on a.id = aa.asset_id
where aa.status = 'active'
  and aa.expected_return_at is not null
  and aa.expected_return_at < now();

create or replace view dashboard_kpis as
select
  count(*) filter (where status = 'available') as assets_available,
  count(*) filter (where status = 'allocated') as assets_allocated,
  count(*) filter (where status = 'under_maintenance') as assets_under_maintenance,
  (select count(*) from resource_bookings where status in ('upcoming', 'ongoing')) as active_bookings,
  (select count(*) from asset_transfer_requests where status = 'requested') as pending_transfers,
  (select count(*) from asset_allocations where status = 'active' and expected_return_at between now() and now() + interval '7 days') as upcoming_returns,
  (select count(*) from active_allocation_overdues) as overdue_returns
from assets;

alter table departments enable row level security;
alter table app_users enable row level security;
alter table asset_categories enable row level security;
alter table locations enable row level security;
alter table assets enable row level security;
alter table asset_allocations enable row level security;
alter table asset_transfer_requests enable row level security;
alter table resource_bookings enable row level security;
alter table maintenance_requests enable row level security;
alter table audit_cycles enable row level security;
alter table audit_cycle_auditors enable row level security;
alter table audit_items enable row level security;
alter table audit_discrepancies enable row level security;
alter table notifications enable row level security;
alter table activity_logs enable row level security;
alter table file_attachments enable row level security;

create or replace function current_app_role()
returns app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from app_users where id = auth.uid()
$$;

commit;
