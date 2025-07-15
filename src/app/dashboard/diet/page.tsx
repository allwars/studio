
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDictionary } from '@/hooks/use-dictionary';
import { handleGenerateMealSuggestion } from './actions';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import type { MealSuggestionOutput, MealType } from '@/ai/flows/generate-meal-suggestion-flow';
import { AlertCircle, Utensils, Lightbulb, CheckCircle, PencilLine } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import DailyDietSummary from '@/components/daily-diet-summary';
import type { ActivityLog, LoggedMealItem } from '@/lib/types';
import LoadingSpinner from '@/components/loading-spinner';
import { UtensilsIcon } from '@/components/icons';


type LoggedMeal = {
  id: string;
  suggestion: MealSuggestionOutput;
  mealType: MealType;
};

type MealCategoryState = {
  loggedMeals: LoggedMeal[];
  isLoading: boolean;
  error: string | null;
};

type DailyMeals = {
  [K in MealType as Lowercase<K>]: MealCategoryState;
};

const mealTypes: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const nonRepeatableMealTypes: MealType[] = ['Breakfast', 'Lunch', 'Dinner'];


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
    breakfast: { loggedMeals: [], isLoading: false, error: null },
    lunch: { loggedMeals: [], isLoading: false, error: null },
    dinner: { loggedMeals: [], isLoading: false, error: null },
    snack: { loggedMeals: [], isLoading: false, error: null },
  });
  
  const [pantryItems, setPantryItems] = useState<string[]>([]);
  const [isPantryLoading, setIsPantryLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const allLoggedMeals = useMemo(() => {
    return Object.values(meals).flatMap(m => m.loggedMeals);
  }, [meals]);

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

  const saveToLog = (mealType: MealType, suggestion: MealSuggestionOutput) => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const storedLog = localStorage.getItem('activityLog');
    const activityLog: ActivityLog = storedLog ? JSON.parse(storedLog) : [];

    let todayLog = activityLog.find(day => day.date === today);

    const newMealLog: LoggedMealItem = {
        id: crypto.randomUUID(),
        mealType: mealType,
        title: suggestion.title,
        description: suggestion.description || '',
    };
    
    if (todayLog) {
        todayLog.meals.push(newMealLog);
    } else {
        activityLog.push({
            date: today,
            meals: [newMealLog],
            workouts: [],
        });
    }

    localStorage.setItem('activityLog', JSON.stringify(activityLog));
  }

  const logMeal = (mealType: MealType, suggestion: MealSuggestionOutput) => {
    const mealKey = mealType.toLowerCase() as Lowercase<MealType>;
    const newMeal: LoggedMeal = { id: crypto.randomUUID(), suggestion, mealType };
    
    setMeals(prev => ({
      ...prev,
      [mealKey]: {
        ...prev[mealKey],
        loggedMeals: [...prev[mealKey].loggedMeals, newMeal],
        isLoading: false, // Ensure loading is stopped
        error: null,
      },
    }));

    saveToLog(mealType, suggestion);

    toast({
        title: dict.dietPlan.mealLoggedTitle,
        description: `${suggestion.title} ${dict.dietPlan.mealLoggedDescription}`,
    });
  }

  const handleSuggestMeal = async (mealType: MealType) => {
    const mealKey = mealType.toLowerCase() as Lowercase<MealType>;

    setMeals(prev => ({
      ...prev,
      [mealKey]: { ...prev[mealKey], isLoading: true, error: null },
    }));

    const storedGoal = localStorage.getItem('fitnessGoal') || dict.dashboard.goals.maintain_fitness.title;
    
    const result = await handleGenerateMealSuggestion({
      mealType,
      goal: storedGoal,
      language: dict.lang,
      pantryItems,
      previousMeals: allLoggedMeals.map(m => m.suggestion.title),
    });
    
    if ('error' in result) {
      setMeals(prev => ({
        ...prev,
        [mealKey]: { ...prev[mealKey], isLoading: false, error: result.error },
      }));
    } else {
      // Instead of replacing, we now log the new suggestion immediately.
      logMeal(mealType, result);
    }
  };

  const handleManualLog = (mealType: MealType, data: { title: string; description: string }) => {
    const manualSuggestion: MealSuggestionOutput = {
      title: data.title,
      description: data.description,
      dataAiHint: data.title.split(' ').slice(0, 2).join(' '),
    };
    logMeal(mealType, manualSuggestion);
  };

  const ManualLogDialog = ({ mealType, isMealLogged }: { mealType: MealType, isMealLogged: boolean }) => {
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
          <Button variant="outline" className="w-full" disabled={isMealLogged}>
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

    const isNonRepeatableAndLogged = nonRepeatableMealTypes.includes(mealType) && mealState.loggedMeals.length > 0;
    
    if (!isMealVisible(mealType) && mealState.loggedMeals.length === 0) {
        return null;
    }
    
    return (
        <Card className="flex flex-col h-full min-h-[380px]">
            <CardHeader>
                <CardTitle>{dict.dietPlan.mealType[mealKey]}</CardTitle>
                <CardDescription>
                  {isNonRepeatableAndLogged ? dict.dietPlan.mealAlreadyLogged : dict.dietPlan.getSuggestion}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              {mealState.isLoading && (
                 <div className="flex items-center justify-center p-4">
                    <LoadingSpinner icon={<UtensilsIcon className="h-8 w-8 text-primary" />} text={dict.photoAnalysis.analyzingButton} />
                 </div>
              )}
               {mealState.error && (
                    <Alert variant="destructive" className="text-xs">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{dict.photoAnalysis.errorTitle}</AlertTitle>
                        <AlertDescription>{mealState.error}</AlertDescription>
                    </Alert>
                )}
              {mealState.loggedMeals.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground">{dict.dietPlan.loggedMeals}</h4>
                  {mealState.loggedMeals.map(meal => (
                    <div key={meal.id} className="bg-secondary p-3 rounded-md">
                        <p className="font-bold text-secondary-foreground flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-600" />
                          {meal.suggestion.title}
                        </p>
                       {meal.suggestion.description && <p className="text-xs text-muted-foreground mt-1">{meal.suggestion.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col gap-2 mt-auto">
                 <Button className="w-full" onClick={() => handleSuggestMeal(mealType)} disabled={pantryItems.length === 0 || mealState.isLoading || isNonRepeatableAndLogged}>
                    {mealState.isLoading ? (
                      <LoadingSpinner icon={<UtensilsIcon className="h-4 w-4" />} />
                    ) : (
                      <>
                        <Lightbulb className="mr-2" />
                        {dict.dietPlan.suggestMeal}
                      </>
                    )}
                </Button>
                <ManualLogDialog mealType={mealType} isMealLogged={isNonRepeatableAndLogged} />
            </CardFooter>
        </Card>
    );
  };
  
  if (isPantryLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner icon={<UtensilsIcon className="h-10 w-10" />} text={dict.photoAnalysis.loading} />
      </div>
    );
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

      <DailyDietSummary loggedMeals={allLoggedMeals.map(m => m.suggestion.title)} />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
         {mealTypes.map(type => {
            const renderedCard = renderMealCard(type);
            return renderedCard ? <div key={type}>{renderedCard}</div> : null;
         })}
      </div>
    </div>
  );
}
