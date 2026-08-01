-- Bucket de stockage prive pour l'archivage optionnel des rapports PDF generes.
-- Voir docs/SUPABASE_SETUP.md §9 et docs/PRIVACY_AND_SECURITY.md.

insert into storage.buckets (id, name, public)
values ('reports', 'reports', false)
on conflict (id) do nothing;

-- storage.objects a RLS activee par defaut sur Supabase. Politiques restreintes au bucket
-- 'reports' et aux administrateurs uniquement (aucun acces anonyme, aucun acces authentifie
-- non-admin). Le telechargement se fait via URL signee courte duree generee par l'admin
-- (supabase.storage.from('reports').createSignedUrl(...)) ou via ces politiques directes.

create policy "admin_read_reports_bucket"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'reports' and public.is_admin());

create policy "admin_write_reports_bucket"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'reports' and public.is_admin());

create policy "admin_update_reports_bucket"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'reports' and public.is_admin())
  with check (bucket_id = 'reports' and public.is_admin());

create policy "admin_delete_reports_bucket"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'reports' and public.is_admin());
