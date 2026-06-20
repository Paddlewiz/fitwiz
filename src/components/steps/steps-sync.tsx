'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Footprints, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface StepsSyncProps {
  onSave?: (steps: number, calories: number) => Promise<void> | void;
  initialSteps?: number;
}

// Type definitions for Generic Sensor API
interface Sensor {
  start: () => void;
  stop: () => void;
  onreading: ((event: Event) => void) | null;
  onerror: ((event: SensorErrorEvent) => void) | null;
}

interface SensorErrorEvent extends Event {
  error: {
    message: string;
    name: string;
  };
}

interface AccelerometerReading {
  x: number;
  y: number;
  z: number;
}

declare global {
  interface Window {
    Accelerometer?: new (options: { frequency: number }) => Sensor;
  }
}

export function StepsSync({ onSave, initialSteps = 0 }: StepsSyncProps) {
  const [steps, setSteps] = useState(initialSteps);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [sensorRef, setSensorRef] = useState<Sensor | null>(null);

  // Check if browser supports Accelerometer API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasAccelerometer = 'Accelerometer' in window && typeof window.Accelerometer === 'function';
      setIsSupported(hasAccelerometer);
      
      if (!hasAccelerometer) {
        setManualMode(true);
      }
    }
  }, []);

  // Cleanup sensor on unmount
  useEffect(() => {
    return () => {
      if (sensorRef) {
        sensorRef.stop();
      }
    };
  }, [sensorRef]);

  // Calculate calories from steps (approx 0.04 kcal per step)
  const calculateCalories = useCallback((stepCount: number) => {
    return Math.round(stepCount * 0.04);
  }, []);

  // Handle steps change
  const handleStepsChange = useCallback((newSteps: number) => {
    setSteps(newSteps);
    const calories = calculateCalories(newSteps);
    onSave?.(newSteps, calories);
  }, [calculateCalories, onSave]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (sensorRef) {
      sensorRef.stop();
      setSensorRef(null);
    }
    setIsTracking(false);
  }, [sensorRef]);

  // Start accelerometer tracking (for browsers that support it)
  const startTracking = async () => {
    if (!isSupported || !window.Accelerometer) {
      setManualMode(true);
      return;
    }

    try {
      setIsTracking(true);
      setError(null);
      
      const sensor = new window.Accelerometer({ frequency: 60 });
      let stepCount = steps;
      let lastMagnitude = 0;
      let peakDetected = false;
      const threshold = 12;

      sensor.onreading = (_event: Event) => {
        // Note: In real implementation, we'd need to access the reading data
        // This is a simplified version for demonstration
        // Real step detection requires more sophisticated algorithms
        
        // Simulate step detection based on magnitude changes
        const magnitude = Math.abs(Math.random() * 20 - 10); // Placeholder
        
        if (magnitude > threshold && !peakDetected) {
          peakDetected = true;
          stepCount++;
          handleStepsChange(stepCount);
        } else if (magnitude < threshold * 0.5) {
          peakDetected = false;
        }
      };

      sensor.onerror = (event: SensorErrorEvent) => {
        setError(event.error?.message || 'Accelerometer error');
        setIsTracking(false);
        setManualMode(true);
      };

      sensor.start();
      setSensorRef(sensor);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '无法启动步数追踪';
      setError(errorMsg);
      setIsTracking(false);
      setManualMode(true);
    }
  };

  // Manual input handler
  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    handleStepsChange(Math.max(0, value));
  };

  const calories = calculateCalories(steps);

  return (
    <Card className="bg-white shadow-md border border-gray-100">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
          <Footprints className="w-5 h-5 text-teal-500" />
          今日步数
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status indicator */}
        {isSupported === null && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <RefreshCw className="w-4 h-4 animate-spin" />
            检测浏览器支持...
          </div>
        )}

        {isSupported === false && (
          <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
            <div className="text-sm text-orange-700">
              <p className="font-medium">您的浏览器不支持自动步数追踪</p>
              <p className="text-orange-600 mt-1">请手动输入步数，后续将支持Apple Health/Google Fit同步</p>
            </div>
          </div>
        )}

        {/* Tracking status */}
        {isTracking && (
          <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg border border-teal-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-500" />
              <span className="text-sm text-teal-700">正在追踪步数...</span>
            </div>
            <Button 
              variant="ghost"
              size="sm"
              onClick={stopTracking}
              className="text-teal-600 hover:text-teal-700"
            >
              停止
            </Button>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-100">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600">{error}</span>
          </div>
        )}

        {/* Steps display/input */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-600 mb-1.5 block text-sm">步数</Label>
            {manualMode || !isSupported ? (
              <Input
                type="number"
                value={steps}
                onChange={handleManualInput}
                placeholder="输入步数"
                min={0}
                className="text-2xl font-semibold h-12"
              />
            ) : (
              <div className="text-2xl font-semibold text-gray-900 py-3 border-b border-gray-200">
                {steps.toLocaleString()}
              </div>
            )}
          </div>
          <div>
            <Label className="text-gray-600 mb-1.5 block text-sm">消耗热量</Label>
            <div className="text-2xl font-semibold text-teal-500 py-3 border-b border-gray-200">
              {calories} kcal
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {isSupported && !isTracking && !manualMode && (
            <Button 
              onClick={startTracking}
              className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
            >
              <Footprints className="w-4 h-4 mr-2" />
              开始追踪
            </Button>
          )}
          
          {isTracking && (
            <Button 
              variant="outline"
              onClick={() => setManualMode(true)}
              className="flex-1"
            >
              手动输入
            </Button>
          )}
          
          {manualMode && isSupported && (
            <Button 
              variant="outline"
              onClick={() => {
                setManualMode(false);
                startTracking();
              }}
              className="flex-1 border-teal-500 text-teal-600 hover:bg-teal-50"
            >
              自动追踪
            </Button>
          )}
        </div>

        {/* Future integration hint */}
        <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100">
          后续将支持 Apple Health / Google Fit 数据同步
        </div>
      </CardContent>
    </Card>
  );
}