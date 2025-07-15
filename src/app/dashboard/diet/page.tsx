'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useDictionary } from '@/hooks/use-dictionary';
import Image from 'next/image';

const dietImages = [
  {
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'oatmeal berries'
  },
  {
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'chicken salad'
  },
  {
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'salmon quinoa'
  },
  {
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'yogurt almonds'
  },
];

export default function DietPage() {
  const dict = useDictionary();

  if (!dict) return null;

  const dietPlan = dict.dietPlan.meals.map((meal, index) => ({
    ...meal,
    ...dietImages[index]
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">{dict.dietPlan.title}</h1>
        <p className="text-muted-foreground">{dict.dietPlan.description}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {dietPlan.map((item) => (
          <Card key={item.meal} className="overflow-hidden">
            <CardHeader className="p-0">
              <Image
                src={item.image}
                alt={item.title}
                width={600}
                height={400}
                className="w-full h-48 object-cover"
                data-ai-hint={item.dataAiHint}
              />
            </CardHeader>
            <CardContent className="p-6">
              <CardDescription className="font-semibold text-primary">{item.meal}</CardDescription>
              <CardTitle className="mt-1 text-2xl font-headline">{item.title}</CardTitle>
              <p className="mt-2 text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
