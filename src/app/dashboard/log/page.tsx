'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useDictionary } from '@/hooks/use-dictionary';
import { History } from 'lucide-react';


export default function LogPage() {
    const dict = useDictionary();

    if (!dict) return null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                    <History /> {dict.log.title}
                </h1>
                <p className="text-muted-foreground">{dict.log.description}</p>
            </div>

             <Card className="flex items-center justify-center min-h-[400px]">
                <CardContent className="text-center">
                    <h3 className="text-xl font-semibold">{dict.log.comingSoonTitle}</h3>
                    <p className="text-muted-foreground mt-2">{dict.log.comingSoonDescription}</p>
                </CardContent>
            </Card>

        </div>
    )
}
