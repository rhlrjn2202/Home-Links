"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchInputWithIcons } from './SearchInputWithIcons';

type TransactionType = 'buy' | 'rent';

const KERALA_DISTRICTS = [
  "Alappuzha", "Ernakulam", "Idukku", "Kannur", "Kasaragod", "Kollam",
  "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta",
  "Thiruvananthapuram", "Thrissur", "Wayanad"
];

export function HeroSection() {
  const [transactionType, setTransactionType] = useState<TransactionType>('buy');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSearch = () => {
    console.log({
      transactionType,
      selectedDistrict,
      searchQuery,
    });
    // Implement actual search logic here later
  };

  return (
    <section className="relative w-full min-h-[calc(100vh-56px)] flex items-center justify-center bg-gradient-to-r from-primary to-blue-600 text-primary-foreground">
      <div className="container px-4 md:px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            Find Your Dream Home in Kerala
          </h1>
          <p className="text-lg md:text-xl">
            Explore properties for sale and rent across all districts of Kerala.
          </p>

          <div className="bg-background p-6 rounded-lg shadow-lg max-w-4xl w-full mx-auto mt-8">
            {/* Transaction Type Toggles (Buy/Rent) */}
            <div className="flex justify-center mb-6">
              <ToggleGroup
                type="single"
                value={transactionType}
                onValueChange={(value: TransactionType) => value && setTransactionType(value)}
                className="grid grid-cols-2 w-full"
              >
                <ToggleGroupItem
                  value="buy"
                  aria-label="Toggle Buy"
                  className={cn(
                    "w-full border",
                    "bg-background text-muted-foreground",
                    "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  )}
                >
                  Buy
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="rent"
                  aria-label="Toggle Rent"
                  className={cn(
                    "w-full border",
                    "bg-background text-muted-foreground",
                    "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  )}
                >
                  Rent
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Main Search Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* District Selector */}
              <Select onValueChange={setSelectedDistrict} value={selectedDistrict}>
                <SelectTrigger className="w-full">
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

              {/* Search Input */}
              <SearchInputWithIcons
                placeholder="Search by Project, Locality, or Builder"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="md:col-span-2"
              />

              {/* Search Button */}
              <Button onClick={handleSearch} className="w-full md:col-span-1">
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}