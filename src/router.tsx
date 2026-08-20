import type { ReactElement } from "react";
import HomePage from "@/pages/HomePage";
import RecordsPage from "@/pages/RecordsPage";
import ReportPage from "@/pages/ReportPage";
import SettingsPage from "@/pages/SettingsPage";

export type AppRoute = {
  path: string;
  element: ReactElement;
};

/** 앱의 모든 라우트 — navigate() 대상 경로는 반드시 여기에 있어야 한다. */
export const appRoutes: AppRoute[] = [
  { path: "/", element: <HomePage /> },
  { path: "/records", element: <RecordsPage /> },
  { path: "/report", element: <ReportPage /> },
  { path: "/settings", element: <SettingsPage /> },
];
