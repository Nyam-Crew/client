import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Home from "./pages/Home";
import MealRecord from "./pages/MealRecord";
import Challenge from "./pages/Challenge";
import Community from "./pages/Community";
import Login from "./pages/Login";
import MemberInfo from "./pages/MemberInfo";
import Navigation from "./components/layout/Navigation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/meal" element={<MealRecord />} />
          <Route path="/challenge" element={<Challenge />} />
          <Route path="/community" element={<Community />} />
          <Route path="/login" element={<Login />} />
          <Route path="/member-info" element={<MemberInfo />} />
          <Route path="/chat" element={<Index />} />
          <Route path="/calendar" element={<Index />} />
          <Route path="/profile" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
