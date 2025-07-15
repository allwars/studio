import PhotoAnalysis from '@/components/photo-analysis';
import { handleAnalyzeBodyProgress } from './actions';

export default function ProgressAnalysisPage() {
  return (
    <PhotoAnalysis
      title="Body Progress Analysis"
      description="Upload a photo to track your fitness journey. Our AI will analyze changes and provide feedback."
      onAnalyze={handleAnalyzeBodyProgress}
    />
  );
}
