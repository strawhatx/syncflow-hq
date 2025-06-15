import { Mail, Users, UserCheck, Shield } from "lucide-react";

// Component for stats cards  
export const StatCard = ({ title, type, stats }) => {
    const value = stats[type];
    const icons = {
      total: <Users className="h-5 w-5" />,
      active: <UserCheck className="h-5 w-5" />,
      pending: <Mail className="h-5 w-5" />,
      admins: <Shield className="h-5 w-5" />
    };
    const bgColors = {
      total: 'bg-blue-500/20',
      active: 'bg-green-500/20',
      pending: 'bg-yellow-500/20',
      admins: 'bg-purple-500/20'
    };
  
    return (
      <div className="bg-white/5 p-6 rounded-xl border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
          <div className={`${bgColors[type]} p-3 rounded-lg`}>
            {icons[type]}
          </div>
        </div>
      </div>
    );
  };