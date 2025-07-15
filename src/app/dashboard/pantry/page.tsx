'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDictionary } from '@/hooks/use-dictionary';
import { Trash2, PlusCircle, ShoppingBasket } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function PantryPage() {
  const dict = useDictionary();
  const { toast } = useToast();
  const [pantryItems, setPantryItems] = useState<string[]>([]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedItems = localStorage.getItem('pantryItems');
      if (storedItems) {
        setPantryItems(JSON.parse(storedItems));
      }
    }
  }, []);

  const saveItems = (items: string[]) => {
    setPantryItems(items);
    localStorage.setItem('pantryItems', JSON.stringify(items));
    toast({
      title: dict.pantry.toastTitle,
      description: dict.pantry.toastDescription,
    });
  };

  const handleRemoveItem = (itemToRemove: string) => {
    const updatedItems = pantryItems.filter((item) => item !== itemToRemove);
    saveItems(updatedItems);
  };
  
  if (!dict) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <ShoppingBasket /> {dict.pantry.title}
          </h1>
          <p className="text-muted-foreground">{dict.pantry.description}</p>
        </div>
        <Button asChild>
           <Link href={`/${dict.lang}/dashboard/pantry/add`}>
                <PlusCircle className="mr-2"/>
                {dict.pantry.addItemTitle}
           </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{dict.pantry.currentItemsTitle}</CardTitle>
          <CardDescription>{dict.pantry.currentItemsDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          {pantryItems.length > 0 ? (
            <ul className="space-y-2">
              {pantryItems.map((item, index) => (
                <li key={index} className="flex items-center justify-between p-2 rounded-md bg-secondary">
                  <span className="text-secondary-foreground">{item}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item)}
                    aria-label={`${dict.pantry.removeItemLabel} ${item}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">{dict.pantry.noItems}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
