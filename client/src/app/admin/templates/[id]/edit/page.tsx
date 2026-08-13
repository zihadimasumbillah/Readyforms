"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function AdminEditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      router.replace(`/templates/${id}/edit`);
    }
  }, [id, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
        <p className="text-sm text-muted-foreground font-medium">Opening template editor...</p>
      </div>
    </div>
  );
}