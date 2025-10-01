"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

type TransactionType = 'buy' | 'rent';
type PropertyType = 'land/plot' | 'house' | 'apartments' | 'commercial';

const KERALA_DISTRICTS = [
  "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam",
  "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta",
  "Thiruvananthapuram", "Thrissur", "Wayanad"
];

export function HeroSection() {
  const [transactionType, setTransactionType] = useState<TransactionType>('buy');
  const [propertyType, setPropertyType] = useState<PropertyType>('house');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSearch = () => {
    console.log({
      transactionType,
      propertyType,
      selectedDistrict,
      searchQuery,
    });
    // Implement actual search logic here later
  };

  return (
    <section className="relative w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-primary to-blue-600 text-primary-foreground">
      <div className="container px-4 md:px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            Find Your Dream Home in Kerala
          </h1>
          <p className="text-lg md:text-xl">
            Explore properties for sale and rent across all districts of Kerala.
          </p>

          <div className="bg-background p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <ToggleGroup
                type="single"
                value={transactionType}
                onValueChange={(value: TransactionType) => value && setTransactionType(value)}
                className="grid grid-cols-2 w-full max-w-sm"
              >
                <ToggleGroupItem value="buy" aria-label="Toggle Buy" className="w-full">
                  Buy
                </ToggleGroupItem>
                <ToggleGroupItem value="rent" aria-label="Toggle Rent" className="w-full">
                  Rent
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="flex justify-center mb-6">
              <ToggleGroup
                type="single"
                value={propertyType}
                onValueChange={(value: PropertyType) => value && setPropertyType(value)}
                className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full"
              >
                <ToggleGroupItem value="land/plot" aria-label="Toggle Land/Plot" className="w-full">
                  Land/Plot
                </ToggleGroupItem>
                <ToggleGroupItem value="house" aria-label="Toggle House" className="w-full">
                  House
                </ToggleGroupItem>
                <ToggleGroupItem value="apartments" aria-label="Toggle Apartments" className="w-full">
                  Apartments
                </ToggleGroupItem>
                <ToggleGroupItem value="commercial" aria-label="Toggle Commercial" className="w-full">
                  Commercial
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Select onValueChange={setSelectedDistrict} value={selectedDistrict}>
                <SelectTrigger className="w-full sm:w-1/2">
                  <SelectValue placeholder="Select District" />
                </SelectTrigger>
                <SelectContent>
                  {KERALA_DISTRICTS.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="text"
                placeholder="Search by location, area, etc."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-1/2"
              />
            </div>

            <Button onClick={handleSearch} className="w-full">
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}