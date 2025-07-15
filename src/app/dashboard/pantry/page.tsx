'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDictionary } from '@/hooks/use-dictionary';
import { Trash2, PlusCircle, ShoppingBasket, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PantryPage() {
  const dict = useDictionary();
  const { toast } = useToast();
  const [pantryItems, setPantryItems] = useState<string[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');

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

  const handleEditClick = (item: string) => {
    setCurrentItem(item);
    setNewItemName(item);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem || !newItemName.trim()) return;
    const updatedItems = pantryItems.map((item) =>
      item === currentItem ? newItemName.trim() : item
    );
    saveItems(updatedItems);
    setIsEditDialogOpen(false);
    setCurrentItem(null);
    setNewItemName('');
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
            <PlusCircle className="mr-2" />
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
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(item)}
                      aria-label={`${dict.pantry.editItemLabel} ${item}`}
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item)}
                      aria-label={`${dict.pantry.removeItemLabel} ${item}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">{dict.pantry.noItems}</p>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSaveEdit}>
            <DialogHeader>
              <DialogTitle>{dict.pantry.editItemTitle}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="ingredient-name">{dict.pantry.itemLabel}</Label>
              <Input
                id="ingredient-name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="mt-2"
              />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">{dict.pantry.cancelButtonLabel}</Button>
                </DialogClose>
                <Button type="submit">{dict.pantry.saveButton}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
