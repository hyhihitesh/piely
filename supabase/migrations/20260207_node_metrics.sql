-- Table to store KPI metrics for nodes
create table if not exists public.node_metrics (
    id uuid not null default gen_random_uuid(),
    node_id uuid not null references public.roadmap_nodes(id) on delete cascade,
    label text not null,        -- e.g., "Revenue", "Users", "Latency"
    value text not null,        -- e.g., "$5,000", "1,200", "45ms" (stored as text for flexibility)
    unit text,                  -- e.g., "USD", "Count", "ms"
    trend text check (trend in ('up', 'down', 'neutral')), 
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    primary key (id)
);

alter table public.node_metrics enable row level security;

-- Policies (same pattern as other node tables)
create policy "Users can view metrics for their nodes"
    on public.node_metrics for select
    using (
        exists (
            select 1 from public.roadmap_nodes n
            where n.id = node_metrics.node_id
            and exists (
                select 1 from public.roadmaps r
                where r.id = n.roadmap_id
                and r.user_id = auth.uid()
            )
        )
    );

create policy "Users can insert/update metrics for their nodes"
    on public.node_metrics for all
    using (
        exists (
            select 1 from public.roadmap_nodes n
            where n.id = node_metrics.node_id
            and exists (
                select 1 from public.roadmaps r
                where r.id = n.roadmap_id
                and r.user_id = auth.uid()
            )
        )
    );
