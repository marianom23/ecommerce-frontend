"use client";
import { useEffect, useState } from "react";
import { authService } from "@/services/authService";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await authService.me();
        console.log(res);
        setUser(res);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
}
