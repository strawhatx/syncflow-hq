import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/Dashboard";
import Syncs from "./pages/Syncs";
import SyncDetails from "./pages/SyncDetails";
import Templates from "./pages/Templates";
import IntegrationsPage from "./pages/Integrations";
import IntegrationDetailPage from "./pages/IntegrationDetail";
import OAuthCallback from "./pages/OAuthCallback";
import Logs from "./pages/Logs";
import NotFound from "./pages/NotFound";
import IndexPage from "./pages/Index";
import AuthPage from "./pages/Auth";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { SidebarLayout, SidebarSyncLayout } from "./layouts/Index";
import Sync from "./pages/SyncCreateConnections";
import SyncCreateMappings from "./features/sync-create-mappings";
import SyncCreateConnections from "./features/sync-create-connections";
import SyncCreateAuthorize from "./pages/SyncCreateAuthorize";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/:provider/callback" element={<OAuthCallback />} />

            <Route path="/syncs" element={
              <ProtectedRoute> <SidebarSyncLayout currentStep={0} />  </ProtectedRoute>
            }>
              <Route path="syncs/edit/connect/:id" element={<SyncCreateConnections />} />
              <Route path="syncs/edit/mapping/:id" element={<SyncCreateMappings />} />
              <Route path="syncs/edit/authorize/:id" element={<SyncCreateAuthorize />} />
            </Route>

            <Route path="/" element={
              <ProtectedRoute> <SidebarLayout />  </ProtectedRoute>
            }>
               <Route path="syncs" element={<Syncs />} />
              <Route path="syncs/:id" element={<SyncDetails />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="integrations" element={<IntegrationsPage />} />
              <Route path="connections/:connectionId" element={<IntegrationDetailPage />} />
              <Route path="logs" element={<Logs />} />
              <Route path="profile" element={<Profile />} />  
              <Route path="templates" element={<Templates />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

