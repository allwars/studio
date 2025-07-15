'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useDictionary } from '@/hooks/use-dictionary';
import { History, Utensils, Dumbbell } from 'lucide-react';
import type { ActivityLog } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

export default function LogPage() {
    const dict = useDictionary();
    const [log, setLog] = useState<ActivityLog>([]);
    const [isLoading, setIsLoading] = useState(true);

    const dateLocales: { [key: string]: Locale } = {
        en: enUS,
        es: es,
      };

    useEffect(() => {
        const storedLog = localStorage.getItem('activityLog');
        if (storedLog) {
            setLog(JSON.parse(storedLog).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
        setIsLoading(false);
    }, []);

    if (!dict) return null;
    
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
                <Card>
                    <CardContent className="p-6">
                        <p>{dict.log.loading}</p>
                    </CardContent>
                </Card>
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
                                                        <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                                                            {mealsOfType.map(meal => (
                                                                <li key={meal.id}>{meal.title}</li>
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
                                                <div key={workout.id} className="p-3 bg-secondary rounded-md">
                                                    <p className="font-semibold text-secondary-foreground">{workout.title}</p>
                                                    <p className="text-sm text-muted-foreground">{workout.focus}</p>
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
        </div>
    );
}
