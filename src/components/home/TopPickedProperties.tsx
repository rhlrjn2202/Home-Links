"use client";

import React from 'react';
import { PropertyCard } from '@/components/properties/PropertyCard';
import type { PropertyCardProps } from '@/components/properties/PropertyCard'; // Import the type

export function TopPickedProperties() {
  // Placeholder data for 5 default properties
  const properties: PropertyCardProps[] = [
    {
      imageSrc: "/images/property-1.jpg", // Placeholder image
      title: "Luxury Villa in Kochi",
      location: "Kochi, Ernakulam",
      price: "₹ 1.5 Cr",
      type: "House",
      transactionType: "For Sale",
    },
    {
      imageSrc: "/images/property-2.jpg", // Placeholder image
      title: "Modern Apartment in Trivandrum",
      location: "Trivandrum, Thiruvananthapuram",
      price: "₹ 75 Lac",
      type: "Apartment",
      transactionType: "For Sale",
    },
    {
      imageSrc: "/images/property-3.jpg", // Placeholder image
      title: "Spacious Plot in Calicut",
      location: "Calicut, Kozhikode",
      price: "₹ 50 Lac",
      type: "Land",
      transactionType: "For Sale",
    },
    {
      imageSrc: "/images/property-4.jpg", // Placeholder image
      title: "Beachfront House for Rent",
      location: "Alappuzha, Alappuzha",
      price: "₹ 35,000/month",
      type: "House",
      transactionType: "For Rent",
    },
    {
      imageSrc: "/images/property-1.jpg", // Reusing placeholder image for the 5th property
      title: "Commercial Space in Thrissur",
      location: "Thrissur, Thrissur",
      price: "₹ 2.5 Cr",
      type: "Commercial",
      transactionType: "For Sale",
    },
  ];

  return (
    <section className="container py-12 md:py-20">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Top Picked Properties in Kerala</h2>
      <div className="flex justify-center"> {/* Added flex container for centering */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl"> {/* Removed mx-auto */}
          {properties.map((property, index) => (
            <PropertyCard key={index} {...property} />
          ))}
        </div>
      </div>
    </section>
  );
}