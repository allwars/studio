'use client';

import PhotoAnalysis from '@/components/photo-analysis';
import { handleAnalyzeBodyProgress } from './actions';
import { useDictionary } from '@/hooks/use-dictionary';

export default function ProgressAnalysisPage() {
  const dict = useDictionary();
  if (!dict) return null;

  const onAnalyze = (photoDataUri: string) => {
    return handleAnalyzeBodyProgress(photoDataUri, dict.lang);
  }

  return (
    <PhotoAnalysis
      title={dict.progressAnalysis.title}
      description={dict.progressAnalysis.description}
      onAnalyze={onAnalyze}
    />
  );
}
