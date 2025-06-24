
import Index from "./pages/Index";
import Analysis from "./pages/Analysis";
import Auth from "./pages/Auth";
import VectorTest from "./pages/VectorTest";

export const navItems = [
  {
    to: "/",
    page: <Index />,
  },
  {
    to: "/analysis",
    page: <Analysis />,
  },
  {
    to: "/auth",
    page: <Auth />,
  },
  {
    to: "/vector-test",
    page: <VectorTest />,
  },
];
