# **App Name**: Move2Health

## Core Features:

- User Authentication: User authentication and profile management with Firebase Authentication including email/password and Google login.
- Workout Display and Tracking: Daily workout routine display including warm-up, technique, main part, and stretching sections, enabling users to view and mark workouts as completed. This will include a simple timer.
- Diet Display: Display of daily diets based on training types.
- Workout Favorites: Allow marking workouts as favorite.
- Photo Capture and AI Analysis: Allow users to take or upload photos (e.g., meals, body progress, or food labels) and send them to an AI service for automatic analysis. Use Firebase Storage to store images and trigger Cloud Functions or an external API (e.g., OpenAI Vision, Clarifai, or food recognition models) for image interpretation. Analysis results are saved in Firestore and optionally linked to diet or progress tracking entries.

## Style Guidelines:

- Primary color: Forest green (#228B22) to evoke health and nature.
- Background color: Light beige (#F5F5DC), for a neutral and calming backdrop.
- Accent color: Soft orange (#FFA500), providing a warm and energetic highlight for key actions and information.
- Body and headline font: 'PT Sans', a humanist sans-serif for a modern yet accessible feel.
- Use clear, minimalist icons to represent different workout types, nutritional information, and user progress metrics.
- Design a clean, card-based layout for displaying workout routines, dietary information, and progress tracking.
- Incorporate subtle animations and transitions to provide feedback on user interactions, such as marking workouts as complete or updating profile information.