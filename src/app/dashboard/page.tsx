import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import Timer from '@/components/timer';
import { CheckCircle, Heart, Flame, Bike, Zap, StretchHorizontal } from 'lucide-react';
import Image from 'next/image';


export default function DashboardPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
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
                <CardTitle className="text-3xl font-headline">Full Body Strength Day</CardTitle>
                <CardDescription className="text-lg text-gray-200">Focus: Power and Endurance</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-xl font-semibold">
                  <div className="flex items-center gap-3">
                    <Flame className="w-6 h-6 text-accent" /> Warm-up (10 mins)
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-base pl-4 border-l-2 border-accent ml-4">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>5 minutes of light cardio (jogging, cycling).</li>
                    <li>Dynamic stretches: leg swings, arm circles, torso twists.</li>
                    <li>2 sets of 15 bodyweight squats.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-xl font-semibold">
                  <div className="flex items-center gap-3">
                    <Zap className="w-6 h-6 text-accent" /> Technique Focus (5 mins)
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-base pl-4 border-l-2 border-accent ml-4">
                  <p>Practice proper form for barbell squats with an empty bar. Focus on depth and keeping your chest up.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-xl font-semibold">
                  <div className="flex items-center gap-3">
                    <Bike className="w-6 h-6 text-accent" /> Main Workout (45 mins)
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-base pl-4 border-l-2 border-accent ml-4">
                   <ul className="list-disc pl-5 space-y-3">
                    <li>Barbell Squats: 3 sets of 8-10 reps.</li>
                    <li>Dumbbell Bench Press: 3 sets of 10-12 reps.</li>
                    <li>Pull-ups (or lat pulldowns): 3 sets to failure.</li>
                    <li>Overhead Press: 3 sets of 8-10 reps.</li>
                    <li>Plank: 3 sets, hold for 60 seconds.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-xl font-semibold">
                   <div className="flex items-center gap-3">
                    <StretchHorizontal className="w-6 h-6 text-accent" /> Stretching (10 mins)
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-base pl-4 border-l-2 border-accent ml-4">
                  <p>Static stretches for major muscle groups: quads, hamstrings, chest, back, and shoulders. Hold each stretch for 30 seconds.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <CheckCircle className="mr-2 h-5 w-5" /> Mark as Completed
            </Button>
            <Button variant="outline" size="icon" aria-label="Favorite workout">
              <Heart className="h-6 w-6 text-muted-foreground" />
            </Button>
          </CardFooter>
        </Card>
      </div>
      <div className="lg:col-span-1">
        <Timer />
      </div>
    </div>
  );
}
