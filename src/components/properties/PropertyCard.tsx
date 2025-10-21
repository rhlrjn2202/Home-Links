"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom'; // Import Link
import { formatPriceInINR } from '@/lib/formatters'; // Import formatter

export interface PropertyCardProps {
  id: string; // Added property ID
  imageSrc: string;
  title: string;
  location: string;
  price: string;
  type: string; // e.g., "Apartment", "House", "Land"
  transactionType: 'For Sale' | 'For Rent';
  index?: number; // Optional index for the overlay
}

export function PropertyCard({ id, imageSrc, title, location, price, type, transactionType, index }: PropertyCardProps) {
  return (
    <Card className="w-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 w-full">
        <img
          src={imageSrc}
          alt={title}
          className="rounded-t-lg absolute inset-0 w-full h-full object-cover"
        />
        {index !== undefined && (
          <div className="absolute top-2 left-2 text-5xl font-extrabold text-white/70 drop-shadow-lg">
            {index}
          </div>
        )}
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded-md text-xs font-semibold">
          {transactionType}
        </div>
        <div className="absolute bottom-2 left-2 bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-xs font-semibold">
          {type}
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <CardDescription className="flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-1 h-4 w-4" /> {location}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-xl font-bold text-price-accent">{formatPriceInINR(price)}</p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link to={`/properties/${id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}