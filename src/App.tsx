import {Toaster as Sonner} from "@/components/ui/sonner";
import {TooltipProvider} from "@/components/ui/tooltip";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Home from "./pages/Home";
import MealRecord from "./pages/MealRecord";
import MealDetail from "./pages/MealDetail";
import RecordCalendar from "./pages/RecordCalendar";
import FoodSearch from "./pages/FoodSearch";
import Challenge from "./pages/Challenge";
import Community from "./pages/Community";
import Login from "./pages/Login";
import MemberInfo from "./pages/MemberInfo";
import MyPage from "./pages/MyPage";
import GroupPage from "./pages/GroupPage";
import Navigation from "./components/layout/Navigation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner richColors position={"top-right"} closeButton />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/meal" element={<MealRecord />} />
          <Route path="/meal-record" element={<MealRecord />} />
          <Route path="/meal-detail/:mealType" element={<MealDetail />} />
          <Route path="/record/calendar" element={<RecordCalendar />} />
          <Route path="/food-search" element={<FoodSearch />} />
          <Route path="/challenge" element={<Challenge />} />
          <Route path="/community" element={<Community />} />
          <Route path="/login" element={<Login />} />
          <Route path="/member-info" element={<MemberInfo />} />
          <Route path="/teams" element={<GroupPage />} />
          <Route path="/profile" element={<MyPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
