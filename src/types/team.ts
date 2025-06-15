export type TeamRole = 'owner' | 'admin' | 'member';
export type TeamMemberStatus = 'active' | 'invited';
export type InviteStatus = 'pending' | 'accepted' | 'expired';

export interface Team {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface TeamMember {
    id: string;
    team_id: string;
    user_id: string;
    role: TeamRole;
    status: TeamMemberStatus;
    created_at: string;
    updated_at: string;
}

// Extended interface for team member with profile data
export interface TeamMemberWithProfile extends TeamMember {
    profile: {
        full_name: string | null;
        avatar_url: string | null;
        email: string;
    };
}

export interface TeamInvite {
    id: string;
    team_id: string;
    email: string;
    verification_code: string;
    status: InviteStatus;
    created_at: string;
    updated_at: string;
    expires_at: string;
}

export interface TeamActivity {
  id: string;
  user: string;
  action: string;
  target: string;
  type: string;
  timestamp: string;
}

export interface CreateTeamParams {
    name: string;
}

export interface CreateTeamMemberParams {
    team_id: string;
    user_id: string;
    role?: TeamRole;
    status?: TeamMemberStatus;
}

export interface CreateTeamInviteParams {
    team_id: string;
    email: string;
} 