
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDictionary } from '@/hooks/use-dictionary';
import { History, Utensils, Dumbbell } from 'lucide-react';
import type { ActivityLog, LoggedMealItem, LoggedWorkoutItem } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EditIcon } from '@/components/icons';
import LoadingSpinner from '@/components/loading-spinner';

type EditableItem = (LoggedMealItem & { type: 'meal' }) | (LoggedWorkoutItem & { type: 'workout' });

export default function LogPage() {
    const dict = useDictionary();
    const [log, setLog] = useState<ActivityLog>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<EditableItem | null>(null);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedFocus, setEditedFocus] = useState('');

    const dateLocales: { [key: string]: Locale } = {
        en: enUS,
        es: es,
    };

    const loadLog = () => {
        const storedLog = localStorage.getItem('activityLog');
        if (storedLog) {
            setLog(JSON.parse(storedLog).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
    };

    useEffect(() => {
        loadLog();
        setIsLoading(false);
    }, []);

    if (!dict) return null;

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
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                </div>
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
                                                        <ul className="list-none mt-2 space-y-1 text-muted-foreground">
                                                            {mealsOfType.map(meal => (
                                                                <li key={meal.id} className="flex items-center justify-between group">
                                                                    <span>{meal.title}</span>
                                                                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleEditClick({ ...meal, type: 'meal' })}>
                                                                        <EditIcon className="h-4 w-4" />
                                                                    </Button>
                                                                </li>
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
                                                <div key={workout.id} className="p-3 bg-secondary rounded-md flex items-center justify-between group">
                                                    <div>
                                                        <p className="font-semibold text-secondary-foreground">{workout.title}</p>
                                                        <p className="text-sm text-muted-foreground">{workout.focus}</p>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleEditClick({ ...workout, type: 'workout' })}>
                                                        <EditIcon className="h-4 w-4" />
                                                    </Button>
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
        </div>
    );
}
