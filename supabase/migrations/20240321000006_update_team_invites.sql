-- Add verification_code to team_invites
ALTER TABLE team_invites
ADD COLUMN verification_code TEXT NOT NULL;

-- Add index for faster verification code lookups
CREATE INDEX idx_team_invites_verification_code ON team_invites(verification_code);

-- Add index for faster email lookups
CREATE INDEX idx_team_invites_email ON team_invites(email);

-- Add index for faster status lookups
CREATE INDEX idx_team_invites_status ON team_invites(status);

-- Add index for faster team_id lookups
CREATE INDEX idx_team_invites_team_id ON team_invites(team_id);

-- Add index for faster expires_at lookups
CREATE INDEX idx_team_invites_expires_at ON team_invites(expires_at);