import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProfilePage() {
  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold font-headline">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account information.</p>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Update your personal details here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="https://placehold.co/80x80.png" alt="User avatar" data-ai-hint="user avatar"/>
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <Button variant="outline">Change Photo</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input id="full-name" defaultValue="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="john.doe@example.com" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
             <Button variant="destructive">Logout</Button>
            <Button className="bg-primary hover:bg-primary/90">Update Profile</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
