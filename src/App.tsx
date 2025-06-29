
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Analysis from "./pages/Analysis";
import Auth from "./pages/Auth";
import DALLEDemo from "./pages/DalleDemo";
import UpgradeSuccess from "./pages/UpgradeSuccess";
import MigrationPage from "./pages/MigrationPage";
import VectorTest from "./pages/VectorTest";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Default route - everything goes to /auth */}
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/dalle-demo" element={<DALLEDemo />} />
            <Route path="/upgrade-success" element={<UpgradeSuccess />} />
            <Route path="/migration-page" element={<MigrationPage />} />
            <Route path="/vector-test" element={<VectorTest />} />
            {/* Catch all other routes and redirect to /auth */}
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
