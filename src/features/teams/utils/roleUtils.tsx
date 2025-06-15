import React from 'react';
import { Crown, Shield, UserCheck } from "lucide-react";

export const getRoleIcon = (role: string): React.ReactNode => {
  switch (role) {
    case 'owner': return <Crown className="h-3 w-3" />;
    case 'admin': return <Shield className="h-3 w-3" />;
    default: return <UserCheck className="h-3 w-3" />;
  }
};

export const getRoleColor = (role: string) => {
  switch (role) {
    case 'owner': return 'bg-yellow-500/20 text-yellow-400';
    case 'admin': return 'bg-blue-500/20 text-blue-400';
    default: return 'bg-green-500/20 text-green-400';
  }
};

export const getMemberStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-500/20 text-green-400';
    case 'invited': return 'bg-yellow-500/20 text-yellow-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
}; 