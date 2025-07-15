
export type LoggedMealItem = {
    id: string;
    mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
    title: string;
    description: string;
};
  
export type LoggedWorkoutItem = {
    id: string;
    title: string;
    focus: string;
};

export type DailyLog = {
    date: string; // YYYY-MM-DD
    meals: LoggedMealItem[];
    workouts: LoggedWorkoutItem[];
};
  
export type ActivityLog = DailyLog[];
