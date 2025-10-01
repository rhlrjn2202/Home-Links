"use client";

import React from 'react';
import { PropertyCard } from '@/components/properties/PropertyCard';
import type { PropertyCardProps } from '@/components/properties/PropertyCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export function TopPickedProperties() {
  const properties: PropertyCardProps[] = [
    {
      imageSrc: "/images/property-1.jpg",
      title: "Luxury Villa in Kochi",
      location: "Kochi, Ernakulam",
      price: "₹ 1.5 Cr",
      type: "House",
      transactionType: "For Sale",
    },
    {
      imageSrc: "/images/property-2.jpg",
      title: "Modern Apartment in Trivandrum",
      location: "Trivandrum, Thiruvananthapuram",
      price: "₹ 75 Lac",
      type: "Apartment",
      transactionType: "For Sale",
    },
    {
      imageSrc: "/images/property-3.jpg",
      title: "Spacious Plot in Calicut",
      location: "Calicut, Kozhikode",
      price: "₹ 50 Lac",
      type: "Land",
      transactionType: "For Sale",
    },
    {
      imageSrc: "/images/property-4.jpg",
      title: "Beachfront House for Rent",
      location: "Alappuzha, Alappuzha",
      price: "₹ 35,000/month",
      type: "House",
      transactionType: "For Rent",
    },
    {
      imageSrc: "/images/property-1.jpg",
      title: "Commercial Space in Thrissur",
      location: "Thrissur, Thrissur",
      price: "₹ 2.5 Cr",
      type: "Commercial",
      transactionType: "For Sale",
    },
    {
      imageSrc: "/images/property-2.jpg",
      title: "Riverside Plot in Kottayam",
      location: "Kottayam, Kottayam",
      price: "₹ 60 Lac",
      type: "Land",
      transactionType: "For Sale",
    },
    {
      imageSrc: "/images/property-3.jpg",
      title: "Furnished Apartment in Kozhikode",
      location: "Kozhikode, Kozhikode",
      price: "₹ 25,000/month",
      type: "Apartment",
      transactionType: "For Rent",
    },
  ];

  return (
    <section className="container py-12 md:py-20">
      <Card className="p-6 md:p-8 shadow-lg">
        <CardHeader className="px-0 pt-0 pb-4 text-center md:text-left">
          <CardTitle className="text-3xl md:text-4xl font-bold mb-2">Top Picked Properties in Kerala</CardTitle>
          <CardDescription className="text-lg text-muted-foreground max-w-3xl mx-auto md:mx-0">
            A handpicked collection of the most in-demand residential developments. These properties offer unmatched value with ideal locations, smart amenities, and trusted builders.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {properties.map((property, index) => (
                <CarouselItem key={index} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <PropertyCard {...property} index={index + 1} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </CardContent>
      </Card>
    </section>
  );
}