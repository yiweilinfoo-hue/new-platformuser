import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { ProjectDetail } from "./pages/ProjectDetail";
import { ClaimDetail } from "./pages/ClaimDetail";
import { StrategyLibrary } from "./pages/StrategyLibrary";
import { ViewProvider } from "./contexts/ViewContext";

export default function App() {
  return (
    <Router>
      <ViewProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/project/:regionCode" element={<ProjectDetail />} />
            <Route path="/claims/:regionCode" element={<ClaimDetail />} />
            <Route path="/strategies" element={<StrategyLibrary />} />
          </Routes>
        </Layout>
      </ViewProvider>
    </Router>
  );
}
