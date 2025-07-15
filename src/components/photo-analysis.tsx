'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, AlertCircle, Sparkles } from 'lucide-react';
import { useDictionary } from '@/hooks/use-dictionary';

type AnalysisResult = {
  summary: string | null;
  analysis?: string | null;
  error?: string | null;
};

interface PhotoAnalysisProps {
  title: string;
  description: string;
  onAnalyze: (photoDataUri: string) => Promise<AnalysisResult>;
}

export default function PhotoAnalysis({ title, description, onAnalyze }: PhotoAnalysisProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dict = useDictionary();

  if (!dict) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAnalysis = async () => {
    if (!file || !previewUrl) {
      setError(dict.photoAnalysis.selectPhotoError);
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const analysisResult = await onAnalyze(previewUrl);
      if (analysisResult.error) {
        setError(analysisResult.error);
      } else {
        setResult(analysisResult);
      }
    } catch (e) {
      setError(dict.photoAnalysis.unexpectedError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="photo-upload">{dict.photoAnalysis.uploadLabel}</Label>
              <Input id="photo-upload" type="file" accept="image/*" onChange={handleFileChange} />
            </div>
            {previewUrl && (
              <div className="relative w-full max-w-lg mx-auto aspect-video rounded-lg overflow-hidden border">
                <Image src={previewUrl} alt="Selected preview" layout="fill" objectFit="contain" />
              </div>
            )}
            <Button onClick={handleAnalysis} disabled={!file || loading} size="lg">
              {loading ? (
                <>
                  <Skeleton className="h-5 w-5 mr-2 animate-spin" />
                  {dict.photoAnalysis.analyzingButton}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  {dict.photoAnalysis.analyzeButton}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{dict.photoAnalysis.errorTitle}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <Card>
          <CardHeader>
            <CardTitle>{dict.photoAnalysis.inProgressTitle}</CardTitle>
            <CardDescription>{dict.photoAnalysis.inProgressDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      )}

      {result && (result.summary || result.analysis) && (
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              {dict.photoAnalysis.resultTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.analysis && (
                <div>
                    <h3 className="font-semibold text-lg">{dict.photoAnalysis.detailedAnalysisLabel}</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{result.analysis}</p>
                </div>
            )}
            {result.summary && (
                <div>
                    <h3 className="font-semibold text-lg">{dict.photoAnalysis.summaryLabel}</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{result.summary}</p>

                </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
