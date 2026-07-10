-- Script para adicionar campos de período gratuito (trial) à tabela stores
-- Execute este script no SQL Editor do seu painel do Supabase

-- 1. Adicionar colunas de controle de trial e assinatura
alter table public.stores add column if not exists trial_start_date timestamptz default now();
alter table public.stores add column if not exists trial_end_date timestamptz;
alter table public.stores add column if not exists subscription_status text default 'trial'; -- 'trial', 'active', 'canceled', 'expired'
alter table public.stores add column if not exists monthly_price integer default 2000; -- R$ 20,00 em centavos
alter table public.stores add column if not exists payment_method_subscription text default 'mercadopago'; -- Método de pagamento para assinatura
alter table public.stores add column if not exists mp_subscription_id text; -- ID da assinatura no Mercado Pago
alter table public.stores add column if not exists last_payment_date timestamptz;
alter table public.stores add column if not exists next_payment_date timestamptz;

-- 2. Atualizar o trial_end_date para lojas existentes (30 dias após criação)
update public.stores
set trial_end_date = created_at + interval '30 days'
where trial_end_date is null;

-- 3. Atualizar subscription_status baseado na data
update public.stores
set subscription_status = 'trial'
where trial_end_date > now() and subscription_status != 'active';

-- 4. Criar função para calcular se uma loja está em período de teste
create or replace function is_store_in_trial(store_id uuid)
returns boolean as $$
begin
  return exists(
    select 1 from public.stores
    where id = store_id
    and subscription_status = 'trial'
    and trial_end_date > now()
  );
end;
$$ language plpgsql;

-- 5. Criar função para verificar acesso à loja
create or replace function can_access_store(store_id uuid)
returns boolean as $$
begin
  return exists(
    select 1 from public.stores
    where id = store_id
    and (
      subscription_status = 'trial' or
      subscription_status = 'active'
    )
  );
end;
$$ language plpgsql;

-- 6. Atualizar lojas existentes para o status correto
update public.stores
set subscription_status = 'active', subscription_active = true
where subscription_active = true;
