"use client";

import React from 'react';
import { HelmetProvider } from 'react-helmet-async';

export function SeoProvider({ children }: { children: React.ReactNode }) {
  return (
    <HelmetProvider>
      {children}
    </HelmetProvider>
  );
}