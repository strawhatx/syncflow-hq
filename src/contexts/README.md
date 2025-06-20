# Global Team Context

The Team Context provides global access to team and team member data across the entire application, similar to how authentication works.

## Features

- **Automatic Loading**: Team data is automatically loaded when a user logs in
- **Global Access**: Available on any page/component without manual loading
- **Real-time Updates**: Team data stays in sync across all components
- **Loading States**: Provides both `loading` and `initialLoading` states for better UX
- **Error Handling**: Centralized error handling for team operations

## Usage

### Basic Usage

```tsx
import { useTeam } from "@/contexts/TeamContext";

const MyComponent = () => {
  const { 
    team, 
    members, 
    currentMember, 
    loading, 
    initialLoading,
    error 
  } = useTeam();

  if (initialLoading) return <div>Loading team data...</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!team) return <div>No team found</div>;

  return (
    <div>
      <h1>Team: {team.name}</h1>
      <p>Your role: {currentMember?.role}</p>
      <p>Total members: {members.length}</p>
    </div>
  );
};
```

### Available Properties

- `team`: The current team object
- `members`: Array of team members
- `currentMember`: The current user's team member object
- `loading`: Boolean for ongoing operations
- `initialLoading`: Boolean for initial team load
- `error`: Any error that occurred
- `permissionStrategy`: Permission checking utilities

### Available Methods

- `loadTeam(teamId)`: Load a specific team
- `loadCurrentUserTeam()`: Load the current user's team
- `createTeamWithOwner(userId, teamName)`: Create a new team
- `updateMemberRole(memberId, newRole)`: Update a member's role
- `removeMember(memberId)`: Remove a member from the team
- `inviteMember(email)`: Invite a new member
- `canInviteMembers()`: Check if current user can invite members
- `canUpdateRole(targetMember)`: Check if current user can update roles
- `canRemoveMember(targetMember)`: Check if current user can remove members

### Permission Checking

```tsx
const { canInviteMembers, canUpdateRole, canRemoveMember } = useTeam();

// Check permissions
if (canInviteMembers()) {
  // Show invite button
}

if (canUpdateRole(someMember)) {
  // Show role update options
}
```

## Setup

The TeamProvider is already set up globally in `App.tsx`:

```tsx
<AuthProvider>
  <TeamProvider>
    {/* Your app components */}
  </TeamProvider>
</AuthProvider>
```

## Automatic Behavior

1. When a user logs in, their team data is automatically loaded
2. When a user logs out, team data is automatically cleared
3. Team data is available immediately on any page after login
4. No manual loading calls are needed in individual components

## Example: Header Component

```tsx
const Header = () => {
  const { team, currentMember, initialLoading } = useTeam();
  
  return (
    <header>
      {!initialLoading && team && (
        <div>
          Team: {team.name} - Role: {currentMember?.role}
        </div>
      )}
    </header>
  );
};
```

This approach ensures that team data is always available and up-to-date across your entire application! 