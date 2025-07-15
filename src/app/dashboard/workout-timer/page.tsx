
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw, Timer as TimerIcon, Plus, Check, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useDictionary } from '@/hooks/use-dictionary';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


type TimerMode = 'FOR_TIME' | 'AMRAP' | 'EMOM' | 'TABATA' | 'CHRONO';

export default function WorkoutTimerPage() {
  const dict = useDictionary();
  const timerDict = dict?.timer;
  const [mode, setMode] = useState<TimerMode>('FOR_TIME');

  // Timer state
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Configuration state
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  // FOR_TIME settings
  const [forTimeLimit, setForTimeLimit] = useState(10 * 60); // 10 minutes
  const [forTimeRounds, setForTimeRounds] = useState(5);
  const [currentRound, setCurrentRound] = useState(0);
  const [lapTimes, setLapTimes] = useState<number[]>([]);

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

  // Main timer tick
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
  
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const seconds = (timeInSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };
  
  // Logic for stopping timers
  useEffect(() => {
    if (!isActive) return;

    // FOR_TIME stop conditions
    if (mode === 'FOR_TIME' && currentRound >= forTimeRounds) {
        stopTimer();
        setIsFinished(true);
    }

    // AMRAP stop condition
    if (mode === 'AMRAP') {
        if (time >= amrapTime) {
            stopTimer();
            setIsFinished(true);
        }
    }
    // Note: EMOM and TABATA would have more complex interval logic
    
  }, [time, currentRound, isActive, mode, stopTimer, forTimeRounds, amrapTime]);


  const handleStartPause = () => {
    if (isConfiguring) {
        // Reset state when starting a new timer
        setTime(0);
        setCurrentRound(0);
        setLapTimes([]);
        setIsConfiguring(false);
        setIsFinished(false);
        setIsActive(true);
    } else {
        setIsActive(!isActive);
    }
  };

  const handleReset = () => {
    stopTimer();
    setTime(0);
    setCurrentRound(0);
    setLapTimes([]);
    setIsConfiguring(true);
    setIsFinished(false);
  };
  
  const handleNextRound = () => {
    const canAddRound = mode === 'FOR_TIME' ? currentRound < forTimeRounds : true;
    if (isActive && canAddRound) {
        setLapTimes(prev => [...prev, time]);
        setCurrentRound(prev => prev + 1);
    }
  }

  if (!dict || !timerDict) return null; // or a loading skeleton
  
  const renderConfiguration = () => {
    return (
       <Tabs defaultValue="FOR_TIME" className="w-full" onValueChange={(value) => setMode(value as TimerMode)}>
        <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="FOR_TIME">{timerDict.for_time.title}</TabsTrigger>
            <TabsTrigger value="AMRAP">{timerDict.amrap.title}</TabsTrigger>
            <TabsTrigger value="EMOM">{timerDict.emom.title}</TabsTrigger>
            <TabsTrigger value="TABATA">{timerDict.tabata.title}</TabsTrigger>
            <TabsTrigger value="CHRONO">{timerDict.chrono.title}</TabsTrigger>
        </TabsList>
        <CardContent className="pt-6 space-y-4 text-center">
            <TabsContent value="FOR_TIME" className="space-y-4">
                 <p className="text-sm text-muted-foreground">{timerDict.for_time.description}</p>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 text-left">
                        <Label htmlFor="for-time-limit-min">{timerDict.labels.time_cap_min}</Label>
                        <Input id="for-time-limit-min" type="number" value={Math.floor(forTimeLimit / 60)} onChange={e => setForTimeLimit(parseInt(e.target.value) * 60 + (forTimeLimit % 60))} />
                    </div>
                     <div className="space-y-1 text-left">
                        <Label htmlFor="for-time-rounds">{timerDict.labels.rounds}</Label>
                        <Input id="for-time-rounds" type="number" value={forTimeRounds} onChange={e => setForTimeRounds(parseInt(e.target.value))} />
                    </div>
                 </div>
            </TabsContent>
            <TabsContent value="AMRAP" className="space-y-4">
                <p className="text-sm text-muted-foreground">{timerDict.amrap.description}</p>
                 <div className="space-y-1 text-left">
                    <Label htmlFor="amrap-time-min">{timerDict.labels.time_min}</Label>
                    <Input id="amrap-time-min" type="number" value={Math.floor(amrapTime / 60)} onChange={e => setAmrapTime(parseInt(e.target.value) * 60)} />
                </div>
            </TabsContent>
            <TabsContent value="EMOM" className="space-y-4">
                <p className="text-sm text-muted-foreground">{timerDict.emom.description}</p>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 text-left">
                        <Label htmlFor="emom-interval-sec">{timerDict.labels.every_sec}</Label>
                        <Input id="emom-interval-sec" type="number" value={emomInterval} onChange={e => setEmomInterval(parseInt(e.target.value))} />
                    </div>
                     <div className="space-y-1 text-left">
                        <Label htmlFor="emom-rounds">{timerDict.labels.rounds}</Label>
                        <Input id="emom-rounds" type="number" value={emomRounds} onChange={e => setEmomRounds(parseInt(e.target.value))} />
                    </div>
                 </div>
            </TabsContent>
            <TabsContent value="TABATA" className="space-y-4">
                 <p className="text-sm text-muted-foreground">{timerDict.tabata.description}</p>
                 <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1 text-left">
                        <Label htmlFor="tabata-work">{timerDict.labels.work}</Label>
                        <Input id="tabata-work" type="number" value={tabataWork} onChange={e => setTabataWork(parseInt(e.target.value))}/>
                    </div>
                     <div className="space-y-1 text-left">
                        <Label htmlFor="tabata-rest">{timerDict.labels.rest}</Label>
                        <Input id="tabata-rest" type="number" value={tabataRest} onChange={e => setTabataRest(parseInt(e.target.value))} />
                    </div>
                     <div className="space-y-1 text-left">
                        <Label htmlFor="tabata-rounds">{timerDict.labels.rounds}</Label>
                        <Input id="tabata-rounds" type="number" value={tabataRounds} onChange={e => setTabataRounds(parseInt(e.target.value))} />
                    </div>
                 </div>
            </TabsContent>
            <TabsContent value="CHRONO" className="space-y-4">
                 <p className="text-sm text-muted-foreground">{timerDict.chrono.description}</p>
            </TabsContent>
            
            <Button onClick={handleStartPause} size="lg" className="w-full">
                <Play className="mr-2" />
                {timerDict.start_button}
            </Button>
        </CardContent>
       </Tabs>
    )
  }

  const renderActiveTimer = () => {
    const timeToDisplay = mode === 'AMRAP' ? amrapTime - time : time;
    const finalTime = formatTime(time);
    
    let summaryMessage = '';
    if (isFinished) {
        if (mode === 'FOR_TIME') {
            summaryMessage = `${timerDict.finished} ${currentRound}/${forTimeRounds} ${timerDict.labels.rounds.toLowerCase()} ${timerDict.labels.in} ${finalTime}`;
        } else if (mode === 'AMRAP') {
            summaryMessage = `${timerDict.finished} ${currentRound} ${timerDict.labels.rounds.toLowerCase()}`;
        } else {
             summaryMessage = `${timerDict.finished} ${timerDict.labels.time}: ${finalTime}`;
        }
    }

    const renderRounds = () => {
        if (mode !== 'FOR_TIME' && mode !== 'AMRAP') return null;

        const maxRounds = mode === 'FOR_TIME' ? forTimeRounds : '∞';
        const canAddRound = mode === 'FOR_TIME' ? currentRound < forTimeRounds : true;

        return (
            <div className="flex flex-col items-center justify-center gap-4 p-4 border-r">
                <div className="text-center">
                    <CardDescription>{timerDict.labels.rounds}</CardDescription>
                    <div className="text-6xl font-bold text-secondary-foreground" suppressHydrationWarning>
                        {currentRound} <span className="text-4xl text-muted-foreground">/ {maxRounds}</span>
                    </div>
                </div>
                 <Button onClick={handleNextRound} disabled={!isActive || !canAddRound} className="w-full">
                    <Plus className="mr-2"/> {timerDict.next_round_button}
                </Button>
            </div>
        )
    }

    const renderMainDisplay = () => (
      <div className={cn("flex flex-col items-center justify-center gap-4 p-6", (mode !== 'FOR_TIME' && mode !== 'AMRAP') && "md:col-span-2")}>
        <CardDescription className="font-semibold text-lg">
          {timerDict[mode.toLowerCase() as keyof typeof timerDict]?.title || 'Workout Timer'}
        </CardDescription>
        <div
          className={cn(
            "text-8xl font-bold font-mono tabular-nums text-primary",
            {'text-amber-500': mode === 'AMRAP' && timeToDisplay < 10 && timeToDisplay > 0 }
          )}
          suppressHydrationWarning
        >
          {formatTime(timeToDisplay < 0 ? 0 : timeToDisplay)}
        </div>
        <div className="flex gap-2">
          <Button onClick={handleStartPause} size="lg" className="w-32 bg-accent hover:bg-accent/80 text-accent-foreground">
            {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
            {isActive ? timerDict.pause_button : timerDict.start_button}
          </Button>
          <Button onClick={handleReset} variant="outline" size="lg" className="w-32">
            <RefreshCw className="mr-2" />
            {timerDict.reset_button}
          </Button>
        </div>
      </div>
    );
    
    const renderFinishedState = () => (
         <div className="md:col-span-2 flex flex-col items-center justify-center gap-6 p-6">
            <div className="flex flex-col items-center text-center">
                <Check size={80} className="text-green-500 mb-4" />
                <h2 className="text-2xl font-bold">{summaryMessage}</h2>
            </div>
            
            {lapTimes.length > 0 && (
              <div className="w-full">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <History /> {timerDict.labels.round_times}
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{timerDict.labels.round}</TableHead>
                      <TableHead className="text-right">{timerDict.labels.time}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lapTimes.map((lapTime, index) => {
                       const previousLapTime = index > 0 ? lapTimes[index - 1] : 0;
                       const roundDuration = lapTime - previousLapTime;
                       return (
                           <TableRow key={index}>
                                <TableCell>{timerDict.labels.round} {index + 1}</TableCell>
                                <TableCell className="text-right font-mono">{formatTime(roundDuration)}</TableCell>
                           </TableRow>
                       )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            <Button onClick={handleReset} variant="outline" size="lg">
                <RefreshCw className="mr-2" />
                {timerDict.reset_button}
            </Button>
         </div>
    );

    return (
         <CardContent className="grid grid-cols-1 md:grid-cols-2 p-0 min-h-[300px]">
            {isFinished ? renderFinishedState() : (
                <>
                    {renderRounds()}
                    {renderMainDisplay()}
                </>
            )}
        </CardContent>
    );
  }

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                <TimerIcon /> {dict.workoutTimer.title}
            </h1>
            <p className="text-muted-foreground">{dict.workoutTimer.description}</p>
        </div>
        <Card>
            {isConfiguring ? renderConfiguration() : renderActiveTimer()}
        </Card>
    </div>
  );
};
