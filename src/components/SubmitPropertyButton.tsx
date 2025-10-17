"use client";

import { Link } from 'react-router-dom'; // Corrected import for Link
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function SubmitPropertyButton() {
  return (
    <Link to="/submit-property" className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium",
      "transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
      "disabled:pointer-events-none disabled:opacity-50",
      "bg-white text-primary hover:bg-gray-100",
      "h-9 px-4 py-2"
    )}>
      <span>Submit Property</span>
      <Badge className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">FREE</Badge>
    </Link>
  );
}