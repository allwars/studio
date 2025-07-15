'use client';

import PhotoAnalysis from '@/components/photo-analysis';
import { handleAnalyzeMealImage } from './actions';
import { useDictionary } from '@/hooks/use-dictionary';
import { UtensilsIcon } from '@/components/icons';

export default function MealAnalysisPage() {
  const dict = useDictionary();

  if (!dict) return null;

  const onAnalyze = (photoDataUri: string) => {
    return handleAnalyzeMealImage(photoDataUri, dict.lang);
  }

  return (
    <PhotoAnalysis
      title={dict.mealAnalysis.title}
      description={dict.mealAnalysis.description}
      onAnalyze={onAnalyze}
      loadingIcon={<UtensilsIcon className="h-8 w-8 text-primary" />}
      loadingText={dict.photoAnalysis.analyzingButton}
    />
  );
}
