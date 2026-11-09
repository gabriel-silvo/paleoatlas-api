CREATE TABLE IF NOT EXISTS catalog_snapshots (
  hash text PRIMARY KEY CHECK (hash ~ '^[a-f0-9]{64}$'),
  document jsonb NOT NULL CHECK (jsonb_typeof(document) = 'object'),
  generated_at timestamptz NOT NULL,
  stored_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS catalog_current (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton = true),
  snapshot_hash text NOT NULL REFERENCES catalog_snapshots(hash)
);
