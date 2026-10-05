PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS records (
 organization_id TEXT NOT NULL,
 kind TEXT NOT NULL CHECK(kind IN ('contacts','leads','projects','services','packages','appointment-types','availability','appointments','templates','tasks','proposals','contracts','invoices','messages','files','automations')),
 id TEXT NOT NULL,
 data TEXT NOT NULL CHECK(json_valid(data)),
 version INTEGER NOT NULL DEFAULT 1,
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL,
 PRIMARY KEY(organization_id,kind,id)
);
CREATE INDEX IF NOT EXISTS records_by_kind ON records(organization_id,kind,updated_at);
CREATE INDEX IF NOT EXISTS records_project ON records(organization_id,kind,json_extract(data,'$.projectId'));
CREATE TABLE IF NOT EXISTS audit_events (
 id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, actor TEXT NOT NULL,
 action TEXT NOT NULL, record_kind TEXT NOT NULL, record_id TEXT NOT NULL,
 occurred_at TEXT NOT NULL, details TEXT NOT NULL CHECK(json_valid(details))
);
CREATE TABLE IF NOT EXISTS client_grants (
 organization_id TEXT NOT NULL, subject TEXT NOT NULL, project_id TEXT NOT NULL,
 PRIMARY KEY(organization_id,subject,project_id)
);
CREATE TABLE IF NOT EXISTS migration_state (key TEXT PRIMARY KEY,value TEXT NOT NULL);
-- No client records, credentials, payments or signed contracts are seeded.
CREATE TABLE IF NOT EXISTS appointment_locks(organization_id TEXT NOT NULL,minute INTEGER NOT NULL,appointment_id TEXT NOT NULL,PRIMARY KEY(organization_id,minute));
CREATE TABLE IF NOT EXISTS write_guards(token TEXT PRIMARY KEY,valid INTEGER NOT NULL CHECK(valid=1));
