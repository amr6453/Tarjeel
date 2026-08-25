"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LoadingSkeleton } from "@/components/ui/StateFeedback";

export default function AdminRedirectPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/dashboard");
      } else {
        router.replace("/login?redirect=/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-8 bg-[#FAF8F5]">
      <div className="w-full max-w-md space-y-4">
        <LoadingSkeleton count={3} />
      </div>
    </div>
  );
}
