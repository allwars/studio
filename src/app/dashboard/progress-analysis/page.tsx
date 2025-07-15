'use client';

import PhotoAnalysis from '@/components/photo-analysis';
import { handleAnalyzeBodyProgress } from './actions';
import { useDictionary } from '@/hooks/use-dictionary';

export default function ProgressAnalysisPage() {
  const dict = useDictionary();
  if (!dict) return null;

  return (
    <PhotoAnalysis
      title={dict.progressAnalysis.title}
      description={dict.progressAnalysis.description}
      onAnalyze={handleAnalyzeBodyProgress}
    />
  );
}
