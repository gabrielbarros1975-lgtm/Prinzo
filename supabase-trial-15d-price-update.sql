-- Ajusta contabilização do trial e preço do plano mensal.
-- Rode manualmente no SQL editor do Supabase.

-- 1) Lojas existentes que nunca tiveram trial_end_date preenchido (criadas antes
--    desta correção) mantêm a regra antiga de 30 dias de teste, contados a
--    partir da criação da loja. Lojas que já tinham trial_end_date setado
--    (pela migração original) não são afetadas.
update public.stores
set
  trial_start_date = coalesce(trial_start_date, created_at),
  trial_end_date = created_at + interval '30 days',
  subscription_status = coalesce(subscription_status, 'trial')
where trial_end_date is null;

-- 2) Novo preço do plano mensal: R$ 19,90 (1990 centavos).
update public.stores
set monthly_price = 1990;

alter table public.stores
  alter column monthly_price set default 1990;
