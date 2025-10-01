"use client";

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold text-xl">Home Links</span>
        </Link>
        {/* Navigation can be added here later */}
      </div>
    </header>
  );
}