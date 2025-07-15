'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw, Timer as TimerIcon, Settings, History, Forward, Plus, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useDictionary } from '@/hooks/use-dictionary';
import { cn } from '@/lib/utils';

type TimerMode = 'FOR_TIME' | 'AMRAP' | 'EMOM' | 'TABATA' | 'CHRONO';

const Timer = () => {
  const dict = useDictionary()?.timer;
  const [mode, setMode] = useState<TimerMode>('FOR_TIME');

  // Timer state
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Configuration state
  const [isConfiguring, setIsConfiguring] = useState(true);

  // FOR_TIME settings
  const [forTimeLimit, setForTimeLimit] = useState(10 * 60); // 10 minutes
  const [forTimeRounds, setForTimeRounds] = useState(5);
  const [currentRound, setCurrentRound] = useState(0);


  // AMRAP settings
  const [amrapTime, setAmrapTime] = useState(20 * 60); // 20 minutes
  
  // EMOM settings
  const [emomInterval, setEmomInterval] = useState(60); // 1 minute
  const [emomRounds, setEmomRounds] = useState(10);

  // TABATA settings
  const [tabataWork, setTabataWork] = useState(20);
  const [tabataRest, setTabataRest] = useState(10);
  const [tabataRounds, setTabataRounds] = useState(8);

  const stopTimer = useCallback(() => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);
  
  // FOR_TIME mode logic
  useEffect(() => {
    if (mode === 'FOR_TIME' && isActive) {
      if (time >= forTimeLimit) {
        stopTimer();
      }
      if (currentRound >= forTimeRounds) {
        stopTimer();
      }
    }
  }, [time, currentRound, forTimeLimit, forTimeRounds, isActive, mode, stopTimer]);


  const handleStartPause = () => {
    if (isConfiguring) {
        // Reset state when starting a new timer
        setTime(0);
        setCurrentRound(0);
        setIsConfiguring(false);
        setIsActive(true);
    } else {
        setIsActive(!isActive);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setTime(0);
    setCurrentRound(0);
    setIsConfiguring(true);
  };
  
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const seconds = (timeInSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleNextRound = () => {
    if (currentRound < forTimeRounds) {
        setCurrentRound(prev => prev + 1);
    }
  }
  
  const renderConfiguration = () => {
    if (!dict) return null;
    return (
       <Tabs defaultValue="FOR_TIME" className="w-full" onValueChange={(value) => setMode(value as TimerMode)}>
        <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="FOR_TIME">{dict.for_time.title}</TabsTrigger>
            <TabsTrigger value="AMRAP">{dict.amrap.title}</TabsTrigger>
            <TabsTrigger value="EMOM">{dict.emom.title}</TabsTrigger>
            <TabsTrigger value="TABATA">{dict.tabata.title}</TabsTrigger>
            <TabsTrigger value="CHRONO">{dict.chrono.title}</TabsTrigger>
        </TabsList>
        <CardContent className="pt-6 space-y-4 text-center">
            <TabsContent value="FOR_TIME" className="space-y-4">
                 <p className="text-sm text-muted-foreground">{dict.for_time.description}</p>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 text-left">
                        <Label htmlFor="for-time-limit-min">{dict.labels.time_cap_min}</Label>
                        <Input id="for-time-limit-min" type="number" value={Math.floor(forTimeLimit / 60)} onChange={e => setForTimeLimit(parseInt(e.target.value) * 60 + (forTimeLimit % 60))} />
                    </div>
                     <div className="space-y-1 text-left">
                        <Label htmlFor="for-time-rounds">{dict.labels.rounds}</Label>
                        <Input id="for-time-rounds" type="number" value={forTimeRounds} onChange={e => setForTimeRounds(parseInt(e.target.value))} />
                    </div>
                 </div>
            </TabsContent>
            <TabsContent value="AMRAP" className="space-y-4">
                <p className="text-sm text-muted-foreground">{dict.amrap.description}</p>
                 <div className="space-y-1 text-left">
                    <Label htmlFor="amrap-time-min">{dict.labels.time_min}</Label>
                    <Input id="amrap-time-min" type="number" value={Math.floor(amrapTime / 60)} onChange={e => setAmrapTime(parseInt(e.target.value) * 60)} />
                </div>
            </TabsContent>
            <TabsContent value="EMOM" className="space-y-4">
                <p className="text-sm text-muted-foreground">{dict.emom.description}</p>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 text-left">
                        <Label htmlFor="emom-interval-sec">{dict.labels.every_sec}</Label>
                        <Input id="emom-interval-sec" type="number" value={emomInterval} onChange={e => setEmomInterval(parseInt(e.target.value))} />
                    </div>
                     <div className="space-y-1 text-left">
                        <Label htmlFor="emom-rounds">{dict.labels.rounds}</Label>
                        <Input id="emom-rounds" type="number" value={emomRounds} onChange={e => setEmomRounds(parseInt(e.target.value))} />
                    </div>
                 </div>
            </TabsContent>
            <TabsContent value="TABATA" className="space-y-4">
                 <p className="text-sm text-muted-foreground">{dict.tabata.description}</p>
                 <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1 text-left">
                        <Label htmlFor="tabata-work">{dict.labels.work}</Label>
                        <Input id="tabata-work" type="number" value={tabataWork} onChange={e => setTabataWork(parseInt(e.target.value))}/>
                    </div>
                     <div className="space-y-1 text-left">
                        <Label htmlFor="tabata-rest">{dict.labels.rest}</Label>
                        <Input id="tabata-rest" type="number" value={tabataRest} onChange={e => setTabataRest(parseInt(e.target.value))} />
                    </div>
                     <div className="space-y-1 text-left">
                        <Label htmlFor="tabata-rounds">{dict.labels.rounds}</Label>
                        <Input id="tabata-rounds" type="number" value={tabataRounds} onChange={e => setTabataRounds(parseInt(e.target.value))} />
                    </div>
                 </div>
            </TabsContent>
            <TabsContent value="CHRONO" className="space-y-4">
                 <p className="text-sm text-muted-foreground">{dict.chrono.description}</p>
            </TabsContent>
            
            <Button onClick={handleStartPause} size="lg" className="w-full">
                <Play className="mr-2" />
                {dict.start_button}
            </Button>
        </CardContent>
       </Tabs>
    )
  }

  const renderActiveTimer = () => {
    if (!dict) return null;

    const isFinished = mode === 'FOR_TIME' && currentRound >= forTimeRounds;

    const renderRounds = () => {
        if (mode !== 'FOR_TIME') return null;
        return (
            <div className="flex flex-col items-center justify-center gap-4 p-4 border-r">
                <div className="text-center">
                    <CardDescription>{dict.labels.rounds}</CardDescription>
                    <div className="text-6xl font-bold text-secondary-foreground" suppressHydrationWarning>
                        {currentRound} <span className="text-4xl text-muted-foreground">/ {forTimeRounds}</span>
                    </div>
                </div>
                 <Button onClick={handleNextRound} disabled={!isActive || isFinished} className="w-full">
                    <Plus className="mr-2"/> {dict.next_round_button}
                </Button>
            </div>
        )
    }

    return (
         <CardContent className="grid grid-cols-1 md:grid-cols-2 p-0">
             {renderRounds()}
             <div className={cn("flex flex-col items-center justify-center gap-4 p-6", mode !== 'FOR_TIME' && "md:col-span-2")}>
                <CardDescription className="font-semibold text-lg">{isFinished ? dict.finished : dict[mode.toLowerCase()]?.title || 'Workout Timer'}</CardDescription>
                <div className={cn(
                        "text-8xl font-bold font-mono tabular-nums",
                        isFinished ? 'text-green-500' : 'text-primary'
                    )}
                    suppressHydrationWarning
                >
                {isFinished ? <Check size={80} /> : formatTime(time)}
                </div>
                 <div className="flex gap-2">
                    <Button onClick={handleStartPause} size="lg" className="w-32 bg-accent hover:bg-accent/80 text-accent-foreground" disabled={isFinished}>
                        {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                        {isActive ? dict.pause_button : dict.start_button}
                    </Button>
                    <Button onClick={handleReset} variant="outline" size="lg" className="w-32">
                        <RefreshCw className="mr-2" />
                        {dict.reset_button}
                    </Button>
                </div>
            </div>
        </CardContent>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TimerIcon className="h-6 w-6" />
          {dict?.title || "Workout Timer"}
        </CardTitle>
        <CardDescription>{dict?.description || "Select a timer type and start your workout."}</CardDescription>
      </CardHeader>
      {isConfiguring ? renderConfiguration() : renderActiveTimer()}
    </Card>
  );
};

export default Timer;
