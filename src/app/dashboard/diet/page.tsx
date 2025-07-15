
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDictionary } from '@/hooks/use-dictionary';
import Image from 'next/image';
import { handleGenerateMealSuggestion } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import type { MealSuggestionOutput, MealType } from '@/ai/flows/generate-meal-suggestion-flow';
import { AlertCircle, Utensils, Lightbulb, CheckCircle, Loader2, PencilLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type MealState = {
  suggestion: MealSuggestionOutput | null;
  isLogged: boolean;
  isLoading: boolean;
  error: string | null;
};

type DailyMeals = {
  [K in MealType as Lowercase<K>]: MealState;
};

const mealTypes: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const isMealVisible = (mealType: MealType): boolean => {
    const hour = new Date().getHours();
    switch(mealType) {
        case 'Breakfast':
            return hour < 12; // Visible until noon
        case 'Lunch':
            return hour >= 10 && hour < 17; // Visible from 10 AM to 5 PM
        case 'Dinner':
            return hour >= 16; // Visible from 4 PM onwards
        case 'Snack':
            return true; // Always visible
        default:
            return true;
    }
}


export default function DietPage() {
  const dict = useDictionary();
  const { toast } = useToast();

  const [meals, setMeals] = useState<DailyMeals>({
    breakfast: { suggestion: null, isLogged: false, isLoading: false, error: null },
    lunch: { suggestion: null, isLogged: false, isLoading: false, error: null },
    dinner: { suggestion: null, isLogged: false, isLoading: false, error: null },
    snack: { suggestion: null, isLogged: false, isLoading: false, error: null },
  });
  
  const [pantryItems, setPantryItems] = useState<string[]>([]);
  const [isPantryLoading, setIsPantryLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // This timer updates the current time every minute to re-evaluate which meal cards should be visible.
    const timerId = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    // Load pantry items from localStorage
    const storedPantry = localStorage.getItem('pantryItems');
    const items = storedPantry ? JSON.parse(storedPantry).map((i: any) => i.name) : [];
    setPantryItems(items);
    setIsPantryLoading(false);
  }, []);

  if (!dict) return null;

  const handleSuggestMeal = async (mealType: MealType) => {
    const mealKey = mealType.toLowerCase() as Lowercase<MealType>;

    setMeals(prev => ({
      ...prev,
      [mealKey]: { ...prev[mealKey], isLoading: true, error: null },
    }));

    const storedGoal = localStorage.getItem('fitnessGoal') || dict.dashboard.goals.maintain_fitness.title;
    const previousMeals = Object.values(meals)
        .filter(m => m.isLogged && m.suggestion)
        .map(m => m.suggestion!.title);

    const result = await handleGenerateMealSuggestion({
      mealType,
      goal: storedGoal,
      language: dict.lang,
      pantryItems,
      previousMeals,
    });
    
    if ('error' in result) {
      setMeals(prev => ({
        ...prev,
        [mealKey]: { ...prev[mealKey], isLoading: false, error: result.error },
      }));
    } else {
      setMeals(prev => ({
        ...prev,
        [mealKey]: { ...prev[mealKey], isLoading: false, suggestion: result },
      }));
    }
  };

  const handleLogMeal = (mealType: MealType) => {
    const mealKey = mealType.toLowerCase() as Lowercase<MealType>;
    setMeals(prev => ({
      ...prev,
      [mealKey]: { ...prev[mealKey], isLogged: true },
    }));
    toast({
        title: dict.dietPlan.mealLoggedTitle,
        description: `${dict.dietPlan.mealType[mealKey]} ${dict.dietPlan.mealLoggedDescription}`,
    });
  };

  const handleManualLog = (mealType: MealType, data: { title: string; description: string }) => {
    const mealKey = mealType.toLowerCase() as Lowercase<MealType>;
    const manualSuggestion: MealSuggestionOutput = {
      title: data.title,
      description: data.description,
      dataAiHint: data.title.split(' ').slice(0, 2).join(' '),
    };

    setMeals(prev => ({
      ...prev,
      [mealKey]: {
        suggestion: manualSuggestion,
        isLogged: true,
        isLoading: false,
        error: null
      },
    }));

    toast({
        title: dict.dietPlan.mealLoggedTitle,
        description: `${data.title} ${dict.dietPlan.mealLoggedDescription}`,
    });
  };

  const ManualLogDialog = ({ mealType }: { mealType: MealType }) => {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleManualLog(mealType, { title, description });
      setOpen(false);
      setTitle('');
      setDescription('');
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <PencilLine className="mr-2" />
            {dict.dietPlan.logManually}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{dict.dietPlan.manualLogTitle} {dict.dietPlan.mealType[mealType.toLowerCase() as Lowercase<MealType>]}</DialogTitle>
              <DialogDescription>{dict.dietPlan.manualLogDescription}</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meal-title">{dict.dietPlan.manualLogMealName}</Label>
                <Input id="meal-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={dict.dietPlan.manualLogPlaceholder} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meal-description">{dict.dietPlan.manualLogMealDescription}</Label>
                <Textarea id="meal-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={dict.dietPlan.manualLogDescriptionPlaceholder} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{dict.dietPlan.logMeal}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };


  const renderMealCard = (mealType: MealType) => {
    const mealKey = mealType.toLowerCase() as Lowercase<MealType>;
    const mealState = meals[mealKey];
    
    // Hide future meals that are not logged and have no suggestion yet
    if (!isMealVisible(mealType) && !mealState.isLogged && !mealState.suggestion) {
        return null;
    }

    if (mealState.isLoading) {
       return (
         <Card className="h-[380px] flex flex-col">
            <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
         </Card>
       )
    }
    
    if (mealState.suggestion) {
       return (
        <Card className={cn("flex flex-col h-[380px]", mealState.isLogged && "border-green-500")}>
            <CardHeader className="relative p-0">
              {mealState.isLogged && (
                <div className="absolute top-2 right-2 z-10 bg-green-500 text-white rounded-full p-2 flex items-center gap-1 text-xs">
                    <CheckCircle size={14} />
                    <span>{dict.dietPlan.logged}</span>
                </div>
              )}
              <Image
                src="https://placehold.co/600x400.png"
                alt={mealState.suggestion.title}
                width={600}
                height={400}
                className="w-full h-40 object-cover rounded-t-lg"
                data-ai-hint={mealState.suggestion.dataAiHint}
              />
            </CardHeader>
            <CardContent className="p-4 flex-grow flex flex-col">
              <CardTitle className="mt-1 text-2xl font-headline">{mealState.suggestion.title}</CardTitle>
              <p className="mt-2 text-muted-foreground flex-grow">{mealState.suggestion.description}</p>
            </CardContent>
             <CardFooter>
               {!mealState.isLogged && (
                 <Button className="w-full" onClick={() => handleLogMeal(mealType)}>
                    {dict.dietPlan.logMeal}
                </Button>
               )}
            </CardFooter>
          </Card>
       )
    }

    return (
        <Card className={cn("flex flex-col justify-between h-[380px]")}>
            <CardHeader>
                <CardTitle>{dict.dietPlan.mealType[mealKey]}</CardTitle>
                <CardDescription>{dict.dietPlan.getSuggestion}</CardDescription>
            </CardHeader>
            <CardContent>
                {mealState.error && (
                    <Alert variant="destructive" className="text-xs">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{dict.photoAnalysis.errorTitle}</AlertTitle>
                        <AlertDescription>{mealState.error}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
            <CardFooter className="flex-col gap-2">
                 <Button className="w-full" onClick={() => handleSuggestMeal(mealType)} disabled={pantryItems.length === 0}>
                    <Lightbulb className="mr-2" />
                    {dict.dietPlan.suggestMeal}
                </Button>
                <ManualLogDialog mealType={mealType} />
            </CardFooter>
        </Card>
    );
  };
  
  if (isPantryLoading) {
    return <Skeleton className="h-64 w-full" />;
  }
  
  if(pantryItems.length === 0) {
     return (
        <Alert variant="default" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{dict.dietPlan.pantryEmptyTitle}</AlertTitle>
            <AlertDescription>
                {dict.dietPlan.pantryEmptyDescription}
                <Button asChild className="mt-4">
                    <Link href={`/${dict.lang}/dashboard/pantry`}>{dict.dietPlan.goToPantry}</Link>
                </Button>
            </AlertDescription>
        </Alert>
     )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <Utensils />
          {dict.dietPlan.title}
        </h1>
        <p className="text-muted-foreground">{dict.dietPlan.description}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
         {mealTypes.map(type => {
            const renderedCard = renderMealCard(type);
            return renderedCard ? <div key={type}>{renderedCard}</div> : null;
         })}
      </div>
    </div>
  );
}
