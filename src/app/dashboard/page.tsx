
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Pencil, Target } from 'lucide-react';
import { useDictionary } from '@/hooks/use-dictionary';
import { useRouter } from 'next/navigation';


export default function DashboardPage() {
  const dict = useDictionary();
  const router = useRouter();
  const [goal, setGoal] = useState<string>('');
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  
  useEffect(() => {
    if (dict) {
      const storedGoal = localStorage.getItem('fitnessGoal');
      const defaultGoal = dict.dashboard.goals.gain_muscle.title;
      setGoal(storedGoal || defaultGoal);
    }
  }, [dict]);
  
  useEffect(() => {
    if (goal) {
        localStorage.setItem('fitnessGoal', goal);
    }
  }, [goal]);
  
  if (!dict) return null;

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newGoal = formData.get('goal') as string;
    if (newGoal) {
      setGoal(newGoal);
    }
    setIsGoalDialogOpen(false);
    // Navigate to workouts page after setting a new goal to see the new workout
    router.push(`/${dict.lang}/dashboard/workouts`);
  };

  return (
    <div className="space-y-6">
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
            <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
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

      {/* Placeholder for future analytics cards */}
      <div className="grid gap-6 md:grid-cols-2">
         <Card>
            <CardHeader>
                <CardTitle>Workout Progress</CardTitle>
                <CardDescription>Coming Soon</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center text-muted-foreground h-48">
                <p>Analytics about your workouts will be displayed here.</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Nutritional Trends</CardTitle>
                <CardDescription>Coming Soon</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center text-muted-foreground h-48">
                <p>Charts on your nutritional intake will be displayed here.</p>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
