import { Navigate, Route, Routes } from "react-router-dom";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import { appRoutes } from "@/router";

export default function App() {
  return (
    <Routes>
      {appRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          // 라우트마다 별도 경계 — 한 화면의 렌더 예외가 다른 화면으로 번지지 않는다.
          element={<AppErrorBoundary>{route.element}</AppErrorBoundary>}
        />
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
