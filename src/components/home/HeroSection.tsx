"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchInputWithIcons } from './SearchInputWithIcons'; // Import the new component

type TransactionType = 'buy' | 'rent';
type PropertyType = 'land/plot' | 'house' | 'apartments' | 'commercial';

const KERALA_DISTRICTS = [
  "Alappuzha", "Ernakulam", "Idukku", "Kannur", "Kasaragod", "Kollam",
  "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta",
  "Thiruvananthapuram", "Thrissur", "Wayanad"
];

export function HeroSection() {
  const [transactionType, setTransactionType] = useState<TransactionType>('buy');
  const [propertyType, setPropertyType] = useState<PropertyType>('house'); // Now controlled by Select
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [budget, setBudget] = useState<string>(''); // New state for Budget
  // Removed possessionStatus state

  const handleSearch = () => {
    console.log({
      transactionType,
      propertyType,
      selectedDistrict,
      searchQuery,
      budget,
      // Removed possessionStatus from log
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

          <div className="bg-background p-6 rounded-lg shadow-lg max-w-4xl w-full mx-auto">
            {/* Transaction Type Toggles (Buy/Rent) */}
            <div className="flex justify-center mb-6">
              <ToggleGroup
                type="single"
                value={transactionType}
                onValueChange={(value: TransactionType) => value && setTransactionType(value)}
                className="grid grid-cols-2 w-full"
              >
                <ToggleGroupItem value="buy" aria-label="Toggle Buy" className="w-full border"> {/* Added border */}
                  Buy
                </ToggleGroupItem>
                <ToggleGroupItem value="rent" aria-label="Toggle Rent" className="w-full border"> {/* Added border */}
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

              {/* Search Input with Location and Voice Icons */}
              <SearchInputWithIcons
                placeholder="Search by Project, Locality, or Builder"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="md:col-span-3"
                onLocationClick={() => console.log('Location icon clicked')}
                onVoiceSearchClick={() => console.log('Voice icon clicked')}
              />

              {/* Budget Selector */}
              <Select onValueChange={setBudget} value={budget}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Budget</SelectItem>
                  <SelectItem value="50l">Up to 50 Lakhs</SelectItem>
                  <SelectItem value="1cr">Up to 1 Crore</SelectItem>
                  <SelectItem value="2cr">Up to 2 Crores</SelectItem>
                  {/* Add more budget options as needed */}
                </SelectContent>
              </Select>

              {/* Property Type Selector */}
              <Select onValueChange={(value: PropertyType) => setPropertyType(value)} value={propertyType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="land/plot">Land/Plot</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartments">Apartments</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>

              {/* Removed Possession Status Selector */}

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