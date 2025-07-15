import PhotoAnalysis from '@/components/photo-analysis';
import { handleAnalyzeMealImage } from './actions';

export default function MealAnalysisPage() {
  return (
    <PhotoAnalysis
      title="Meal Photo Analysis"
      description="Take a picture of your meal and our AI will provide a nutritional breakdown."
      onAnalyze={handleAnalyzeMealImage}
    />
  );
}
