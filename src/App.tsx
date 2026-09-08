import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AppLayout } from "./components/layout/AppLayout";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import SearchPage from "./pages/Search";
import Watchlist from "./pages/Watchlist";
import About from "./pages/About";
import AnimeDetail from "./pages/AnimeDetail";
import CharacterDetail from "./pages/CharacterDetail";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AppLayout>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/about" element={<About />} />
        <Route path="/anime/:id" element={<AnimeDetail />} />
        <Route path="/character/:id" element={<CharacterDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="bottom-right" theme="dark" richColors />
    </AppLayout>
  );
}
