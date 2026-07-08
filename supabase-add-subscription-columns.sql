-- Migração: Adicionar colunas de controle de assinatura na tabela stores
-- Execute no SQL Editor do Supabase

alter table public.stores
  add column if not exists subscription_plan text default 'trial',
  add column if not exists subscription_started_at timestamptz,
  add column if not exists subscription_expires_at timestamptz,
  add column if not exists mp_subscription_payment_id text;

-- Atualizar a loja ljvision como já ativa e com datas de assinatura definidas
update public.stores
set
  subscription_plan = 'monthly',
  subscription_started_at = now(),
  subscription_expires_at = now() + interval '30 days'
where slug = 'ljvision' and subscription_active = true;
