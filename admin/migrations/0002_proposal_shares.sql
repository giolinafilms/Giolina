-- Separate table intentionally unavailable to the generic CRM record API.
CREATE TABLE IF NOT EXISTS proposal_shares (
 organization_id TEXT NOT NULL,
 kind TEXT NOT NULL DEFAULT 'proposal-shares' CHECK(kind='proposal-shares'),
 id TEXT NOT NULL,
 data TEXT NOT NULL CHECK(json_valid(data)),
 version INTEGER NOT NULL DEFAULT 1,
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL,
 PRIMARY KEY(organization_id,kind,id)
);
CREATE INDEX IF NOT EXISTS proposal_shares_project ON proposal_shares(organization_id,json_extract(data,'$.proposalId'),created_at);
