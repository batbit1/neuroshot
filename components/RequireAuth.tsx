"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/mock-auth";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center text-slate-600">
        Перенаправляем на вход…
      </div>
    );
  }

  return <>{children}</>;
}
