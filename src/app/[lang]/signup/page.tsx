'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dumbbell, User, Mail, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDictionary } from '@/hooks/use-dictionary';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-1.5c-1 0-1.5.5-1.5 1.5V12h3l-.5 3h-2.5v6.98c4.56-.93 8-4.96 8-9.8z" />
    </svg>
  );
}

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
