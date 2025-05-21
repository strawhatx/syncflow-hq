
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DefaultLayout from "./layouts/DefaultLayout";
import DashboardPage from "./pages/Dashboard";
import Flows from "./pages/Flows";
import FlowCreate from "./pages/FlowCreate";
import FlowDetails from "./pages/FlowDetails";
import Templates from "./pages/Templates";
import Integrations from "./pages/Integrations";
import Logs from "./pages/Logs";
import NotFound from "./pages/NotFound";
import IndexPage from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

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
            <Route path="/auth" element={<Auth />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <DefaultLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="flows" element={<Flows />} />
              <Route path="flows/create" element={<FlowCreate />} />
              <Route path="flows/:id" element={<FlowDetails />} />
              <Route path="templates" element={<Templates />} />
              <Route path="integrations" element={<Integrations />} />
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
