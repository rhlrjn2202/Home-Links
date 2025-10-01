"use client";

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PropertyCardProps {
  imageSrc: string;
  title: string;
  location: string;
  price: string;
  type: string; // e.g., "Apartment", "House", "Land"
  transactionType: 'For Sale' | 'For Rent';
}

export function PropertyCard({ imageSrc, title, location, price, type, transactionType }: PropertyCardProps) {
  return (
    <Card className="w-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 w-full">
        <Image
          src={imageSrc}
          alt={title}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
        />
        <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-3 py-1 rounded-md text-xs font-semibold">
          {transactionType}
        </div>
        <div className="absolute top-2 right-2 bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-xs font-semibold">
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
        <p className="text-xl font-bold text-primary">{price}</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">View Details</Button>
      </CardFooter>
    </Card>
  );
}