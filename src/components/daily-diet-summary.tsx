'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useDictionary } from '@/hooks/use-dictionary';
import { BrainCircuit } from 'lucide-react';
import { handleGenerateDailyDietAdvice } from '@/app/dashboard/diet/actions';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';

interface DailyDietSummaryProps {
  loggedMeals: string[];
}

const getScoreColor = (score: number) => {
    if (score <= 30) return 'bg-red-500';
    if (score <= 60) return 'bg-orange-500';
    return 'bg-green-500';
}

export default function DailyDietSummary({ loggedMeals }: DailyDietSummaryProps) {
  const dict = useDictionary();
  const [advice, setAdvice] = useState<string | null>(null);
  const [dailyScore, setDailyScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const dateLocales: { [key: string]: Locale } = {
    en: enUS,
    es: es,
  };

  useEffect(() => {
    const fetchAdvice = async () => {
      if (!dict) return;
      setIsLoading(true);
      const goal = localStorage.getItem('fitnessGoal') || dict.dashboard.goals.maintain_fitness.title;
      const result = await handleGenerateDailyDietAdvice({ loggedMeals, goal, language: dict.lang });
      if ('error' in result) {
        setAdvice(result.error);
        setDailyScore(0);
      } else {
        setAdvice(result.advice);
        setDailyScore(result.dailyScore);
      }
      setIsLoading(false);
    };

    fetchAdvice();
  }, [loggedMeals, dict]);

  if (!dict) return null;

  const formattedDate = useMemo(() => {
    return format(new Date(), "eeee, d 'de' MMMM", {
      locale: dateLocales[dict.lang] || enUS,
    });
  }, [dict.lang]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
                <BrainCircuit /> {dict.dietPlan.dailySummary.title}
            </span>
            <span className="text-sm font-normal text-muted-foreground capitalize">{formattedDate}</span>
        </CardTitle>
        <CardDescription>{dict.dietPlan.dailySummary.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>{dict.dietPlan.dailySummary.overallScore}</Label>
          <div className="flex items-center gap-4 mt-1">
            {isLoading ? (
              <Skeleton className="h-6 w-full" />
            ) : (
              <>
                <Progress value={dailyScore} className="w-full" />
                <span className={cn("text-lg font-bold text-white px-3 py-1 rounded-md", getScoreColor(dailyScore))}>
                  {dailyScore}/100
                </span>
              </>
            )}
          </div>
        </div>
        <div>
          <Label>{dict.dietPlan.dailySummary.aiTips}</Label>
          {isLoading ? (
            <div className="space-y-2 mt-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-1 bg-secondary p-3 rounded-md">{advice}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
