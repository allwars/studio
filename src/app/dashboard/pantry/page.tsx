
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDictionary } from '@/hooks/use-dictionary';
import { Trash2, PlusCircle, ShoppingBasket, Pencil, ChevronDown, Loader2, AlertCircle, ThumbsUp, BrainCircuit, ArrowLeft, ArrowRight } from 'lucide-react';
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
import LoadingSpinner from '@/components/loading-spinner';
import { UtensilsIcon } from '@/components/icons';

export type PantryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: 'g' | 'kg' | 'l' | 'ml' | 'units';
};

type NutritionalInfoCache = {
  [key: string]: NutritionalInfoOutput | 'loading' | 'error';
};

const getScoreColor = (score: number) => {
    if (score <= 30) return 'bg-red-500';
    if (score <= 60) return 'bg-orange-500';
    return 'bg-green-500';
}

function PantrySummary({ items, language, infoCache }: { items: PantryItem[], language: string, infoCache: NutritionalInfoCache }) {
    const dict = useDictionary();
    const [advice, setAdvice] = useState<string | null>(null);
    const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
    
    const scores = useMemo(() => items.map(item => {
        const info = infoCache[item.name.toLowerCase()];
        return (typeof info === 'object' && info.nutritionalScore) ? info.nutritionalScore : null;
    }).filter(score => score !== null) as number[], [items, infoCache]);

    const averageScore = useMemo(() => {
        if (scores.length === 0) return 0;
        const totalScore = scores.reduce((acc, score) => acc + score, 0);
        return Math.round(totalScore / scores.length);
    }, [scores]);

    const allItemsHaveScores = useMemo(() => {
      if (items.length === 0) return false;
      return items.every(item => {
        const info = infoCache[item.name.toLowerCase()];
        return info && (typeof info === 'object' || info === 'error');
      });
    }, [items, infoCache]);

    useEffect(() => {
        const fetchAdvice = async () => {
            if (!dict) return;
            setIsLoadingAdvice(true);
            const itemNames = items.map(i => i.name);
            const result = await handleGeneratePantryAdvice(itemNames, averageScore, language);
            if (result.advice) {
                setAdvice(result.advice);
            } else if (result.error) {
                setAdvice(dict.pantry.errorFetchingInfo)
            }
            setIsLoadingAdvice(false);
        };
        
        if (allItemsHaveScores && items.length > 0) {
            fetchAdvice();
        } else if (items.length === 0 && dict) {
            setAdvice(dict.pantry.startByAddingItems);
            setIsLoadingAdvice(false);
        }
    }, [allItemsHaveScores, items, averageScore, language, dict]);
    
    if (!dict) return null;
    
    const someItemsLoading = Object.values(infoCache).some(v => v === 'loading');
    const showAdviceLoader = isLoadingAdvice || (someItemsLoading && items.length > 0);
    const showScoreLoader = (someItemsLoading && items.length > 0) || (items.length > 0 && !allItemsHaveScores);


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
                        {showScoreLoader ? (
                             <Skeleton className="h-6 w-full" />
                        ) : (
                            <>
                            <Progress value={averageScore} className="w-full" />
                            <span className={cn("text-lg font-bold text-white px-3 py-1 rounded-md", getScoreColor(averageScore))}>
                                {scores.length > 0 ? `${averageScore}/100` : 'N/A'}
                            </span>
                            </>
                        )}
                    </div>
                </div>
                <div>
                    <Label>{dict.pantry.aiTips}</Label>
                    {showAdviceLoader ? (
                        <div className="space-y-2 mt-1">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground mt-1 bg-secondary p-3 rounded-md">{advice}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}


function NutritionalInfo({ item, language, infoCache }: { item: PantryItem; language: string; infoCache: NutritionalInfoCache; }) {
  const dict = useDictionary();
  const cacheKey = item.name.toLowerCase();
  const info = infoCache[cacheKey];
  const isLoading = info === 'loading';
  const isError = info === 'error';

  if (!dict) return null;
  
  const content = () => {
    if (isLoading) {
        return (
            <div className="flex items-center space-x-4 p-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
        );
    }
    if (isError) {
        return (
             <Alert variant="destructive" className="mt-2 text-xs">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{dict.photoAnalysis.errorTitle}</AlertTitle>
                <AlertDescription>{dict.pantry.errorFetchingInfo}</AlertDescription>
            </Alert>
        );
    }
    if (info && typeof info === 'object') {
        return (
            <div className="space-y-4 pl-2 text-sm">
                <p className="text-muted-foreground">{info.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <h4 className="font-semibold mb-2">{dict.pantry.macros} (per 100g)</h4>
                        <ul>
                          <li><strong>{dict.pantry.calories}:</strong> {info.calories}</li>
                          <li><strong>{dict.pantry.protein}:</strong> {info.protein}g</li>
                          <li><strong>{dict.pantry.carbs}:</strong> {info.carbohydrates}g</li>
                          <li><strong>{dict.pantry.fat}:</strong> {info.fat}g</li>
                        </ul>
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
        );
    }
    return null;
  }

  return (
    <AccordionItem value={item.id} className="border-none">
      <AccordionTrigger className="group justify-start gap-2 py-1 text-xs text-muted-foreground hover:no-underline">
        <div className="flex items-center gap-1">
            <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            {dict.pantry.nutritionalInfo}
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-2">
        {content()}
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
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const fetchNutritionalInfo = useCallback(async (item: PantryItem, language: string) => {
    const cacheKey = item.name.toLowerCase();
    
    setInfoCache(prev => ({...prev, [cacheKey]: 'loading'}));

    const result = await handleGetNutritionalInfo(item.name, language);

    setInfoCache(prev => ({
        ...prev,
        [cacheKey]: result.error ? 'error' : result.data!
    }));
  }, []);

  const loadPantryItems = useCallback(() => {
    setIsLoading(true);
    const storedPantry = localStorage.getItem('pantryItems');
    const loadedItems: PantryItem[] = storedPantry ? JSON.parse(storedPantry) : [];
    setPantryItems(loadedItems);
    setIsLoading(false);
    return loadedItems;
  }, []);

  useEffect(() => {
    if (dict) {
      const loadedItems = loadPantryItems();
      const itemsToFetch = loadedItems.filter(item => !infoCache[item.name.toLowerCase()]);
      Promise.all(itemsToFetch.map(item => fetchNutritionalInfo(item, dict.lang)));
    }
  }, [dict, loadPantryItems, fetchNutritionalInfo, infoCache]);

  const handleRemoveItem = (itemToRemoveId: string) => {
    const updatedItems = pantryItems.filter((item) => item.id !== itemToRemoveId);
    localStorage.setItem('pantryItems', JSON.stringify(updatedItems));
    setPantryItems(updatedItems);

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
    
    const updatedItem = { ...currentItem, name, quantity, unit };
    const updatedItems = pantryItems.map((item) =>
      item.id === currentItem.id ? updatedItem : item
    );
    localStorage.setItem('pantryItems', JSON.stringify(updatedItems));
    setPantryItems(updatedItems);
    
    const oldItemName = currentItem.name.toLowerCase();
    if(oldItemName !== updatedItem.name.toLowerCase()){
         setInfoCache(prev => {
            const newCache = {...prev};
            delete newCache[oldItemName];
            return newCache;
        });
        if (dict) {
           fetchNutritionalInfo(updatedItem, dict.lang);
        }
    }

    setIsEditDialogOpen(false);
    setCurrentItem(null);
    toast({
      title: dict.pantry.toastTitle,
      description: dict.pantry.toastDescription,
    });
  };
  
  const renderHealthScore = (item: PantryItem) => {
    const info = infoCache[item.name.toLowerCase()];

    if (info === 'loading') {
        return <Skeleton className="h-6 w-12 rounded-md" />;
    }
    
    if (info && typeof info === 'object') {
        return (
            <span className={cn("text-sm font-bold text-white px-2 py-1 rounded-md", getScoreColor(info.nutritionalScore))}>
                {info.nutritionalScore}/100
            </span>
        )
    }

    return null;
  }
  
  const totalPages = Math.ceil(pantryItems.length / itemsPerPage);
  const paginatedItems = pantryItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };


  if (!dict) return null;

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-96">
            <LoadingSpinner icon={<UtensilsIcon className="h-10 w-10 text-primary" />} text={dict.photoAnalysis.loading} />
        </div>
    );
  }

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
      
      <PantrySummary items={pantryItems} language={dict.lang} infoCache={infoCache} />

      <Card>
        <CardHeader>
          <CardTitle>{dict.pantry.currentItemsTitle}</CardTitle>
          <CardDescription>{dict.pantry.currentItemsDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          {paginatedItems.length > 0 ? (
             <div className="w-full space-y-2">
              {paginatedItems.map((item) => (
                 <div key={item.id} className="p-3 rounded-md bg-secondary transition-colors hover:bg-secondary/80">
                    <div className="flex justify-between items-center">
                        <div className="flex-1">
                            <span className="text-secondary-foreground font-semibold">{item.name}</span>
                            <p className="text-sm text-muted-foreground">{item.quantity} {dict.pantry.units_options[item.unit]}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {renderHealthScore(item)}
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
                    <Accordion type="single" collapsible className="w-full">
                        <NutritionalInfo item={item} language={dict.lang} infoCache={infoCache} />
                    </Accordion>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{dict.pantry.noItems}</p>
          )}
        </CardContent>
         {totalPages > 1 && (
          <div className="flex items-center justify-end gap-4 p-4 border-t">
              <span className="text-sm text-muted-foreground">
                {dict.pantry.page} {currentPage} {dict.pantry.of} {totalPages}
              </span>
              <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
              >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {dict.pantry.previousPage}
              </Button>
              <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
              >
                  {dict.pantry.nextPage}
                  <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
          </div>
        )}
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
