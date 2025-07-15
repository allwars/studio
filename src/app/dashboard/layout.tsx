'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Camera,
  Sparkles,
  User,
  LogOut,
  Dumbbell,
  Languages,
  ShoppingBasket,
  Timer as TimerIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDictionary } from '@/hooks/use-dictionary';
import { useEffect, useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const dict = useDictionary();
  const [userProfile, setUserProfile] = useState({ fullName: 'John Doe', avatar: 'https://placehold.co/40x40.png' });

  useEffect(() => {
    // This effect will run on the client side, ensuring localStorage is available.
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile));
    }
    
    // Listen for storage changes to update the avatar in the layout
    const handleStorageChange = () => {
        const updatedProfile = localStorage.getItem('userProfile');
        if(updatedProfile) {
            setUserProfile(JSON.parse(updatedProfile));
        }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };

  }, []);


  if (!dict) {
    return null; // Or a loading state
  }
  
  const menuItems = [
    { href: '/dashboard', label: dict.sidebar.dashboard, icon: LayoutDashboard },
    { href: '/dashboard/diet', label: dict.sidebar.dietPlan, icon: UtensilsCrossed },
    { href: '/dashboard/pantry', label: dict.sidebar.pantry, icon: ShoppingBasket },
    { href: '/dashboard/workout-timer', label: dict.sidebar.workoutTimer, icon: TimerIcon },
    { href: '/dashboard/meal-analysis', label: dict.sidebar.mealAnalysis, icon: Camera },
    { href: '/dashboard/progress-analysis', label: dict.sidebar.progressAnalysis, icon: Sparkles },
    { href: '/dashboard/profile', label: dict.sidebar.profile, icon: User },
  ];

  const currentLang = pathname.split('/')[1];
  const targetPath = (targetLocale: string) => {
    const pathParts = pathname.split('/');
    pathParts[1] = targetLocale;
    return pathParts.join('/');
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarContent className="flex flex-col justify-between">
            <div>
              <SidebarHeader className="p-4">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Dumbbell className="w-8 h-8 text-primary-foreground" />
                  <span className="text-xl font-bold text-primary-foreground font-headline">Move2Health</span>
                </Link>
              </SidebarHeader>
              <SidebarMenu>
                {menuItems.map((item) => {
                    // Adjust href for i18n
                    const localizedHref = `/${currentLang}${item.href}`;
                    const isActive = pathname === localizedHref || (item.href === '/dashboard' && pathname === `/${currentLang}`);
                    
                    return (
                        <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={item.label}
                        >
                            <Link href={localizedHref}>
                                <item.icon />
                                <span>{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
              </SidebarMenu>
            </div>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href={`/${currentLang}`}>
                        <LogOut />
                        <span>{dict.sidebar.logout}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
            <header className="flex items-center justify-between p-4 bg-card md:bg-transparent border-b md:border-none">
              <SidebarTrigger className="md:hidden" />
              <div className="flex items-center gap-4 ml-auto">
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Languages className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={targetPath('en')} prefetch={false}>English</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                       <Link href={targetPath('es')} prefetch={false}>Español</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                 <span className="font-semibold">{userProfile.fullName}</span>
                 <Avatar>
                  <AvatarImage src={userProfile.avatar} alt="User avatar" data-ai-hint="user avatar" />
                  <AvatarFallback>{getInitials(userProfile.fullName)}</AvatarFallback>
                </Avatar>
              </div>
            </header>
            <main className="flex-1 p-4 md:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
