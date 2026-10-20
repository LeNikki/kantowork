-- Password reset support.
--
-- reset_token_hash stores a SHA-256 hex digest (64 chars), never the token
-- itself: whoever reads this table cannot mint a working reset link, and a
-- leaked backup does not hand out live reset links. The raw token only ever
-- exists in the email we send.
--
-- reset_expires_at is enforced in the service layer, not the schema, because a
-- CHECK against now() is not immutable and Postgres rejects it.

ALTER TABLE kantowork.users
    ADD COLUMN IF NOT EXISTS reset_token_hash  VARCHAR(64),
    ADD COLUMN IF NOT EXISTS reset_expires_at TIMESTAMPTZ;

-- The reset flow looks a user up by this hash, so index it. Partial: most rows
-- have NULL here, and those do not need to be in the index at all.
CREATE INDEX IF NOT EXISTS idx_users_reset_token_hash
    ON kantowork.users (reset_token_hash)
    WHERE reset_token_hash IS NOT NULL;