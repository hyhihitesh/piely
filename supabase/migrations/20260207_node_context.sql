-- Create node_chat_messages table for storing chat history per node
create table if not exists public.node_chat_messages (
    id uuid not null default gen_random_uuid(),
    node_id uuid not null references public.nodes(id) on delete cascade,
    role text not null check (role in ('user', 'assistant')),
    content text not null,
    created_at timestamp with time zone not null default now(),
    primary key (id)
);

-- Create node_attachments table for file attachments per node
create table if not exists public.node_attachments (
    id uuid not null default gen_random_uuid(),
    node_id uuid not null references public.nodes(id) on delete cascade,
    file_url text not null,
    file_name text not null,
    file_type text not null,
    file_size integer,
    created_at timestamp with time zone not null default now(),
    primary key (id)
);

-- Enable RLS
alter table public.node_chat_messages enable row level security;
alter table public.node_attachments enable row level security;

-- Policies for chat messages (using nodes -> projects -> owner_id)
create policy "Users can view chat messages for their project nodes"
    on public.node_chat_messages for select
    using (
        exists (
            select 1 from public.nodes n
            where n.id = node_chat_messages.node_id
            and exists (
                select 1 from public.projects p
                where p.id = n.project_id
                and p.owner_id = auth.uid()
            )
        )
    );

create policy "Users can insert chat messages for their project nodes"
    on public.node_chat_messages for insert
    with check (
        exists (
            select 1 from public.nodes n
            where n.id = node_chat_messages.node_id
            and exists (
                select 1 from public.projects p
                where p.id = n.project_id
                and p.owner_id = auth.uid()
            )
        )
    );

-- Policies for attachments
create policy "Users can view attachments for their project nodes"
    on public.node_attachments for select
    using (
        exists (
            select 1 from public.nodes n
            where n.id = node_attachments.node_id
            and exists (
                select 1 from public.projects p
                where p.id = n.project_id
                and p.owner_id = auth.uid()
            )
        )
    );

create policy "Users can insert attachments for their project nodes"
    on public.node_attachments for insert
    with check (
        exists (
            select 1 from public.nodes n
            where n.id = node_attachments.node_id
            and exists (
                select 1 from public.projects p
                where p.id = n.project_id
                and p.owner_id = auth.uid()
            )
        )
    );

create policy "Users can delete attachments for their project nodes"
    on public.node_attachments for delete
    using (
        exists (
            select 1 from public.nodes n
            where n.id = node_attachments.node_id
            and exists (
                select 1 from public.projects p
                where p.id = n.project_id
                and p.owner_id = auth.uid()
            )
        )
    );

-- Create indexes for fast lookups
create index if not exists idx_node_chat_messages_node_id on public.node_chat_messages(node_id);
create index if not exists idx_node_attachments_node_id on public.node_attachments(node_id);
