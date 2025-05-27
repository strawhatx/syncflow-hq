import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/Dashboard";
import Syncs from "./pages/Syncs";
import SyncCreate from "./pages/SyncCreate";
import SyncDetails from "./pages/SyncDetails";
import Templates from "./pages/Templates";
import IntegrationsPage from "./pages/Integrations";
import IntegrationConnectPage from "./pages/IntegrationConnect";
import IntegrationDetail from "./pages/IntegrationDetail";
import OAuthCallback from "./pages/OAuthCallback";
import Logs from "./pages/Logs";
import NotFound from "./pages/NotFound";
import IndexPage from "./pages/Index";
import AuthPage from "./pages/Auth";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { SidebarLayout } from "./layouts/Index";


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

            <Route path="/" element={
              <ProtectedRoute> <SidebarLayout />  </ProtectedRoute>
            }>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="syncs" element={<Syncs />} />
              <Route path="syncs/create" element={<SyncCreate />} />
              <Route path="syncs/:id" element={<SyncDetails />} />
              <Route path="templates" element={<Templates />} />
              <Route path="integrations" element={<IntegrationsPage />} />
              <Route path="integrations/:id/connect" element={<IntegrationConnectPage />} />
              <Route path="integrations/:integrationId/connections/:connectionId" element={<IntegrationDetail />} />
              <Route path="logs" element={<Logs />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

