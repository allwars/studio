'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDictionary } from '@/hooks/use-dictionary';
import { Trash2, PlusCircle, ShoppingBasket } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PantryPage() {
  const dict = useDictionary();
  const { toast } = useToast();
  const [pantryItems, setPantryItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    const storedItems = localStorage.getItem('pantryItems');
    if (storedItems) {
      setPantryItems(JSON.parse(storedItems));
    }
  }, []);

  const saveItems = (items: string[]) => {
    setPantryItems(items);
    localStorage.setItem('pantryItems', JSON.stringify(items));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim() && !pantryItems.includes(newItem.trim())) {
      const updatedItems = [...pantryItems, newItem.trim()];
      saveItems(updatedItems);
      setNewItem('');
    }
  };

  const handleRemoveItem = (itemToRemove: string) => {
    const updatedItems = pantryItems.filter((item) => item !== itemToRemove);
    saveItems(updatedItems);
  };
  
  const handleSaveChanges = () => {
    toast({
        title: dict.pantry.toastTitle,
        description: dict.pantry.toastDescription,
    });
  }

  if (!dict) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <ShoppingBasket /> {dict.pantry.title}
        </h1>
        <p className="text-muted-foreground">{dict.pantry.description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{dict.pantry.addItemTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddItem} className="flex items-end gap-2">
            <div className="flex-grow">
              <Label htmlFor="new-item">{dict.pantry.itemLabel}</Label>
              <Input
                id="new-item"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder={dict.pantry.itemPlaceholder}
              />
            </div>
            <Button type="submit" size="icon" aria-label={dict.pantry.addButtonLabel}>
              <PlusCircle />
            </Button>
          </form>
        </CardContent>
      </Card>
      
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
      
       <div className="flex justify-end">
          <Button onClick={handleSaveChanges}>
            {dict.pantry.saveButton}
          </Button>
      </div>

    </div>
  );
}
