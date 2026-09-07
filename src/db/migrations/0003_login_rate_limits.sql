CREATE SCHEMA IF NOT EXISTS app_private;
--> statement-breakpoint
REVOKE ALL ON SCHEMA app_private FROM PUBLIC;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS app_private.login_rate_limits (
  client_key text PRIMARY KEY,
  attempts integer NOT NULL CHECK (attempts BETWEEN 1 AND 11),
  expires_at timestamptz NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS login_rate_limits_expiry_idx ON app_private.login_rate_limits (expires_at);
--> statement-breakpoint
REVOKE ALL ON app_private.login_rate_limits FROM PUBLIC;
--> statement-breakpoint
ALTER TABLE app_private.login_rate_limits ENABLE ROW LEVEL SECURITY;
