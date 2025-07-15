
'use client';

import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDictionary } from '@/hooks/use-dictionary';
import { History, Utensils, Dumbbell, Trash2 } from 'lucide-react';
import type { ActivityLog, LoggedMealItem, LoggedWorkoutItem } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EditIcon } from '@/components/icons';
import LoadingSpinner from '@/components/loading-spinner';

type EditableItem = (LoggedMealItem & { type: 'meal' }) | (LoggedWorkoutItem & { type: 'workout' });
=======
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useDictionary } from '@/hooks/use-dictionary';
import { History, Utensils, Dumbbell } from 'lucide-react';
import type { ActivityLog } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
>>>>>>> 8b72e23 (en el registro mete las comidas que se añadan ene l plan de dietaagrupad)

export default function LogPage() {
    const dict = useDictionary();
    const [log, setLog] = useState<ActivityLog>([]);
    const [isLoading, setIsLoading] = useState(true);
<<<<<<< HEAD
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<EditableItem | null>(null);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedFocus, setEditedFocus] = useState('');
=======
>>>>>>> 8b72e23 (en el registro mete las comidas que se añadan ene l plan de dietaagrupad)

    const dateLocales: { [key: string]: Locale } = {
        en: enUS,
        es: es,
<<<<<<< HEAD
    };

    const loadLog = () => {
=======
      };

    useEffect(() => {
>>>>>>> 8b72e23 (en el registro mete las comidas que se añadan ene l plan de dietaagrupad)
        const storedLog = localStorage.getItem('activityLog');
        if (storedLog) {
            setLog(JSON.parse(storedLog).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
<<<<<<< HEAD
    };

    useEffect(() => {
        loadLog();
=======
>>>>>>> 8b72e23 (en el registro mete las comidas que se añadan ene l plan de dietaagrupad)
        setIsLoading(false);
    }, []);

    if (!dict) return null;
    
    const mealTypesOrder = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

    const handleEditClick = (item: EditableItem) => {
        setCurrentItem(item);
        setEditedTitle(item.title);
        if (item.type === 'workout') {
            setEditedFocus(item.focus);
        }
        setIsEditDialogOpen(true);
    };

    const handleSaveEdit = () => {
        if (!currentItem) return;

        const updatedLog = log.map(day => {
            if (currentItem.type === 'meal') {
                const mealIndex = day.meals.findIndex(m => m.id === currentItem.id);
                if (mealIndex > -1) {
                    day.meals[mealIndex].title = editedTitle;
                }
            } else {
                const workoutIndex = day.workouts.findIndex(w => w.id === currentItem.id);
                if (workoutIndex > -1) {
                    day.workouts[workoutIndex].title = editedTitle;
                    day.workouts[workoutIndex].focus = editedFocus;
                }
            }
            return day;
        });

        localStorage.setItem('activityLog', JSON.stringify(updatedLog));
        setLog(updatedLog);
        setIsEditDialogOpen(false);
        setCurrentItem(null);
    };

    const handleDeleteItem = (itemId: string, itemType: 'meal' | 'workout') => {
        const updatedLog = log.map(day => {
            if (itemType === 'meal') {
                day.meals = day.meals.filter(m => m.id !== itemId);
            } else {
                day.workouts = day.workouts.filter(w => w.id !== itemId);
            }
            return day;
        }).filter(day => day.meals.length > 0 || day.workouts.length > 0); // Remove empty days

        localStorage.setItem('activityLog', JSON.stringify(updatedLog));
        setLog(updatedLog);
    };

    const mealTypesOrder = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                    <History /> {dict.log.title}
                </h1>
                <p className="text-muted-foreground">{dict.log.description}</p>
            </div>

            {isLoading ? (
<<<<<<< HEAD
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                </div>
=======
                <Card>
                    <CardContent className="p-6">
                        <p>{dict.log.loading}</p>
                    </CardContent>
                </Card>
>>>>>>> 8b72e23 (en el registro mete las comidas que se añadan ene l plan de dietaagrupad)
            ) : log.length === 0 ? (
                <Card className="flex items-center justify-center min-h-[400px]">
                    <CardContent className="text-center p-6">
                        <h3 className="text-xl font-semibold">{dict.log.noActivityTitle}</h3>
                        <p className="text-muted-foreground mt-2">{dict.log.noActivityDescription}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-8">
                    {log.map(day => (
                        <Card key={day.date}>
                            <CardHeader>
                                <CardTitle className="capitalize">
                                    {format(parseISO(day.date), "eeee, d 'de' MMMM yyyy", { locale: dateLocales[dict.lang] || es })}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {day.meals.length > 0 && (
                                    <div>
                                        <h3 className="text-xl font-semibold mb-3 flex items-center gap-2"><Utensils size={20} /> {dict.log.mealsTitle}</h3>
                                        <div className="space-y-4">
                                            {mealTypesOrder.map(mealType => {
                                                const mealsOfType = day.meals.filter(meal => meal.mealType === mealType);
                                                if (mealsOfType.length === 0) return null;
                                                return (
                                                    <div key={mealType}>
                                                        <h4 className="font-bold text-md">{dict.dietPlan.mealType[mealType.toLowerCase() as keyof typeof dict.dietPlan.mealType]}</h4>
<<<<<<< HEAD
                                                        <ul className="list-none mt-2 space-y-1 text-muted-foreground">
                                                            {mealsOfType.map(meal => (
                                                                <li key={meal.id} className="flex items-center justify-between group">
                                                                    <span>{meal.title}</span>
                                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                                                        <Button variant="ghost" size="icon" onClick={() => handleEditClick({ ...meal, type: 'meal' })}>
                                                                            <EditIcon className="h-4 w-4" />
                                                                        </Button>
                                                                        <AlertDialog>
                                                                            <AlertDialogTrigger asChild>
                                                                                <Button variant="ghost" size="icon">
                                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                                </Button>
                                                                            </AlertDialogTrigger>
                                                                            <AlertDialogContent>
                                                                                <AlertDialogHeader>
                                                                                    <AlertDialogTitle>{dict.log.deleteConfirmTitle}</AlertDialogTitle>
                                                                                    <AlertDialogDescription>{dict.log.deleteConfirmDescription}</AlertDialogDescription>
                                                                                </AlertDialogHeader>
                                                                                <AlertDialogFooter>
                                                                                    <AlertDialogCancel>{dict.pantry.cancelButtonLabel}</AlertDialogCancel>
                                                                                    <AlertDialogAction onClick={() => handleDeleteItem(meal.id, 'meal')}>{dict.log.deleteButton}</AlertDialogAction>
                                                                                </AlertDialogFooter>
                                                                            </AlertDialogContent>
                                                                        </AlertDialog>
                                                                    </div>
                                                                </li>
=======
                                                        <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                                                            {mealsOfType.map(meal => (
                                                                <li key={meal.id}>{meal.title}</li>
>>>>>>> 8b72e23 (en el registro mete las comidas que se añadan ene l plan de dietaagrupad)
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                                {day.workouts.length > 0 && (
                                     <div>
                                        <h3 className="text-xl font-semibold mb-3 flex items-center gap-2"><Dumbbell size={20}/> {dict.log.workoutsTitle}</h3>
                                        <div className="space-y-2">
                                            {day.workouts.map(workout => (
<<<<<<< HEAD
                                                <div key={workout.id} className="p-3 bg-secondary rounded-md flex items-center justify-between group">
                                                    <div>
                                                        <p className="font-semibold text-secondary-foreground">{workout.title}</p>
                                                        <p className="text-sm text-muted-foreground">{workout.focus}</p>
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEditClick({ ...workout, type: 'workout' })}>
                                                            <EditIcon className="h-4 w-4" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>{dict.log.deleteConfirmTitle}</AlertDialogTitle>
                                                                    <AlertDialogDescription>{dict.log.deleteConfirmDescription}</AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>{dict.pantry.cancelButtonLabel}</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteItem(workout.id, 'workout')}>{dict.log.deleteButton}</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
=======
                                                <div key={workout.id} className="p-3 bg-secondary rounded-md">
                                                    <p className="font-semibold text-secondary-foreground">{workout.title}</p>
                                                    <p className="text-sm text-muted-foreground">{workout.focus}</p>
>>>>>>> 8b72e23 (en el registro mete las comidas que se añadan ene l plan de dietaagrupad)
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
<<<<<<< HEAD
             <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{dict.log.editEntryTitle}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edited-title">{dict.log.editTitleLabel}</Label>
                            <Input id="edited-title" value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} />
                        </div>
                        {currentItem?.type === 'workout' && (
                             <div className="space-y-2">
                                <Label htmlFor="edited-focus">{dict.log.editFocusLabel}</Label>
                                <Input id="edited-focus" value={editedFocus} onChange={(e) => setEditedFocus(e.target.value)} />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>{dict.pantry.cancelButtonLabel}</Button>
                        <Button onClick={handleSaveEdit}>{dict.pantry.saveButton}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
=======
>>>>>>> 8b72e23 (en el registro mete las comidas que se añadan ene l plan de dietaagrupad)
        </div>
    );
}
