"use client";

import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { PropertyCard, PropertyCardProps } from '@/components/properties/PropertyCard';
import { Button } from '@/components/ui/button';

interface DistrictPropertiesSectionProps {
  districtName: string;
  properties: PropertyCardProps[];
}

export function DistrictPropertiesSection({ districtName, properties }: DistrictPropertiesSectionProps) {
  if (properties.length === 0) {
    return null; // Don't render section if no properties
  }

  return (
    <section className="py-8 md:py-12 w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-6 md:p-8 shadow-lg max-w-6xl mx-auto">
          <CardHeader className="px-0 pt-0 pb-4 text-center md:text-left">
            <CardTitle className="text-3xl md:text-4xl font-bold mb-2">Properties in {districtName}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground max-w-3xl mx-auto md:mx-0">
              Explore the latest properties available for sale and rent in {districtName}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Carousel
              opts={{
                align: "start",
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4 px-6 md:px-8">
                {properties.map((property, index) => (
                  <CarouselItem key={index} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <PropertyCard {...property} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </Carousel>
            <div className="text-center mt-6">
              <Button asChild variant="outline">
                <Link to={`/properties?district=${districtName}`}>View All Properties in {districtName}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}