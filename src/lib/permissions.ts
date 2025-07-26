import { ConnectorConfig, ConnectorProvider, ConnectorType } from "@/types/connectors";

export type { Permissions };

type Teams = {
  id: string
  name: string
  created_at?: string
  updated_at?: string
}

type TeamMembers = {
  id: string
  team_id: string
  user_id: string
  role: Role;
  status: "invited" | "active";
}

type Connectors = {
  id: string;
  name: string;
  type: ConnectorType;
  provider: ConnectorProvider;
  config: ConnectorConfig;
  is_active: boolean;
}

type Connections = {
  id: string;
  connector_id: string;
  name: string;
  config: ConnectorConfig;
  team_id: string;
  is_active: boolean;
}

type Syncs = {
  id: string;
  team_id: string;
  status: 'draft' | 'active' | 'paused' | 'error';
  created_at: string;
}

type Role = "owner" | "member"

type User = {
  id: string;
  team_member?: TeamMembers;
}

type PermissionCheck<Key extends keyof Permissions> =
  | boolean
  | ((user: User, data: Permissions[Key]["dataType"]) => boolean)

type RolesWithPermissions = {
  [R in Role]: Partial<{
    [Key in keyof Permissions]: Partial<{
      [Action in Permissions[Key]["action"]]: PermissionCheck<Key>
    }>
  }>
}

type Permissions = {
  teams: {
    dataType: Teams
    action: "view"|"view_detail" | "create" | "update" | "delete" | "invite_member" | "remove_member"
  }
  team_members: {
    dataType: TeamMembers
    action: "view" | "update_role" | "remove"
  }
  connectors: {
    dataType: Connectors
    action: "view" | "connect"
  }
  connections: {
    dataType: Connections
    action: "view"|"view_detail" | "create" | "update" | "delete" | "sync"
  }
  syncs: {
    dataType: Syncs
    action: "view"|"view_detail" | "create" | "update" | "delete"
  }
}

const ROLES = {
  owner: {
    teams: {
      // only allow functions that are related to the user's team
      view: true,
      view_detail: (user, team) => user.team_member?.team_id === team.id,
      create: true,
      update: (user, team) => user.team_member?.team_id === team.id,
      delete: (user, team) => user.team_member?.team_id === team.id,
      invite_member: (user, team) => user.team_member?.team_id === team.id,
      remove_member: (user, team) => user.team_member?.team_id === team.id,
    },
    team_members: {
      view: true,
      update_role: (user, member) => user.team_member?.team_id === member.team_id,
      remove: (user, member) => user.team_member?.team_id === member.team_id,
    },
    connectors: {
      view: true,
      connect: true,
    },
    connections: {
      view: true,
      view_detail: (user, connection) => user.team_member?.team_id === connection.team_id,
      create: true,
      update: (user, connection) => user.team_member?.team_id === connection.team_id,
      delete: (user, connection) => user.team_member?.team_id === connection.team_id,
      sync: (user, connection) => user.team_member?.team_id === connection.team_id,
    },
    syncs: {
      view: true,
      view_detail: (user, sync) => user.team_member?.team_id === sync.team_id,
      create: true,
      update: (user, sync) => user.team_member?.team_id === sync.team_id,
      delete: (user, sync) => user.team_member?.team_id === sync.team_id,
    },
  },
  member: {
    teams: {
      view: (user, team) => user.team_member?.team_id === team.id,
      create: false,
      update: false,
      delete: false,
      invite_member: false,
      remove_member: false,
    },
    team_members: {
      view: (user, member) => user.team_member?.team_id === member.team_id,
      update_role: false,
      remove: false,
    },
    connectors: {
      view: true,
      connect: true,
    },
    connections: {
      view: true,
      view_detail: (user, connection) => user.team_member?.team_id === connection.team_id,
      create: true,
      update: (user, connection) => user.team_member?.team_id === connection.team_id,
      delete: (user, connection) => user.team_member?.team_id === connection.team_id,
      sync: (user, connection) => user.team_member?.team_id === connection.team_id,
    },
    syncs: {
      view: true,
      view_detail: (user, sync) => user.team_member?.team_id === sync.team_id,
      create: true,
      update: (user, sync) => user.team_member?.team_id === sync.team_id,
      delete: false,
    },
  },
} as const satisfies RolesWithPermissions

export function hasPermission<Resource extends keyof Permissions>(
  user: User,
  resource: Resource,
  action: Permissions[Resource]["action"],
  data?: Permissions[Resource]["dataType"]
) {
  const role = user.team_member?.role;
  const permission = (ROLES as RolesWithPermissions)[role][resource]?.[action];
  if (permission == null) return false;

  if (typeof permission === "boolean") return permission
  return data != null && permission(user, data)
}

//// USAGE:
//const user: User = { blockedBy: ["2"], id: "1", roles: ["user"] }
//const todo: Todo = {
//  completed: false,
//  id: "3",
//  invitedUsers: [],
//  title: "Test Todo",
//  userId: "1",
//}
//
//// Can create a comment
//hasPermission(user, "comments", "create")
//
//// Can view the `todo` Todo
//hasPermission(user, "todos", "view", todo)
//
//// Can view all todos
//hasPermission(user, "todos", "view")
//hasPermission(user, "todos", "view")