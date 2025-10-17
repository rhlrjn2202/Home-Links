"use client";

import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Building, LandPlot } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  icon: React.ElementType;
  to: string;
  imageSrc: string;
}

function CategoryCard({ title, icon: Icon, to, imageSrc }: CategoryCardProps) {
  return (
    <Link to={to} className="block">
      <Card className="relative w-full h-48 overflow-hidden group hover:shadow-xl transition-shadow duration-300">
        <img
          src={imageSrc}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
      to: "/properties?category=apartment",
      imageSrc: "/images/category-apartment.jpg",
    },
    {
      title: "Houses",
      icon: Home,
      to: "/properties?category=house",
      imageSrc: "/images/category-house.jpg",
    },
    {
      title: "Land/Plots",
      icon: LandPlot,
      to: "/properties?category=land",
      imageSrc: "/images/category-land.jpg",
    },
  ];

  return (
    <section className="py-12 md:py-20 w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-6 md:p-8 shadow-lg max-w-4xl mx-auto">
          <CardHeader className="px-0 pt-0 pb-4 text-center md:text-left">
            <CardTitle className="text-3xl md:text-4xl font-bold mb-2">Explore by Property Type</CardTitle>
            <CardDescription className="text-lg text-muted-foreground max-w-3xl mx-auto md:mx-0">
              Discover various property types available, from modern apartments to spacious lands, tailored to your needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {categories.map((category, index) => (
                <CategoryCard key={index} {...category} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}