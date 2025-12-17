CREATE TABLE IF NOT EXISTS "bookmarks" (
  "id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" varchar(36) NOT NULL REFERENCES "users"("id"),
  "item_id" varchar(36) NOT NULL,
  "item_type" varchar(20) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "bookmarks_user_id_idx" ON "bookmarks"("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "bookmarks_user_item_idx" ON "bookmarks"("user_id", "item_id", "item_type");
