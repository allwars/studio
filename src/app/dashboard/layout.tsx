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
} from 'lucide-react';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/diet', label: 'Diet Plan', icon: UtensilsCrossed },
  { href: '/dashboard/meal-analysis', label: 'Meal Analysis', icon: Camera },
  { href: '/dashboard/progress-analysis', label: 'Progress Analysis', icon: Sparkles },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

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
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href} legacyBehavior passHref>
                      <SidebarMenuButton
                        isActive={pathname === item.href}
                        tooltip={item.label}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Link href="/" legacyBehavior passHref>
                    <SidebarMenuButton>
                        <LogOut />
                        <span>Logout</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
            <header className="flex items-center justify-between p-4 bg-card md:bg-transparent border-b md:border-none">
              <SidebarTrigger className="md:hidden" />
              <div className="flex items-center gap-4 ml-auto">
                 <span className="font-semibold">John Doe</span>
                 <Avatar>
                  <AvatarImage src="https://placehold.co/40x40.png" alt="User avatar" data-ai-hint="user avatar" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </div>
            </header>
            <main className="flex-1 p-4 md:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
