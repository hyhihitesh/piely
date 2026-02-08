-- Registry for webhooks that should trigger node updates
create table if not exists public.node_webhooks (
    id uuid not null default gen_random_uuid(),
    node_id uuid not null references public.roadmap_nodes(id) on delete cascade,
    provider text not null, -- e.g., 'stripe', 'vercel', 'github'
    event_type text not null, -- e.g., 'payment_succeeded', 'deployment_ready'
    secret_key text not null default gen_random_uuid(), -- unique key for this webhook endpoint
    is_active boolean default true,
    last_triggered_at timestamp with time zone,
    created_at timestamp with time zone not null default now(),
    primary key (id)
);

alter table public.node_webhooks enable row level security;

-- Policies
create policy "Users can view webhooks for their nodes"
    on public.node_webhooks for select
    using (
        exists (
            select 1 from public.roadmap_nodes n
            where n.id = node_webhooks.node_id
            and exists (
                select 1 from public.roadmaps r
                where r.id = n.roadmap_id
                and r.user_id = auth.uid()
            )
        )
    );

create policy "Users can insert webhooks for their nodes"
    on public.node_webhooks for insert
    with check (
        exists (
            select 1 from public.roadmap_nodes n
            where n.id = node_webhooks.node_id
            and exists (
                select 1 from public.roadmaps r
                where r.id = n.roadmap_id
                and r.user_id = auth.uid()
            )
        )
    );
