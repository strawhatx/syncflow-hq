import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/Dashboard";
import Syncs from "./pages/Syncs";
import Sync from "./pages/Sync";
import SyncDetails from "./pages/SyncDetails";
import ConnectorsPage from "./pages/Connectors";
import OAuthCallback from "./pages/OauthCallback";
import NotFound from "./pages/NotFound";
import IndexPage from "./pages/Index";
import AuthPage from "./pages/Auth";
import Profile from "./pages/Profile";
import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { SidebarLayout } from "./layouts/Index";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeaderContentProvider } from '@/contexts/HeaderContentContext';
import TeamsPage from "./pages/Teams";
import { TeamProvider } from "./contexts/TeamContext";
import { withPermission } from './hocs/withPermission';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HeaderContentProvider>
      <AuthProvider>
        <TeamProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<IndexPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/:provider/callback" element={<OAuthCallback />} />

              {/* Protected Routes with Main SidebarLayout */}
              <Route element={<ProtectedRoute><SidebarLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/syncs" element={<>{withPermission(Syncs, 'syncs', 'view')}</>} />
                <Route path="/syncs/edit/:id" element={<>{withPermission(Sync, 'syncs', 'update')}</>} />
                <Route path="/syncs/view/:id" element={<>{withPermission(SyncDetails, 'syncs', 'view')}</>} />
                <Route path="/connectors" element={<>{withPermission(ConnectorsPage, 'connectors', 'view')}</>} />
                <Route path="/teams" element={<>{withPermission(TeamsPage, 'teams', 'view')}</>} />
                <Route path="/profile" element={<>{withPermission(Profile, 'team_members', 'view')}</>} />
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </TeamProvider>
      </AuthProvider>
    </HeaderContentProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);

export default App;

