import { useCallback, useState } from "react";
import type { Settings } from "@/lib/types";
import { getSettings, setSettings as saveSettings } from "@/lib/storage";

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(() => getSettings());

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...patch };
      return saveSettings(patch) ? next : prev;
    });
  }, []);

  return { settings, updateSettings };
}
