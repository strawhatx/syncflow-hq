
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DefaultLayout from "./layouts/DefaultLayout";
import DashboardPage from "./pages/Dashboard";
import FlowCreate from "./pages/FlowCreate";
import FlowDetails from "./pages/FlowDetails";
import Templates from "./pages/Templates";
import Integrations from "./pages/Integrations";
import Logs from "./pages/Logs";
import NotFound from "./pages/NotFound";
import IndexPage from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DefaultLayout />}>
            <Route index element={<IndexPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/flows/create" element={<FlowCreate />} />
            <Route path="/flows/:id" element={<FlowDetails />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/logs" element={<Logs />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
