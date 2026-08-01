import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { IntroPage } from "@/features/assessment/pages/IntroPage";
import { AssessmentFlowPage } from "@/features/assessment/pages/AssessmentFlowPage";
import { ConfirmationPage } from "@/features/assessment/pages/ConfirmationPage";
import { RequireAdmin } from "@/features/admin/components/RequireAdmin";

// L'espace admin (et le generateur de rapport PDF qu'il declenche) n'est jamais necessaire au
// candidat : le charger paresseusement garde le bundle initial leger sur mobile (mission §3.4,
// §17). Voir docs/DEPLOYMENT.md pour le budget de taille de bundle.
const AdminLoginPage = lazy(() =>
  import("@/features/admin/pages/AdminLoginPage").then((m) => ({ default: m.AdminLoginPage }))
);
const AdminDashboardPage = lazy(() =>
  import("@/features/admin/pages/AdminDashboardPage").then((m) => ({
    default: m.AdminDashboardPage
  }))
);
const AdminSubmissionDetailPage = lazy(() =>
  import("@/features/admin/pages/AdminSubmissionDetailPage").then((m) => ({
    default: m.AdminSubmissionDetailPage
  }))
);

function AdminFallback() {
  return (
    <div className="app admin-loading" role="status">
      Chargement...
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<IntroPage />} />
      <Route path="/test" element={<AssessmentFlowPage />} />
      <Route path="/confirmation" element={<ConfirmationPage />} />

      <Route
        path="/admin"
        element={
          <Suspense fallback={<AdminFallback />}>
            <AdminLoginPage />
          </Suspense>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <Suspense fallback={<AdminFallback />}>
            <RequireAdmin>
              <AdminDashboardPage />
            </RequireAdmin>
          </Suspense>
        }
      />
      <Route
        path="/admin/submissions/:submissionId"
        element={
          <Suspense fallback={<AdminFallback />}>
            <RequireAdmin>
              <AdminSubmissionDetailPage />
            </RequireAdmin>
          </Suspense>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
