import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';

const dietPlan = [
  {
    meal: 'Breakfast',
    title: 'Protein-Packed Oatmeal',
    description: 'Oats with a scoop of protein powder, berries, and a sprinkle of chia seeds. A great start to fuel your day.',
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'oatmeal berries'
  },
  {
    meal: 'Lunch',
    title: 'Grilled Chicken Salad',
    description: 'Mixed greens with grilled chicken breast, cherry tomatoes, cucumbers, and a light vinaigrette dressing.',
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'chicken salad'
  },
  {
    meal: 'Dinner',
    title: 'Salmon with Quinoa & Asparagus',
    description: 'Baked salmon fillet served with a side of quinoa and roasted asparagus. Rich in Omega-3s and nutrients.',
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'salmon quinoa'
  },
  {
    meal: 'Snack',
    title: 'Greek Yogurt with Almonds',
    description: 'A handful of almonds with a cup of plain Greek yogurt. Perfect for a post-workout protein boost.',
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'yogurt almonds'
  },
];

export default function DietPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Daily Diet Plan</h1>
        <p className="text-muted-foreground">Tailored for a balanced training day.</p>
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
