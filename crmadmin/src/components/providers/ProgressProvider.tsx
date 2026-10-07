'use client';

import React from 'react';
import { ProgressProvider as BProgressProvider } from '@bprogress/next/app';

interface ProgressProviderProps {
  children: React.ReactNode;
}

export default function ProgressProvider({ children }: ProgressProviderProps) {
  return (
    <BProgressProvider
      height="3px"
      color="#4f46e5"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </BProgressProvider>
  );
}
