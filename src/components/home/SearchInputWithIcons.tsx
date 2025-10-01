"use client";

import React from 'react';
import { Input } from '@/components/ui/input'; // Removed InputProps import
import { Button } from '@/components/ui/button';
import { MapPin, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

// Extend React.InputHTMLAttributes to correctly inherit all standard input props
interface SearchInputWithIconsProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onLocationClick?: () => void;
  onVoiceSearchClick?: () => void;
}

export const SearchInputWithIcons = React.forwardRef<HTMLInputElement, SearchInputWithIconsProps>(
  ({ className, onLocationClick, onVoiceSearchClick, ...props }, ref) => {
    return (
      <div className={cn("relative flex items-center w-full", className)}>
        <Input ref={ref} className="pr-20" {...props} /> {/* Add padding for buttons */}
        <div className="absolute right-0 flex h-full items-center pr-2 space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={onLocationClick}
          >
            <MapPin className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={onVoiceSearchClick}
          >
            <Mic className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
);
SearchInputWithIcons.displayName = "SearchInputWithIcons";