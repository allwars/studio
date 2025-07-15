'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDictionary } from '@/hooks/use-dictionary';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, List, AlertCircle, ShoppingBasket, ClipboardPaste, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleAnalyzeReceipt } from './actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import type { PantryItem } from '../page';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ExtractedItem = {
  id: string;
  name: string;
  quantity: number;
  unit: PantryItem['unit'];
};

export default function AddToPantryPage() {
  const dict = useDictionary();
  const { toast } = useToast();
  const router = useRouter();
  
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [receiptText, setReceiptText] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[] | null>(null);
  
  if (!dict) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setReceiptImage(selectedFile);
      setExtractedItems(null);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAnalysis = async (type: 'photo' | 'text') => {
    setIsLoading(true);
    setError(null);
    setExtractedItems(null);

    const input = type === 'photo' 
      ? { photoDataUri: previewUrl, language: dict.lang } 
      : { text: receiptText, language: dict.lang };
      
    if ((type === 'photo' && !input.photoDataUri) || (type === 'text' && !input.text)) {
        setError(dict.addToPantry.noInputError);
        setIsLoading(false);
        return;
    }

    const result = await handleAnalyzeReceipt(input);
    
    if (result.error) {
      setError(result.error);
    } else {
       const itemsToEdit: ExtractedItem[] = (result.items || []).map(name => ({
        id: crypto.randomUUID(),
        name,
        quantity: 1,
        unit: 'units'
       }));
       setExtractedItems(itemsToEdit);
    }
    
    setIsLoading(false);
  };

  const handleItemChange = (id: string, field: keyof Omit<ExtractedItem, 'id'>, value: string | number) => {
    if (!extractedItems) return;
    const newItems = extractedItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setExtractedItems(newItems);
  }

  const handleRemoveItem = (id: string) => {
     if (!extractedItems) return;
     setExtractedItems(extractedItems.filter(item => item.id !== id));
  }
  
  const handleAddItemsToPantry = () => {
    if (extractedItems) {
      const storedItems = localStorage.getItem('pantryItems');
      let pantryItems: PantryItem[] = [];
      if (storedItems) {
        try {
            const parsed = JSON.parse(storedItems);
            // Check if it's the new format
            if(Array.isArray(parsed) && parsed.every(i => i.id && i.name)) {
                pantryItems = parsed;
            }
        } catch (e) { console.error(e) }
      }
      
      const newItems: PantryItem[] = extractedItems.map(({id, name, quantity, unit}) => ({ id, name, quantity, unit }));
      const updatedItems = [...pantryItems, ...newItems];

      localStorage.setItem('pantryItems', JSON.stringify(updatedItems));
      
      toast({
        title: dict.addToPantry.toastTitle,
        description: dict.addToPantry.toastDescription,
      });
      router.push(`/${dict.lang}/dashboard/pantry`);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <ShoppingBasket /> {dict.addToPantry.title}
        </h1>
        <p className="text-muted-foreground">{dict.addToPantry.description}</p>
      </div>

      <Tabs defaultValue="photo" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="photo"><Upload className="mr-2"/>{dict.addToPantry.photoTab}</TabsTrigger>
          <TabsTrigger value="text"><ClipboardPaste className="mr-2"/>{dict.addToPantry.textTab}</TabsTrigger>
        </TabsList>
        <TabsContent value="photo">
          <Card>
            <CardHeader>
              <CardTitle>{dict.addToPantry.photoTitle}</CardTitle>
              <CardDescription>{dict.addToPantry.photoDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="photo-upload">{dict.addToPantry.uploadLabel}</Label>
                <Input id="photo-upload" type="file" accept="image/*" onChange={handleFileChange} />
              </div>
              <Button onClick={() => handleAnalysis('photo')} disabled={!receiptImage || isLoading}>
                {isLoading ? dict.addToPantry.analyzingButton : dict.addToPantry.analyzeButton}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="text">
          <Card>
            <CardHeader>
              <CardTitle>{dict.addToPantry.textTitle}</CardTitle>
              <CardDescription>{dict.addToPantry.textDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="receipt-text">{dict.addToPantry.pasteLabel}</Label>
                <Textarea 
                  placeholder={dict.addToPantry.pastePlaceholder} 
                  id="receipt-text"
                  value={receiptText}
                  onChange={(e) => setReceiptText(e.target.value)}
                  rows={10}
                />
              </div>
              <Button onClick={() => handleAnalysis('text')} disabled={!receiptText || isLoading}>
                {isLoading ? dict.addToPantry.analyzingButton : dict.addToPantry.analyzeButton}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {isLoading && (
         <Card>
            <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
            </CardContent>
         </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{dict.photoAnalysis.errorTitle}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {extractedItems && (
        <Card>
            <CardHeader>
                <CardTitle>{dict.addToPantry.extractedTitle}</CardTitle>
                <CardDescription>{dict.addToPantry.extractedDescription}</CardDescription>
            </CardHeader>
            <CardContent>
                {extractedItems.length > 0 ? (
                <div className="space-y-4">
                    {extractedItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end p-2 rounded-md bg-secondary">
                        <div className="md:col-span-2">
                            <Label htmlFor={`name-${item.id}`}>{dict.pantry.itemLabel}</Label>
                            <Input id={`name-${item.id}`} value={item.name} onChange={e => handleItemChange(item.id, 'name', e.target.value)} />
                        </div>
                        <div>
                             <Label htmlFor={`quantity-${item.id}`}>{dict.pantry.quantity}</Label>
                            <Input id={`quantity-${item.id}`} type="number" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', e.target.valueAsNumber)} />
                        </div>
                         <div className="flex items-end gap-1">
                            <div>
                                <Label htmlFor={`unit-${item.id}`}>{dict.pantry.unit}</Label>
                                <Select value={item.unit} onValueChange={value => handleItemChange(item.id, 'unit', value)}>
                                    <SelectTrigger id={`unit-${item.id}`}>
                                        <SelectValue />
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
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}><X className="text-destructive"/></Button>
                        </div>
                    </div>
                    ))}
                </div>
                ) : (
                <p className="text-muted-foreground">{dict.addToPantry.noItemsFound}</p>
                )}
            </CardContent>
            {extractedItems.length > 0 && (
                <div className="p-6 pt-0">
                    <Button onClick={handleAddItemsToPantry}>{dict.addToPantry.addButton}</Button>
                </div>
            )}
        </Card>
      )}
    </div>
  );
}
