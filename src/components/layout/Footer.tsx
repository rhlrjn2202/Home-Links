"use client";

import React from 'react';
import { MadeWithDyad } from '@/components/made-with-dyad';

export function Footer() {
  return (
    <footer className="border-t bg-background py-4">
      <div className="container flex flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Home Links. All rights reserved.
        </p>
        <MadeWithDyad />
      </div>
    </footer>
  );
}