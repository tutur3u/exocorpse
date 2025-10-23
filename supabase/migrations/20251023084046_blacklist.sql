--
-- Table structure for table `blacklisted_users`
--

CREATE TABLE blacklisted_users (
    -- Unique identifier for the blacklist entry, using UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- The username of the blacklisted person
    username VARCHAR(255) NOT NULL UNIQUE,

    -- The reason for blacklisting
    reasoning TEXT,

    -- The timestamp when the user was blacklisted
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

---

--
-- Row-Level Security (RLS) Configuration
--

-- 1. Enable RLS on the table
ALTER TABLE blacklisted_users ENABLE ROW LEVEL SECURITY;
--
-- Policies
--

create policy "Enable delete for authenticated users"
on "public"."blacklisted_users"
as permissive
for delete
to authenticated
using (true);

create policy "Enable insert for authenticated users only"
on "public"."blacklisted_users"
as permissive
for insert
to authenticated
with check (true);

create policy "Enable read access for all users"
on "public"."blacklisted_users"
as permissive
for select
to public
using (true);

create policy "Enable update for authenticated users"
on "public"."blacklisted_users"
as permissive
for update
to authenticated
using (true)
with check (true);


-- Optional: Add an index on the username for faster lookups
CREATE UNIQUE INDEX idx_blacklisted_username ON blacklisted_users (username);
