'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dumbbell, User, Mail, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDictionary } from '@/hooks/use-dictionary';
import { GoogleIcon } from '@/components/icons';

export default function SignupPage() {
  const router = useRouter();
  const dict = useDictionary();

  if (!dict) return null;

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/${dict.lang}/dashboard`);
  };

  const handleGoogleSignup = () => {
    router.push(`/${dict.lang}/dashboard`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="space-y-2 text-center">
          <Dumbbell className="mx-auto h-10 w-10 text-primary" />
          <CardTitle className="text-3xl font-bold font-headline">{dict.signup.title}</CardTitle>
          <CardDescription>{dict.signup.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">{dict.signup.fullNameLabel}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="full-name" placeholder="John Doe" required className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{dict.signup.emailLabel}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="m@example.com" required className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{dict.signup.passwordLabel}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="password" type="password" required className="pl-10" />
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                {dict.signup.createAccountButton}
              </Button>
              <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignup}>
                <GoogleIcon className="mr-2 h-4 w-4" />
                {dict.signup.googleSignupButton}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            {dict.signup.alreadyAccount}{' '}
            <Link href={`/${dict.lang}`} className="underline" prefetch={false}>
              {dict.signup.loginLink}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
