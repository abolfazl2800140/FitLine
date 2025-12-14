-- Add reply_to_id column to messages table for reply functionality
ALTER TABLE "messages" ADD COLUMN "reply_to_id" varchar(36);

-- Add foreign key constraint
ALTER TABLE "messages" ADD CONSTRAINT "messages_reply_to_id_messages_id_fk" 
  FOREIGN KEY ("reply_to_id") REFERENCES "public"."messages"("id") ON DELETE SET NULL ON UPDATE no action;

-- Create index for faster lookups
CREATE INDEX "messages_reply_to_id_idx" ON "messages" ("reply_to_id");
