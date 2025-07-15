
'use client';

import PhotoAnalysis from '@/components/photo-analysis';
import { handleAnalyzeBodyProgress, handleGetSuggestedGoal } from './actions';
import { useDictionary } from '@/hooks/use-dictionary';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Target, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import LoadingSpinner from '@/components/loading-spinner';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function ProgressAnalysisPage() {
  const dict = useDictionary();
  const router = useRouter();
  const { toast } = useToast();
  const [suggestion, setSuggestion] = useState<{ title: string; description: string } | null>(null);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);

  if (!dict) return null;

  const onAnalyze = async (photoDataUri: string) => {
    setIsLoadingSuggestion(true);
    setSuggestion(null);
    
    // First, run the body analysis
    const analysisResult = await handleAnalyzeBodyProgress(photoDataUri, dict.lang);
    
    if (analysisResult.analysis) {
        // If analysis is successful, get a goal suggestion
        const goalSuggestion = await handleGetSuggestedGoal(analysisResult.analysis, dict.lang);
        if (goalSuggestion && !('error' in goalSuggestion)) {
            setSuggestion(goalSuggestion);
        }
    }
    
    setIsLoadingSuggestion(false);
    return analysisResult;
  }

  const handleSetGoalAndNavigate = async () => {
    if (!suggestion) return;
    setIsSavingGoal(true);
    
    try {
        // Since handleSetGoal is a server action now, we just update localStorage on the client
        localStorage.setItem('fitnessGoal', suggestion.title);
        toast({
            title: dict.progressAnalysis.goalSetSuccessTitle,
            description: dict.progressAnalysis.goalSetSuccessDescription,
        });
        router.push(`/${dict.lang}/dashboard`);

    } catch(error) {
         toast({
            variant: "destructive",
            title: dict.photoAnalysis.errorTitle,
            description: error instanceof Error ? error.message : dict.photoAnalysis.unexpectedError,
        });
    }


    setIsSavingGoal(false);
  };


  return (
    <div className="space-y-6">
      <PhotoAnalysis
        title={dict.progressAnalysis.title}
        description={dict.progressAnalysis.description}
        onAnalyze={onAnalyze}
      />

      {(isLoadingSuggestion || suggestion) && (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="text-yellow-400" />
                    {dict.progressAnalysis.suggestedGoalTitle}
                </CardTitle>
                <CardDescription>
                    {dict.progressAnalysis.suggestedGoalDescription}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoadingSuggestion ? (
                    <div className="flex justify-center items-center h-24">
                       <LoadingSpinner />
                    </div>
                ) : suggestion && (
                    <div className="bg-secondary p-4 rounded-lg">
                        <h3 className="font-bold text-lg text-secondary-foreground flex items-center gap-2">
                            <Target /> {suggestion.title}
                        </h3>
                        <p className="text-muted-foreground mt-1">{suggestion.description}</p>
                        <Button className="mt-4" onClick={handleSetGoalAndNavigate} disabled={isSavingGoal}>
                            {isSavingGoal ? <LoadingSpinner /> : dict.progressAnalysis.setAsGoalButton}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
      )}

    </div>
  );
}
