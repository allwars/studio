'use client';

import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDictionary } from '@/hooks/use-dictionary';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

type ProfileData = {
  fullName: string;
  email: string;
  avatar: string;
};

type Measurements = {
  weight: string;
  height: string;
  neck: string;
  chest: string;
  waist: string;
  hips: string;
  bicep: string;
  thigh: string;
};

export default function ProfilePage() {
  const dict = useDictionary();
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData>({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://placehold.co/80x80.png',
  });

  const [measurements, setMeasurements] = useState<Measurements>({
    weight: '', height: '', neck: '', chest: '', waist: '', hips: '', bicep: '', thigh: '',
  });

  useEffect(() => {
    const storedMeasurements = localStorage.getItem('userMeasurements');
    if (storedMeasurements) {
      setMeasurements(JSON.parse(storedMeasurements));
    }
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };
  
  const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMeasurements(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    localStorage.setItem('userMeasurements', JSON.stringify(measurements));
    toast({
      title: dict?.profile.updateSuccessTitle,
      description: dict?.profile.updateSuccessDescription,
    });
  };

  const handleLogout = () => {
    if (dict) {
      router.push(`/${dict.lang}`);
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  if (!dict) return null;

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold font-headline">{dict.profile.title}</h1>
            <p className="text-muted-foreground">{dict.profile.description}</p>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>{dict.profile.yourProfileTitle}</CardTitle>
          <CardDescription>{dict.profile.yourProfileDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar} alt="User avatar" data-ai-hint="user avatar"/>
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
            <Button variant="outline" onClick={triggerFileSelect}>{dict.profile.changePhoto}</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full-name">{dict.profile.fullName}</Label>
              <Input id="full-name" name="fullName" value={profile.fullName} onChange={handleProfileChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{dict.profile.email}</Label>
              <Input id="email" name="email" type="email" value={profile.email} onChange={handleProfileChange} />
            </div>
          </div>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>{dict.profile.measurementsTitle}</CardTitle>
          <CardDescription>{dict.profile.measurementsDescription}</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="weight">{dict.profile.weight}</Label>
                    <Input id="weight" name="weight" type="number" value={measurements.weight} onChange={handleMeasurementChange} placeholder="80" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="height">{dict.profile.height}</Label>
                    <Input id="height" name="height" type="number" value={measurements.height} onChange={handleMeasurementChange} placeholder="175" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="neck">{dict.profile.neck}</Label>
                    <Input id="neck" name="neck" type="number" value={measurements.neck} onChange={handleMeasurementChange} placeholder="40" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="chest">{dict.profile.chest}</Label>
                    <Input id="chest" name="chest" type="number" value={measurements.chest} onChange={handleMeasurementChange} placeholder="102" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="waist">{dict.profile.waist}</Label>
                    <Input id="waist" name="waist" type="number" value={measurements.waist} onChange={handleMeasurementChange} placeholder="85" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="hips">{dict.profile.hips}</Label>
                    <Input id="hips" name="hips" type="number" value={measurements.hips} onChange={handleMeasurementChange} placeholder="95" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="bicep">{dict.profile.bicep}</Label>
                    <Input id="bicep" name="bicep" type="number" value={measurements.bicep} onChange={handleMeasurementChange} placeholder="35" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="thigh">{dict.profile.thigh}</Label>
                    <Input id="thigh" name="thigh" type="number" value={measurements.thigh} onChange={handleMeasurementChange} placeholder="60" />
                </div>
            </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end gap-2">
         <Button variant="destructive" onClick={handleLogout}>{dict.profile.logout}</Button>
        <Button className="bg-primary hover:bg-primary/90" onClick={handleSave}>{dict.profile.updateProfile}</Button>
      </div>
    </div>
  );
}
