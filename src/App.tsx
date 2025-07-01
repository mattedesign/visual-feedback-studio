
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import AnalysisResults from "./pages/AnalysisResults";
import KnowledgeBasePopulation from "./pages/KnowledgeBasePopulation";
import KnowledgeBaseManagerPage from "./pages/KnowledgeBaseManager";
import { ModularAnalysisInterface } from "./components/analysis/modules/ModularAnalysisInterface";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/analysis/:id" element={<AnalysisResults />} />
            <Route path="/analysis/:id/modular" element={<ModularAnalysisInterface />} />
            <Route path="/knowledge-population" element={<KnowledgeBasePopulation />} />
            <Route path="/knowledge-manager" element={<KnowledgeBaseManagerPage />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
