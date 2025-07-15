
'use client';

import { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Timer from '@/components/timer';
import { CheckCircle, Heart, Flame, Bike, Zap, StretchHorizontal, Pencil, Target, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useDictionary } from '@/hooks/use-dictionary';
import { handleGenerateWorkout } from './actions';
import type { GenerateWorkoutOutput } from '@/ai/flows/generate-workout-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function DashboardPage() {
  const dict = useDictionary();
  const [goal, setGoal] = useState<string>('');
  const [workout, setWorkout] = useState<GenerateWorkoutOutput | null>(null);
  const [isLoadingWorkout, setIsLoadingWorkout] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  useEffect(() => {
    if (dict) {
      const defaultGoal = dict.dashboard.goals.gain_muscle.title;
      setGoal(defaultGoal);
    }
  }, [dict]);

  useEffect(() => {
    if (goal && dict) {
      const fetchWorkout = async () => {
        setIsLoadingWorkout(true);
        setError(null);
        const result = await handleGenerateWorkout(goal, dict.lang);
        if ('error' in result) {
          setError(result.error);
          setWorkout(null);
        } else {
          setWorkout(result);
        }
        setIsLoadingWorkout(false);
      };
      fetchWorkout();
    }
  }, [goal, dict]);
  
  if (!dict) return null;

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newGoal = formData.get('goal') as string;
    if (newGoal) {
      setGoal(newGoal);
    }
    setIsDialogOpen(false);
  };
  
  const renderWorkoutContent = () => {
    if (isLoadingWorkout) {
      return (
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      );
    }

    if (error) {
       return (
        <CardContent>
            <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{dict.dashboard.workoutError.title}</AlertTitle>
            <AlertDescription>{dict.dashboard.workoutError.message} {error}</AlertDescription>
            </Alert>
        </CardContent>
       )
    }

    if (!workout) {
      return <CardContent><p>{dict.dashboard.noWorkout}</p></CardContent>;
    }
    
    return (
        <>
            <CardHeader className="relative">
                <Image
                src="https://placehold.co/1200x400.png"
                alt="Workout banner"
                width={1200}
                height={400}
                className="rounded-t-lg object-cover w-full h-48"
                data-ai-hint="fitness workout"
                />
                <div className="absolute bottom-6 left-6 bg-black/50 text-white p-4 rounded-lg">
                <CardTitle className="text-3xl font-headline">{workout.title}</CardTitle>
                <CardDescription className="text-lg text-gray-200">{workout.focus}</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                {workout.warmup && (
                    <AccordionItem value="item-1">
                        <AccordionTrigger className="text-xl font-semibold">
                        <div className="flex items-center gap-3">
                            <Flame className="w-6 h-6 text-accent" /> {workout.warmup.title}
                        </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-base pl-4 border-l-2 border-accent ml-4">
                            {workout.warmup.items ? (
                                <ul className="list-disc pl-5 space-y-2">
                                    {workout.warmup.items.map((item, index) => (
                                    <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            ) : <p>{workout.warmup.description}</p>}
                        </AccordionContent>
                    </AccordionItem>
                )}
                {workout.technique && (
                    <AccordionItem value="item-2">
                        <AccordionTrigger className="text-xl font-semibold">
                        <div className="flex items-center gap-3">
                            <Zap className="w-6 h-6 text-accent" /> {workout.technique.title}
                        </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-base pl-4 border-l-2 border-accent ml-4">
                            <p>{workout.technique.description}</p>
                        </AccordionContent>
                    </AccordionItem>
                )}
                {workout.main && (
                    <AccordionItem value="item-3">
                        <AccordionTrigger className="text-xl font-semibold">
                        <div className="flex items-center gap-3">
                            <Bike className="w-6 h-6 text-accent" /> {workout.main.title}
                        </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-base pl-4 border-l-2 border-accent ml-4">
                            {workout.main.items ? (
                                <ul className="list-disc pl-5 space-y-3">
                                    {workout.main.items.map((item, index) => (
                                    <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            ) : <p>{workout.main.description}</p>}
                        </AccordionContent>
                    </AccordionItem>
                )}
                {workout.stretching && (
                    <AccordionItem value="item-4">
                        <AccordionTrigger className="text-xl font-semibold">
                        <div className="flex items-center gap-3">
                            <StretchHorizontal className="w-6 h-6 text-accent" /> {workout.stretching.title}
                        </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-base pl-4 border-l-2 border-accent ml-4">
                            <p>{workout.stretching.description}</p>
                        </AccordionContent>
                    </AccordionItem>
                )}
                </Accordion>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                <CheckCircle className="mr-2 h-5 w-5" /> {dict.dashboard.markAsCompleted}
                </Button>
                <Button variant="outline" size="icon" aria-label="Favorite workout">
                <Heart className="h-6 w-6 text-muted-foreground" />
                </Button>
            </CardFooter>
        </>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-primary" />
                  {dict.dashboard.yourGoal}
                </CardTitle>
                <CardDescription>{dict.dashboard.yourCustomGoal}</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Pencil className="mr-2 h-4 w-4" /> {dict.dashboard.editGoal}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={handleSaveGoal}>
                    <DialogHeader>
                      <DialogTitle>{dict.dashboard.editGoal}</DialogTitle>
                      <DialogDescription>{dict.dashboard.setCustomGoal}</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                       <div className="grid w-full gap-1.5">
                         <Label htmlFor="goal">{dict.dashboard.customGoalLabel}</Label>
                         <Textarea defaultValue={goal} name="goal" id="goal" placeholder={dict.dashboard.customGoalPlaceholder} />
                       </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">{dict.dashboard.saveGoal}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground font-semibold text-lg">{goal}</p>
          </CardContent>
        </Card>

        <Card>
            {renderWorkoutContent()}
        </Card>
      </div>
      <div className="lg:col-span-1">
        <Timer />
      </div>
    </div>
  );
}
