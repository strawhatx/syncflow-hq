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

type Role = "owner" | "admin" | "member"

type User = {
  id: string;
  role: Role;
  team_id?: string;
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
    action: "view" | "create" | "update" | "delete" | "invite_member" | "remove_member"
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
    action: "view" | "create" | "update" | "delete" | "sync"
  }
}

const ROLES = {
  owner: {
    teams: {
      view: true,
      create: true,
      update: true,
      delete: true,
      invite_member: true,
      remove_member: true,
    },
    team_members: {
      view: true,
      update_role: true,
      remove: true,
    },
    connectors: {
      view: true,
      connect: true,
    },
    connections: {
      view: true,
      create: true,
      update: true,
      delete: true,
      sync: true,
    },
  },
  admin: {
    teams: {
      view: true,
      create: false,
      update: true,
      delete: false,
      invite_member: true,
      remove_member: (user, team) => user.team_id === team.id,
    },
    team_members: {
      view: true,
      update_role: (user, member) => user.team_id === member.team_id && member.role !== "owner",
      remove: (user, member) => user.team_id === member.team_id && member.role !== "owner",
    },
    connectors: {
      view: true,
      connect: true,
    },
    connections: {
      view: true,
      create: true,
      update: true,
      delete: true,
      sync: true,
    },
  },
  member: {
    teams: {
      view: true,
      create: false,
      update: false,
      delete: false,
      invite_member: false,
      remove_member: false,
    },
    team_members: {
      view: true,
      update_role: false,
      remove: false,
    },
    connectors: {
      view: true,
      connect: false,
    },
    connections: {
      view: true,
      create: false,
      update: false,
      delete: false,
      sync: true,
    },
  },
} as const satisfies RolesWithPermissions

export function hasPermission<Resource extends keyof Permissions>(
  user: User,
  resource: Resource,
  action: Permissions[Resource]["action"],
  data?: Permissions[Resource]["dataType"]
) {
  const role = user.role;
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