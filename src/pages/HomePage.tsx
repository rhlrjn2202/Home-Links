"use client";

import { useEffect, useState } from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { PropertyCategories } from '@/components/home/PropertyCategories';
import { TopPickedProperties } from '@/components/home/TopPickedProperties';
import { DistrictPropertiesSection } from '@/components/home/DistrictPropertiesSection';
import { fetchPublicProperties, type Property } from '@/lib/supabase/properties';
import { PropertyCardProps } from '@/components/properties/PropertyCard';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function HomePage() {
  const [propertiesByDistrict, setPropertiesByDistrict] = useState<Record<string, PropertyCardProps[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProperties() {
      try {
        setLoading(true);
        const fetchedProperties = await fetchPublicProperties();

        const groupedProperties: Record<string, PropertyCardProps[]> = {};
        fetchedProperties.forEach((prop: Property) => {
          if (!groupedProperties[prop.district]) {
            groupedProperties[prop.district] = [];
          }
          groupedProperties[prop.district].push({
            id: prop.id, // Pass the property ID
            imageSrc: prop.property_images[0]?.image_url || '/images/placeholder.jpg', // Use first image or a placeholder
            title: prop.title,
            location: `${prop.locality}, ${prop.district}`,
            price: prop.price,
            type: prop.property_type,
            transactionType: prop.transaction_type,
          });
        });
        setPropertiesByDistrict(groupedProperties);
      } catch (err: any) {
        console.error('Error loading properties for homepage:', err);
        setError(err.message || 'Failed to load properties.');
        toast.error(err.message || 'Failed to load properties for districts.');
      } finally {
        setLoading(false);
      }
    }
    loadProperties();
  }, []);

  const sortedDistricts = Object.keys(propertiesByDistrict).sort();

  return (
    <>
      <HeroSection />
      <PropertyCategories />
      <TopPickedProperties />

      {loading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading properties by district...</p>
        </div>
      )}

      {error && (
        <div className="p-8 text-center text-destructive">
          <p>Error: {error}</p>
          <p>Please try again later.</p>
        </div>
      )}

      {!loading && !error && sortedDistricts.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          <p>No properties found across any districts yet.</p>
        </div>
      )}

      {!loading && !error && sortedDistricts.length > 0 && (
        <div className="space-y-12">
          {sortedDistricts.map(district => (
            <DistrictPropertiesSection
              key={district}
              districtName={district}
              properties={propertiesByDistrict[district]}
            />
          ))}
        </div>
      )}
    </>
  );
}