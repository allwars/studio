'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw, Timer as TimerIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Timer = () => {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTime(0);
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (timeInSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TimerIcon className="h-5 w-5" />
          Workout Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4">
        <div className="text-6xl font-bold font-mono text-primary" suppressHydrationWarning>
          {formatTime(time)}
        </div>
        <div className="flex gap-2">
          <Button onClick={handleStartPause} size="lg" className="w-32">
            {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={handleReset} variant="outline" size="lg">
            <RefreshCw className="mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Timer;
