-- Conversations Table
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_message_content text,
  last_message_at timestamptz default now()
);

-- Conversation Participants Table
create table if not exists public.conversation_participants (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(conversation_id, user_id)
);

-- Messages Table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

-- Policies for Conversations
create policy "Users can view conversations they are part of"
  on public.conversations
  for select
  using (
    exists (
      select 1 from public.conversation_participants
      where conversation_id = public.conversations.id
      and user_id = auth.uid()
    )
  );

-- Policies for Participants
create policy "Users can view participants of their conversations"
  on public.conversation_participants
  for select
  using (
    exists (
      select 1 from public.conversation_participants inner_cp
      where inner_cp.conversation_id = public.conversation_participants.conversation_id
      and inner_cp.user_id = auth.uid()
    )
  );

-- Policies for Messages
create policy "Users can view messages in their conversations"
  on public.messages
  for select
  using (
    exists (
      select 1 from public.conversation_participants
      where conversation_id = public.messages.conversation_id
      and user_id = auth.uid()
    )
  );

create policy "Users can insert messages in their conversations"
  on public.messages
  for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversation_participants
      where conversation_id = public.messages.conversation_id
      and user_id = auth.uid()
    )
  );
