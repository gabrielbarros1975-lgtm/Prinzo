-- Script SQL para configurar a estrutura de SaaS multi-tenant no Supabase.
-- Execute este script no SQL Editor do seu painel do Supabase.

-- 1. Criar a tabela de lojas (stores)
create table if not exists public.stores (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  name text not null,
  description text,
  logo_url text,
  whatsapp_number text not null,
  pix_key text,
  pix_name text,
  pix_city text,
  mp_access_token text,             -- Token do Mercado Pago do próprio lojista
  payment_methods text not null default 'whatsapp', -- 'whatsapp', 'pix_direct', 'mercadopago' ou combinações
  subscription_active boolean not null default false,
  owner_email text not null unique,
  owner_password text,
  auth_user_id text,
  created_at timestamptz not null default now()
);

-- Habilitar RLS para lojas
alter table public.stores enable row level security;

-- Políticas de acesso para lojas
create policy "Permitir leitura pública das lojas" on public.stores
  for select using (true);

create policy "Permitir inserção pública de lojas" on public.stores
  for insert with check (true);

create policy "Permitir atualização de lojas" on public.stores
  for update using (true);

-- 2. Adicionar a coluna store_id nas tabelas existentes
alter table public.categories add column if not exists store_id uuid references public.stores(id) on delete cascade;
alter table public.products add column if not exists store_id uuid references public.stores(id) on delete cascade;

-- 3. Criar ou atualizar políticas para produtos e categorias
-- (Ajuste conforme suas necessidades de segurança em produção)
alter table public.products enable row level security;
alter table public.categories enable row level security;

drop policy if exists "Allow public select" on public.products;
create policy "Leitura pública de produtos" on public.products for select using (true);
create policy "Escrita geral de produtos" on public.products for all using (true);

drop policy if exists "Allow select for anon" on public.categories;
create policy "Leitura pública de categorias" on public.categories for select using (true);
create policy "Escrita geral de categorias" on public.categories for all using (true);

-- 4. Adicionar colunas de migração se a tabela já existir
alter table public.stores add column if not exists mp_access_token text;
alter table public.stores add column if not exists auth_user_id text;
alter table public.stores alter column owner_password drop not null;

-- 5. Criar a loja padrão 'ljvision' e associar produtos/categorias antigos a ela
insert into public.stores (slug, name, description, whatsapp_number, pix_key, pix_name, pix_city, mp_access_token, payment_methods, subscription_active, owner_email, owner_password)
values (
  'ljvision',
  'LJVision',
  'Coleção exclusiva de produtos personalizados',
  '5598984809302',
  'financeiro@ljvision.com',
  'LJ Vision Ltda',
  'Sao Luis',
  'APP_USR-4071010043563935-062310-360c56d2ff3785a4b54b64bc17b97cbb-263527701',
  'both',
  true,
  'admin@ljvision.com',
  'admin123'
)
on conflict (slug) do nothing;

-- 6. Associar produtos e categorias sem loja à ljvision
update public.products 
set store_id = (select id from public.stores where slug = 'ljvision' limit 1)
where store_id is null;

update public.categories 
set store_id = (select id from public.stores where slug = 'ljvision' limit 1)
where store_id is null;
