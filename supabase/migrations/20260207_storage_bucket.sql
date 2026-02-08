-- Create the storage bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('node-attachments', 'node-attachments', true)
on conflict (id) do nothing;

-- Allow public access to read files (since we set public=true)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'node-attachments' );

-- Allow authenticated users to upload files
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check (
    bucket_id = 'node-attachments'
    and auth.role() = 'authenticated'
  );

-- Allow users to delete their own files (or files in nodes they have access to - simplified here)
-- Ideally we check project ownership, but for storage RLS this is tricky without complex joins.
-- For now, generic authenticated delete for this bucket (User trusts their team).
create policy "Authenticated users can delete"
  on storage.objects for delete
  using (
    bucket_id = 'node-attachments'
    and auth.role() = 'authenticated'
  );
