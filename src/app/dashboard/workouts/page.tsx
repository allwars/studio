
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
import { CheckCircle, Heart, Flame, Bike, Zap, StretchHorizontal, AlertCircle, BookCheck, Dumbbell } from 'lucide-react';
import Image from 'next/image';
import { useDictionary } from '@/hooks/use-dictionary';
import { handleGenerateWorkout } from './actions';
import type { GenerateWorkoutOutput } from '@/ai/flows/generate-workout-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import type { ActivityLog, LoggedWorkoutItem } from '@/lib/types';


export default function WorkoutsPage() {
  const dict = useDictionary();
  const { toast } = useToast();
  const [goal, setGoal] = useState<string>('');
  const [workout, setWorkout] = useState<GenerateWorkoutOutput | null>(null);
  const [isLoadingWorkout, setIsLoadingWorkout] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [lastWorkoutFeedback, setLastWorkoutFeedback] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    if (dict) {
      const storedGoal = localStorage.getItem('fitnessGoal');
      if (storedGoal) {
        setGoal(storedGoal);
      } else {
        setGoal(dict.dashboard.goals.gain_muscle.title);
      }
    }
  }, [dict]);

  useEffect(() => {
    const storedFeedback = localStorage.getItem('lastWorkoutFeedback');
    if (storedFeedback) {
        setLastWorkoutFeedback(storedFeedback);
    }
  }, []);

  useEffect(() => {
    if (lastWorkoutFeedback) {
        localStorage.setItem('lastWorkoutFeedback', lastWorkoutFeedback);
    } else {
        localStorage.removeItem('lastWorkoutFeedback');
    }
  }, [lastWorkoutFeedback]);

  useEffect(() => {
    if (goal && dict) {
      const fetchWorkout = async () => {
        setIsLoadingWorkout(true);
        setError(null);
        const result = await handleGenerateWorkout(goal, dict.lang, lastWorkoutFeedback);
        if ('error' in result) {
          setError(result.error);
          setWorkout(null);
        } else {
          setWorkout(result);
          // Reset feedback after using it for generation
          if (lastWorkoutFeedback) {
              setLastWorkoutFeedback(undefined);
          }
        }
        setIsLoadingWorkout(false);
      };
      fetchWorkout();
    }
  }, [goal, dict, lastWorkoutFeedback]);
  
  if (!dict) return null;

  const handleLogWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workout) return;
    
    const formData = new FormData(e.target as HTMLFormElement);
    const feedback = formData.get('feedback') as string;
    const completed = formData.get('completed') === 'on';
    
    if (completed) {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const storedLog = localStorage.getItem('activityLog');
        const activityLog: ActivityLog = storedLog ? JSON.parse(storedLog) : [];

        let todayLog = activityLog.find(day => day.date === today);

        const newWorkoutLog: LoggedWorkoutItem = {
            id: crypto.randomUUID(),
            title: workout.title,
            focus: workout.focus,
        };

        if (todayLog) {
            todayLog.workouts.push(newWorkoutLog);
        } else {
            activityLog.push({
                date: today,
                meals: [],
                workouts: [newWorkoutLog],
            });
        }
        localStorage.setItem('activityLog', JSON.stringify(activityLog));
    }
    
    let feedbackMessage = `Workout completed: ${completed}. User feedback: "${feedback}"`;
    if (!feedback) {
        feedbackMessage = `Workout completed: ${completed}. User provided no specific feedback.`;
    }

    setLastWorkoutFeedback(feedbackMessage);
    setIsLogDialogOpen(false);
    toast({
        title: dict.dashboard.logWorkout.logSaved,
        description: dict.dashboard.logWorkout.nextWorkoutAdjusted,
    });
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
            <CardHeader className="relative p-0">
                <Image
                src="https://placehold.co/1200x400.png"
                alt="Workout banner"
                width={1200}
                height={400}
                className="rounded-t-lg object-cover w-full h-48"
                data-ai-hint="fitness workout"
                />
                <div className="absolute bottom-4 left-6 bg-black/50 text-white p-4 rounded-lg">
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
              <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
                <DialogTrigger asChild>
                   <Button size="lg" className="bg-primary hover:bg-primary/90">
                      <BookCheck className="mr-2 h-5 w-5" /> {dict.dashboard.logWorkout.button}
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={handleLogWorkout}>
                    <DialogHeader>
                      <DialogTitle>{dict.dashboard.logWorkout.title}</DialogTitle>
                      <DialogDescription>{dict.dashboard.logWorkout.description}</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                       <div className="flex items-center space-x-2">
                         <Switch id="completed" name="completed" defaultChecked/>
                         <Label htmlFor="completed">{dict.dashboard.logWorkout.completedLabel}</Label>
                       </div>
                       <div className="grid w-full gap-1.5">
                         <Label htmlFor="feedback">{dict.dashboard.logWorkout.feedbackLabel}</Label>
                         <Textarea name="feedback" id="feedback" placeholder={dict.dashboard.logWorkout.feedbackPlaceholder} />
                       </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">{dict.dashboard.logWorkout.saveButton}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
                <Button variant="outline" size="icon" aria-label="Favorite workout">
                <Heart className="h-6 w-6 text-muted-foreground" />
                </Button>
            </CardFooter>
        </>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <Dumbbell /> {dict.sidebar.workouts}
        </h1>
        <p className="text-muted-foreground">{dict.workouts.description}</p>
      </div>
      <Card>
          {renderWorkoutContent()}
      </Card>
    </div>
  );
}
