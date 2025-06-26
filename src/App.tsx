import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AmazonLanding from "./pages/AmazonLanding";
import AmazonAuth from "./pages/AmazonAuth";
import AmazonAnalysis from "./pages/AmazonAnalysis";
import UXConsultant from "./pages/UXConsultant";
import Index from "./pages/Index";
import Analysis from "./pages/Analysis";
import Subscription from "./pages/Subscription";
import VectorTest from "./pages/VectorTest";
import NotFound from "./pages/NotFound";

// Import Amazon design system
import "./styles/amazon-design-system.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            {/* New Amazon-inspired pages */}
            <Route path="/" element={<AmazonLanding />} />
            <Route path="/auth" element={<AmazonAuth />} />
            <Route path="/analysis" element={<AmazonAnalysis />} />
            <Route path="/consultant" element={<UXConsultant />} />
            
            {/* Keep existing pages for backward compatibility */}
            <Route path="/landing" element={<AmazonLanding />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/old-analysis" element={<Analysis />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/vector-test" element={<VectorTest />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
