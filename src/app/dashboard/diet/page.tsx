'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDictionary } from '@/hooks/use-dictionary';
import Image from 'next/image';
import { handleGenerateDietPlan } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import type { DietPlanOutput } from '@/ai/flows/generate-diet-plan-flow';
import { AlertCircle, Utensils, ShoppingBasket } from 'lucide-react';

export default function DietPage() {
  const dict = useDictionary();
  const [dietPlan, setDietPlan] = useState<DietPlanOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dict) {
      const fetchDietPlan = async () => {
        setIsLoading(true);
        setError(null);

        // In a real app, goal and last workout would be fetched from user data.
        // Pantry items would be fetched from a database.
        const storedPantry = localStorage.getItem('pantryItems');
        const pantryItems = storedPantry ? JSON.parse(storedPantry) : [];
        const storedGoal = localStorage.getItem('fitnessGoal');
        const goal = storedGoal || dict.dashboard.goals.maintain_fitness.title;
        const lastWorkout = localStorage.getItem('lastWorkoutFeedback');

        if (pantryItems.length === 0) {
          setError(dict.dietPlan.noIngredientsError);
          setIsLoading(false);
          setDietPlan(null);
          return;
        }

        const result = await handleGenerateDietPlan({
          goal,
          language: dict.lang,
          pantryItems,
          lastWorkout: lastWorkout || undefined,
        });

        if (result.error) {
          setError(result.error);
        } else {
          setDietPlan(result);
        }
        setIsLoading(false);
      };

      fetchDietPlan();
    }
  }, [dict]);

  if (!dict) return null;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-48 w-full" />
              </CardHeader>
              <CardContent className="p-6">
                <Skeleton className="h-5 w-1/4 mb-2" />
                <Skeleton className="h-8 w-3/4 mb-3" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
    
    if (error) {
       return (
          <Alert variant={error === dict.dietPlan.noIngredientsError ? "default" : "destructive"} className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{dict.photoAnalysis.errorTitle}</AlertTitle>
            <AlertDescription>
                {error}
                {error === dict.dietPlan.noIngredientsError && (
                    <Button asChild className="mt-4">
                        <Link href={`/${dict.lang}/dashboard/pantry`}>{dict.dietPlan.goToPantry}</Link>
                    </Button>
                )}
            </AlertDescription>
          </Alert>
       )
    }

    if (!dietPlan || dietPlan.meals.length === 0) {
      return <p>{dict.dietPlan.noPlanGenerated}</p>;
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {dietPlan.meals.map((item, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="p-0">
              <Image
                src="https://placehold.co/600x400.png"
                alt={item.title}
                width={600}
                height={400}
                className="w-full h-48 object-cover"
                data-ai-hint={item.dataAiHint}
              />
            </CardHeader>
            <CardContent className="p-6">
              <CardDescription className="font-semibold text-primary">{item.meal}</CardDescription>
              <CardTitle className="mt-1 text-2xl font-headline">{item.title}</CardTitle>
              <p className="mt-2 text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <Utensils />
          {dict.dietPlan.title}
        </h1>
        <p className="text-muted-foreground">{dietPlan?.description || dict.dietPlan.description}</p>
      </div>
      {renderContent()}
    </div>
  );
}
