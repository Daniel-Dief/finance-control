import { Route, Routes } from "react-router-dom";

import AreasPage from "@/pages/areas";
import BudgetsPage from "@/pages/budgets";
import IndexPage from "@/pages/index";
import LoginPage from "@/pages/login";
import CategoriesPage from "./pages/categories";

function App() {
  return (
    <Routes>
      <Route element={<LoginPage />} path="/login" />
      <Route element={<AreasPage />} path="/areas" />
      <Route element={<CategoriesPage />} path="/categories" />
      <Route element={<BudgetsPage />} path="/budgets" />
      <Route element={<IndexPage />} path="/" />
    </Routes>
  );
}

export default App;
