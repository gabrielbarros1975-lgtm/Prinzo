-- Add 'images' column to store multiple image URLs as a JSON array
-- Run this in the Supabase SQL Editor

alter table public.products
  add column if not exists images jsonb not null default '[]'::jsonb;
