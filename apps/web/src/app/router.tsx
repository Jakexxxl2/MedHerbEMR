import { Route, Routes, Navigate } from "react-router-dom";
import { MainLayout } from "./layout/MainLayout.tsx";
import { PatientsListPage } from "../features/patients/pages/PatientsListPage.tsx";
import { VisitsListPage } from "../features/visits/pages/VisitsListPage.tsx";
import { CreatePage } from "../features/editor/pages/CreatePage.tsx";
import { AnalyticsDashboardPage } from "../features/analytics/pages/AnalyticsDashboardPage.tsx";

export function AppRouter() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/patients" element={<PatientsListPage />} />
        <Route path="/visits" element={<VisitsListPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/analytics" element={<AnalyticsDashboardPage />} />
      </Routes>
    </MainLayout>
  );
}


