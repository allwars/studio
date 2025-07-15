'use client';

import { DumbbellIcon } from "@/components/icons";

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
      <DumbbellIcon className="h-8 w-8 text-primary" />
      <span>Cargando...</span>
    </div>
  );
}