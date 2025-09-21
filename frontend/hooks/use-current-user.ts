"use client";

import { useEffect, useState } from "react";

export type CurrentUser = { id: number; email: string; role: "patient" | "doctor" } | null;

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("medsplit:user");
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const save = (u: CurrentUser) => {
    setUser(u);
    try {
      if (u) localStorage.setItem("medsplit:user", JSON.stringify(u));
      else localStorage.removeItem("medsplit:user");
    } catch {}
  };

  return { user, setUser: save };
}
