
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Analysis from "./pages/Analysis";
import AnalysisDetails from "./pages/AnalysisDetails";
import Subscription from "./pages/Subscription";
import Success from "./pages/Success";
import Admin from "./pages/Admin";
import VectorTest from "./pages/VectorTest";
import KnowledgeBaseRecoveryPage from "./pages/KnowledgeBaseRecoveryPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/signup" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/analysis/:id" element={<AnalysisDetails />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/success" element={<Success />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/vector-test" element={<VectorTest />} />
            <Route path="/knowledge-recovery" element={<KnowledgeBaseRecoveryPage />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
