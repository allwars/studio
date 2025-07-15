'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDictionary } from '@/hooks/use-dictionary';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, List, AlertCircle, ShoppingBasket, ClipboardPaste } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleAnalyzeReceipt } from './actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

export default function AddToPantryPage() {
  const dict = useDictionary();
  const { toast } = useToast();
  const router = useRouter();
  
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [receiptText, setReceiptText] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedItems, setExtractedItems] = useState<string[] | null>(null);
  
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
      setExtractedItems(result.items || []);
    }
    
    setIsLoading(false);
  };
  
  const handleAddItemsToPantry = () => {
    if (extractedItems) {
      const storedItems = localStorage.getItem('pantryItems');
      const pantryItems = storedItems ? JSON.parse(storedItems) : [];
      
      const newItems = extractedItems.filter(item => !pantryItems.includes(item));
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
                <ul className="space-y-2">
                    {extractedItems.map((item, index) => (
                    <li key={index} className="flex items-center justify-between p-2 rounded-md bg-secondary">
                        <span className="text-secondary-foreground">{item}</span>
                    </li>
                    ))}
                </ul>
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
