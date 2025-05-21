
import UserProfile from "@/components/profile/UserProfile";

const Profile = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>
      
      <div className="grid grid-cols-1">
        <UserProfile />
      </div>
    </div>
  );
};

export default Profile;
