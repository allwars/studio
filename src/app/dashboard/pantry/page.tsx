'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDictionary } from '@/hooks/use-dictionary';
import { Trash2, PlusCircle, ShoppingBasket, Pencil, ChevronDown, Loader2, AlertCircle, ThumbsUp, BrainCircuit } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { handleGetNutritionalInfo, handleGeneratePantryAdvice } from './actions';
import type { NutritionalInfoOutput } from '@/ai/flows/get-nutritional-info-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export type PantryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: 'g' | 'kg' | 'l' | 'ml' | 'units';
};

type NutritionalInfoCache = {
  [key: string]: NutritionalInfoOutput | 'loading' | 'error';
};

function PantrySummary({ items, language, infoCache }: { items: PantryItem[], language: string, infoCache: NutritionalInfoCache }) {
    const dict = useDictionary();
    const [advice, setAdvice] = useState<string | null>(null);
    const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
    
    const scores = useMemo(() => items.map(item => {
        const info = infoCache[item.name.toLowerCase()];
        return typeof info === 'object' ? info.nutritionalScore : null;
    }).filter(score => score !== null) as number[], [items, infoCache]);

    const averageScore = useMemo(() => {
        if (scores.length === 0) return 0;
        const totalScore = scores.reduce((acc, score) => acc + score, 0);
        return Math.round(totalScore / scores.length);
    }, [scores]);

    useEffect(() => {
        const hasAllScores = scores.length === items.filter(item => {
            const info = infoCache[item.name.toLowerCase()];
            return info && typeof info === 'object';
        }).length;

        if (items.length > 0 && hasAllScores && scores.length > 0) {
            const fetchAdvice = async () => {
                setIsLoadingAdvice(true);
                const itemNames = items.map(i => i.name);
                const result = await handleGeneratePantryAdvice(itemNames, averageScore, language);
                if (result.advice) {
                    setAdvice(result.advice);
                }
                setIsLoadingAdvice(false);
            };
            fetchAdvice();
        } else if (items.length === 0) {
            setAdvice(dict?.pantry.startByAddingItems || '');
            setIsLoadingAdvice(false);
        }
    }, [items, scores, averageScore, language, dict, infoCache]);
    
    if (!dict) return null;
    
    const getScoreColor = (score: number) => {
        if (score <= 30) return 'bg-red-500';
        if (score <= 60) return 'bg-orange-500';
        return 'bg-green-500';
    }
    
    const allItemsLoaded = Object.keys(infoCache).length === items.length;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BrainCircuit /> {dict.pantry.pantrySummaryTitle}
                </CardTitle>
                <CardDescription>{dict.pantry.pantrySummaryDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label>{dict.pantry.overallHealth}</Label>
                    <div className="flex items-center gap-4 mt-1">
                        {!allItemsLoaded && items.length > 0 ? (
                             <Skeleton className="h-6 w-full" />
                        ) : (
                            <>
                            <Progress value={averageScore} className="w-full" />
                            <span className={cn("text-lg font-bold text-white px-3 py-1 rounded-md", getScoreColor(averageScore))}>
                                {averageScore}/100
                            </span>
                            </>
                        )}
                    </div>
                </div>
                <div>
                    <Label>{dict.pantry.aiTips}</Label>
                    {isLoadingAdvice || (!allItemsLoaded && items.length > 0) ? (
                        <Skeleton className="h-10 w-full mt-1" />
                    ) : (
                        <p className="text-sm text-muted-foreground mt-1 bg-secondary p-3 rounded-md">{advice}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}


function NutritionalInfo({ item, language, infoCache, fetchInfo }: { item: PantryItem; language: string; infoCache: NutritionalInfoCache; fetchInfo: (item: PantryItem) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dict = useDictionary();
  const info = infoCache[item.name.toLowerCase()];
  const isLoading = info === 'loading';
  const isError = info === 'error';

  useEffect(() => {
    // This effect ensures that if the name changes for an open item, we refetch.
    const cacheKey = item.name.toLowerCase();
    if (isOpen && infoCache[cacheKey] === undefined) {
      fetchInfo(item);
    }
  }, [item, isOpen, infoCache, fetchInfo]);

  if (!dict) return null;

  const handleTriggerClick = () => {
    setIsOpen(prev => !prev);
  }

  const getScoreColor = (score: number) => {
    if (score <= 30) return 'bg-red-500';
    if (score <= 60) return 'bg-orange-500';
    return 'bg-green-500';
  }

  return (
    <AccordionItem value={item.id}>
      <AccordionTrigger onClick={handleTriggerClick} className="group">
        <div className="flex items-center gap-2">
            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            {dict.pantry.nutritionalInfo}
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {isLoading &&  <div className="flex items-center space-x-4 p-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-3/4" />
        </div>}
        {isError && 
            <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{dict.photoAnalysis.errorTitle}</AlertTitle>
                <AlertDescription>{dict.pantry.errorFetchingInfo}</AlertDescription>
            </Alert>
        }
        {info && typeof info === 'object' && (
          <div className="space-y-4 pl-2">
            <p className="text-sm text-muted-foreground">{info.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <h4 className="font-semibold mb-2">{dict.pantry.macros}</h4>
                    <ul>
                      <li><strong>{dict.pantry.calories}:</strong> {info.calories}</li>
                      <li><strong>{dict.pantry.protein}:</strong> {info.protein}g</li>
                      <li><strong>{dict.pantry.carbs}:</strong> {info.carbohydrates}g</li>
                      <li><strong>{dict.pantry.fat}:</strong> {info.fat}g</li>
                    </ul>
                </div>
                <div>
                     <h4 className="font-semibold mb-2">{dict.pantry.healthScore}</h4>
                     <div className="flex items-center gap-2">
                        <span className={cn("text-lg font-bold text-white px-2 py-1 rounded-md", getScoreColor(info.nutritionalScore))}>
                            {info.nutritionalScore}/100
                        </span>
                     </div>
                </div>
                 <div className="col-span-2">
                     <h4 className="font-semibold mb-2">{dict.pantry.preservatives}</h4>
                    {info.preservatives.length > 0 ? (
                        <ul className="list-disc pl-5">
                            {info.preservatives.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                    ) : (
                        <div className="flex items-center gap-2 text-green-600">
                            <ThumbsUp className="h-4 w-4"/>
                            <span>{dict.pantry.noPreservatives}</span>
                        </div>
                    )}
                </div>
            </div>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}


export default function PantryPage() {
  const dict = useDictionary();
  const { toast } = useToast();
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<PantryItem | null>(null);
  const [infoCache, setInfoCache] = useState<NutritionalInfoCache>({});
  
  const fetchInfoForItem = useCallback(async (item: PantryItem) => {
    const cacheKey = item.name.toLowerCase();
    if (infoCache[cacheKey] && infoCache[cacheKey] !== 'error') return;

    setInfoCache(prev => ({ ...prev, [cacheKey]: 'loading' }));
    if(!dict) return;
    const result = await handleGetNutritionalInfo(item.name, dict.lang);

    if (result.error) {
      setInfoCache(prev => ({ ...prev, [cacheKey]: 'error' }));
    } else if(result.data) {
      setInfoCache(prev => ({ ...prev, [cacheKey]: result.data! }));
    }
  }, [infoCache, dict]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedItems = localStorage.getItem('pantryItems');
      if (storedItems) {
        try {
            const parsedItems = JSON.parse(storedItems);
            if (Array.isArray(parsedItems) && parsedItems.every(item => typeof item === 'object' && 'id' in item && 'name' in item)) {
                 setPantryItems(parsedItems);
            } else if (Array.isArray(parsedItems) && parsedItems.every(item => typeof item === 'string')) {
                const migratedItems: PantryItem[] = parsedItems.map((name: string) => ({
                    id: crypto.randomUUID(),
                    name,
                    quantity: 1,
                    unit: 'units',
                }));
                setPantryItems(migratedItems);
                localStorage.setItem('pantryItems', JSON.stringify(migratedItems));
            }
        } catch (e) {
            console.error("Failed to parse pantry items from localStorage", e);
            setPantryItems([]);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (pantryItems.length > 0 && dict) {
        pantryItems.forEach(item => {
            fetchInfoForItem(item);
        });
    }
  }, [pantryItems, dict, fetchInfoForItem]);


  const saveItems = (items: PantryItem[]) => {
    setPantryItems(items);
    localStorage.setItem('pantryItems', JSON.stringify(items));
  };

  const handleRemoveItem = (itemToRemoveId: string) => {
    const updatedItems = pantryItems.filter((item) => item.id !== itemToRemoveId);
    saveItems(updatedItems);
    
    // Also remove from cache
    const itemToRemove = pantryItems.find(item => item.id === itemToRemoveId);
    if (itemToRemove) {
        setInfoCache(prev => {
            const newCache = { ...prev };
            delete newCache[itemToRemove.name.toLowerCase()];
            return newCache;
        });
    }

    toast({
        title: dict.pantry.itemRemoved,
    });
  };

  const handleEditClick = (item: PantryItem) => {
    setCurrentItem(item);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentItem) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const quantity = parseFloat(formData.get('quantity') as string);
    const unit = formData.get('unit') as PantryItem['unit'];

    if (!name.trim() || isNaN(quantity) || !unit) {
        toast({
            variant: 'destructive',
            title: dict.pantry.invalidInput,
        });
        return;
    }

    const oldItemName = currentItem.name.toLowerCase();
    const updatedItems = pantryItems.map((item) =>
      item.id === currentItem.id ? { ...item, name, quantity, unit } : item
    );
    saveItems(updatedItems);
    
    const newItem = updatedItems.find(item => item.id === currentItem.id);
    if(newItem && oldItemName !== newItem.name.toLowerCase()){
         setInfoCache(prev => {
            const newCache = {...prev};
            delete newCache[oldItemName];
            return newCache;
        });
        fetchInfoForItem(newItem);
    }

    setIsEditDialogOpen(false);
    setCurrentItem(null);
    toast({
      title: dict.pantry.toastTitle,
      description: dict.pantry.toastDescription,
    });
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
      
      {pantryItems.length > 0 && <PantrySummary items={pantryItems} language={dict.lang} infoCache={infoCache} />}

      <Card>
        <CardHeader>
          <CardTitle>{dict.pantry.currentItemsTitle}</CardTitle>
          <CardDescription>{dict.pantry.currentItemsDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          {pantryItems.length > 0 ? (
             <Accordion type="multiple" className="w-full space-y-2">
              {pantryItems.map((item) => (
                 <div key={item.id} className="flex items-start justify-between p-2 rounded-md bg-secondary transition-colors hover:bg-secondary/80">
                    <div className="flex-grow">
                        <div className="flex justify-between items-center">
                            <span className="text-secondary-foreground font-semibold">{item.name}</span>
                             <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditClick(item)}
                                  aria-label={`${dict.pantry.editItemLabel} ${item.name}`}
                                >
                                  <Pencil className="h-4 w-4 text-muted-foreground" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveItem(item.id)}
                                  aria-label={`${dict.pantry.removeItemLabel} ${item.name}`}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.quantity} {dict.pantry.units_options[item.unit]}</p>
                        <Accordion type="multiple">
                           <NutritionalInfo item={item} language={dict.lang} infoCache={infoCache} fetchInfo={fetchInfoForItem} />
                        </Accordion>
                    </div>
                </div>
              ))}
            </Accordion>
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
            <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
               <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="name">{dict.pantry.itemLabel}</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={currentItem?.name}
                    className="mt-2"
                  />
               </div>
                <div className="space-y-2">
                    <Label htmlFor="quantity">{dict.pantry.quantity}</Label>
                    <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        defaultValue={currentItem?.quantity}
                        className="mt-2"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="unit">{dict.pantry.unit}</Label>
                     <Select name="unit" defaultValue={currentItem?.unit}>
                        <SelectTrigger id="unit">
                            <SelectValue placeholder={dict.pantry.selectUnit} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                            <SelectItem value="l">l</SelectItem>
                            <SelectItem value="units">{dict.pantry.units_options.units}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
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
