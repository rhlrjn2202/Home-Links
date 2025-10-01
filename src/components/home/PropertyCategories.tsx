"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Building, LandPlot } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  icon: React.ElementType;
  href: string;
  imageSrc: string; // Added imageSrc for background image
}

function CategoryCard({ title, icon: Icon, href, imageSrc }: CategoryCardProps) {
  return (
    <Link href={href} className="block">
      <Card className="relative w-full h-48 overflow-hidden group hover:shadow-xl transition-shadow duration-300">
        <Image
          src={imageSrc}
          alt={title}
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-colors duration-300 flex flex-col items-center justify-center text-white p-4">
          <Icon className="h-10 w-10 mb-2" />
          <CardTitle className="text-xl font-bold text-center">{title}</CardTitle>
        </div>
      </Card>
    </Link>
  );
}

export function PropertyCategories() {
  const categories = [
    {
      title: "Apartments",
      icon: Building,
      href: "/properties?category=apartment",
      imageSrc: "/images/category-apartment.jpg", // Placeholder image
    },
    {
      title: "Houses",
      icon: Home,
      href: "/properties?category=house",
      imageSrc: "/images/category-house.jpg", // Placeholder image
    },
    {
      title: "Land/Plots",
      icon: LandPlot,
      href: "/properties?category=land",
      imageSrc: "/images/category-land.jpg", // Placeholder image
    },
  ];

  return (
    <section className="container py-12 md:py-20">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Explore by Property Type</h2>
      <div className="flex justify-center"> {/* Added flex container for centering */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl"> {/* Removed mx-auto */}
          {categories.map((category, index) => (
            <CategoryCard key={index} {...category} />
          ))}
        </div>
      </div>
    </section>
  );
}