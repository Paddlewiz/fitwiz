'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// localStorage key for onboarding completion
const ONBOARDING_KEY = 'fitwiz_onboarding_done';
const ONBOARDING_DATA_KEY = 'fitwiz_onboarding_data';

// Onboarding step type
export type OnboardingStep = 1 | 2 | 3;

// Onboarding data collected during the flow
export interface OnboardingData {
  // Step 1: Basic info
  gender?: 'male' | 'female';
  age?: number;
  height?: number;
  currentWeight?: number;
  calculatedBMI?: number;
  calculatedTDEE?: number;
  
  // Step 2: Goal setting
  targetWeight?: number;
  targetWeeks?: number;
  recommendedCalories?: number;
  
  // Step 3: First record
  firstWeightRecorded?: boolean;
}

interface OnboardingContextType {
  // State
  isCompleted: boolean;
  isModalOpen: boolean;
  currentStep: OnboardingStep;
  data: OnboardingData;
  
  // Actions
  startOnboarding: () => void;
  closeModal: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: OnboardingStep) => void;
  updateData: (newData: Partial<OnboardingData>) => void;
  completeOnboarding: () => void;
  restartOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [data, setData] = useState<OnboardingData>({});
  const [mounted, setMounted] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    setMounted(true);
    
    // Check if onboarding is completed
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (completed === 'true') {
      setIsCompleted(true);
      
      // Load saved data
      const savedData = localStorage.getItem(ONBOARDING_DATA_KEY);
      if (savedData) {
        try {
          setData(JSON.parse(savedData));
        } catch (e) {
          console.error('Failed to parse onboarding data:', e);
        }
      }
    } else {
      // First visit - start onboarding
      setIsModalOpen(true);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (mounted && Object.keys(data).length > 0) {
      localStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(data));
    }
  }, [data, mounted]);

  const startOnboarding = useCallback(() => {
    setIsModalOpen(true);
    setCurrentStep(1);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as OnboardingStep);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as OnboardingStep);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: OnboardingStep) => {
    setCurrentStep(step);
  }, []);

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setIsCompleted(true);
    setIsModalOpen(false);
    localStorage.setItem(ONBOARDING_KEY, 'true');
    if (Object.keys(data).length > 0) {
      localStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(data));
    }
  }, [data]);

  const restartOnboarding = useCallback(() => {
    localStorage.removeItem(ONBOARDING_KEY);
    localStorage.removeItem(ONBOARDING_DATA_KEY);
    setIsCompleted(false);
    setData({});
    setCurrentStep(1);
    setIsModalOpen(true);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        isCompleted,
        isModalOpen,
        currentStep,
        data,
        startOnboarding,
        closeModal,
        nextStep,
        prevStep,
        goToStep,
        updateData,
        completeOnboarding,
        restartOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}