import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
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
              <Route element={<SidebarLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/syncs" element={<ProtectedRoute resource="syncs" action="view"><Syncs /></ProtectedRoute>} />
                <Route path="/syncs/edit/:id" element={<ProtectedRoute resource="syncs" action="update"><Sync /></ProtectedRoute>} />
                <Route path="/syncs/view/:id" element={<ProtectedRoute resource="syncs" action="view"><SyncDetails /></ProtectedRoute>} />
                <Route path="/connectors" element={<ProtectedRoute resource="connectors" action="view"><ConnectorsPage /></ProtectedRoute>} />
                <Route path="/teams" element={<ProtectedRoute resource="teams" action="view"><TeamsPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute resource="team_members" action="view"><Profile /></ProtectedRoute>} />
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

