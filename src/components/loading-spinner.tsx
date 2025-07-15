'use client';

import { DumbbellIcon } from "@/components/icons";
import { useDictionary } from "@/hooks/use-dictionary";
import type { ReactNode } from "react";

interface LoadingSpinnerProps {
    icon?: ReactNode;
    text?: string;
}

export default function LoadingSpinner({ icon, text }: LoadingSpinnerProps) {
  const dict = useDictionary();
  const defaultText = dict?.photoAnalysis.loading || "Loading...";

  return (
    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
      {icon || <DumbbellIcon className="h-8 w-8 text-primary" />}
      <span>{text || defaultText}</span>
    </div>
  );
}
