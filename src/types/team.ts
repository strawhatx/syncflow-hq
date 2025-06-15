export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'invited';
  avatar: string;
  joinedAt: string;
  lastActive: string;
}

export interface TeamActivity {
  id: string;
  user: string;
  action: string;
  target: string;
  type: string;
  timestamp: string;
} 