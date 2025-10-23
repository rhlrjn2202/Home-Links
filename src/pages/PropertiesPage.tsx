"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchFilteredProperties, Property } from '@/lib/supabase/properties';
import { PropertyCard, PropertyCardProps } from '@/components/properties/PropertyCard';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function PropertiesPage() {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState<PropertyCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transactionType = searchParams.get('transactionType') as 'For Sale' | 'For Rent' | null;
  const district = searchParams.get('district');
  const query = searchParams.get('query');
  const propertyType = searchParams.get('propertyType'); // Assuming this might come from other parts of the app

  useEffect(() => {
    async function loadFilteredProperties() {
      setLoading(true);
      setError(null);
      try {
        const fetchedProperties = await fetchFilteredProperties({
          transactionType: transactionType || undefined,
          district: district || undefined,
          query: query || undefined,
          propertyType: propertyType || undefined,
        });

        const formattedProperties: PropertyCardProps[] = fetchedProperties.map((prop: Property) => ({
          id: prop.id,
          imageSrc: prop.property_images[0]?.image_url || '/images/placeholder.jpg',
          title: prop.title,
          location: `${prop.locality}, ${prop.district}`,
          price: prop.price,
          type: prop.property_type,
          transactionType: prop.transaction_type,
        }));
        setProperties(formattedProperties);
      } catch (err: any) {
        console.error('Error loading filtered properties:', err);
        setError(err.message || 'Failed to load properties.');
        toast.error(err.message || 'Failed to load properties.');
      } finally {
        setLoading(false);
      }
    }
    loadFilteredProperties();
  }, [transactionType, district, query, propertyType]);

  const getPageTitle = () => {
    let title = 'Property Listings';
    const filters: string[] = [];
    if (transactionType) filters.push(transactionType);
    if (district) filters.push(district);
    if (propertyType) filters.push(propertyType);
    if (query) filters.push(`"${query}"`);

    if (filters.length > 0) {
      title = `Properties for ${filters.join(' in ')}`;
    }
    return title;
  };

  const getPageDescription = () => {
    let description = 'Explore properties available for sale and rent.';
    const parts: string[] = [];
    if (transactionType) parts.push(`${transactionType.toLowerCase()} properties`);
    if (district) parts.push(`in ${district}`);
    if (query) parts.push(`matching "${query}"`);
    if (propertyType) parts.push(`of type ${propertyType}`);

    if (parts.length > 0) {
      description = `Discover ${parts.join(' ')}.`;
    }
    return description;
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="w-full shadow-lg mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl md:text-4xl font-bold">{getPageTitle()}</CardTitle>
          <CardDescription className="mt-2 text-lg text-muted-foreground">
            {getPageDescription()}
          </CardDescription>
        </CardHeader>
      </Card>

      {loading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading properties...</p>
        </div>
      )}

      {error && (
        <div className="p-8 text-center text-destructive">
          <p>Error: {error}</p>
          <p>Please try again later.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
        </div>
      )}

      {!loading && !error && properties.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          <p className="text-lg mb-4">No properties found matching your criteria.</p>
          <p>Try adjusting your search filters.</p>
        </div>
      )}

      {!loading && !error && properties.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      )}
    </div>
  );
}