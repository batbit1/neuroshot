"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/mock-auth";
import { isOwnerEmail } from "@/lib/owner";

export function RequireOwner({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/login");
    else if (!isOwnerEmail(user.email)) router.replace("/gallery");
  }, [user, router]);

  if (!user || !isOwnerEmail(user.email)) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center text-slate-600">
        Проверка доступа…
      </div>
    );
  }

  return <>{children}</>;
}
