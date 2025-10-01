"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Extend React.InputHTMLAttributes to correctly inherit all standard input props
interface SearchInputWithIconsProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const SearchInputWithIcons = React.forwardRef<HTMLInputElement, SearchInputWithIconsProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className={cn("relative flex items-center w-full", className)}>
        <Input ref={ref} className="pr-4" {...props} /> {/* Adjusted padding */}
      </div>
    );
  }
);
SearchInputWithIcons.displayName = "SearchInputWithIcons";