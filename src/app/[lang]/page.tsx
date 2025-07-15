'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dumbbell, Mail, Lock, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDictionary } from '@/hooks/use-dictionary';
import { GoogleIcon } from '@/components/icons';
import { FormEvent, useState } from 'react';
import { handleEmailLogin, handleGoogleLogin } from '@/lib/firebase/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import LoadingSpinner from '@/components/loading-spinner';

export default function LoginPage() {
  const router = useRouter();
  const dict = useDictionary();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!dict) return null;

  const onLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const result = await handleEmailLogin(email, password);
    if (result.error) {
      setError(result.error);
    } else {
      router.push(`/${dict.lang}/dashboard`);
    }
    setIsLoading(false);
  };
  
  const onGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    const result = await handleGoogleLogin();
    if (result.error) {
        setError(result.error);
    } else {
        router.push(`/${dict.lang}/dashboard`);
    }
    setIsLoading(false);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="space-y-2 text-center">
          <Dumbbell className="mx-auto h-10 w-10 text-primary" />
          <CardTitle className="text-3xl font-bold font-headline">{dict.login.title}</CardTitle>
          <CardDescription>{dict.login.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onLogin}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{dict.login.emailLabel}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="email" name="email" type="email" placeholder="m@example.com" required className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="password">{dict.login.passwordLabel}</Label>
                  <Link href="#" className="ml-auto inline-block text-sm underline" prefetch={false}>
                    {dict.login.forgotPassword}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="password" name="password" type="password" required className="pl-10" suppressHydrationWarning />
                </div>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{dict.photoAnalysis.errorTitle}</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? <LoadingSpinner text={dict.login.loginButton} /> : dict.login.loginButton}
              </Button>
              <Button variant="outline" className="w-full" type="button" onClick={onGoogleLogin} disabled={isLoading}>
                {isLoading ? <LoadingSpinner text={dict.login.googleLoginButton} /> : (
                  <>
                    <GoogleIcon className="mr-2 h-4 w-4" />
                    {dict.login.googleLoginButton}
                  </>
                )}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            {dict.login.noAccount}{' '}
            <Link href={`/${dict.lang}/signup`} className="underline" prefetch={false}>
              {dict.login.signUpLink}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
