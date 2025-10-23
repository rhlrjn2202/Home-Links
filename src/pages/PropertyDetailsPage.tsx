"use client";

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPropertyById, Property } from '@/lib/supabase/properties';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Loader2, MapPin, Tag, Home, DollarSign, Calendar, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { formatPriceInINR, formatDateToIST } from '@/lib/formatters'; // Import formatters
import { Seo } from '@/components/seo/Seo'; // Import Seo component

export function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPropertyDetails() {
      if (!id) {
        setError('Property ID is missing.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const fetchedProperty = await fetchPropertyById(id);
        if (!fetchedProperty) {
          setError('Property not found or not approved.');
        }
        setProperty(fetchedProperty);
      } catch (err: any) {
        console.error('Error fetching property details:', err);
        setError(err.message || 'Failed to load property details.');
        toast.error(err.message || 'Failed to load property details.');
      } finally {
        setLoading(false);
      }
    }
    loadPropertyDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-140px)] p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading property details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] p-4 text-center">
        <p className="text-destructive text-lg mb-4">Error: {error}</p>
        <Button onClick={() => navigate('/')}>Go to Home</Button>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] p-4 text-center">
        <p className="text-muted-foreground text-lg mb-4">Property not found.</p>
        <Button onClick={() => navigate('/')}>Go to Home</Button>
      </div>
    );
  }

  const formattedDate = formatDateToIST(property.created_at);
  const pageTitle = `${property.title} - ${property.locality}, ${property.district} | Home Links`;
  const pageDescription = `View details for ${property.title}, a ${property.property_type} ${property.transaction_type.toLowerCase()} in ${property.locality}, ${property.district}. Price: ${formatPriceInINR(property.price)}. ${property.description.substring(0, 150)}...`;
  const ogImage = property.property_images?.[0]?.image_url;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Seo
        title={pageTitle}
        description={pageDescription}
        ogTitle={pageTitle}
        ogDescription={pageDescription}
        ogImage={ogImage}
        ogUrl={typeof window !== 'undefined' ? window.location.href : undefined}
      />
      <Card className="w-full max-w-5xl mx-auto shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-4xl font-bold text-primary-foreground bg-primary p-4 rounded-t-lg -mx-6 -mt-6 md:-mx-8 md:-mt-8">
            {property.title}
          </CardTitle>
          <CardDescription className="flex items-center text-lg text-muted-foreground mt-2">
            <MapPin className="mr-2 h-5 w-5" /> {property.locality}, {property.district}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-6 md:p-8">
          {/* Image Carousel */}
          {property.property_images && property.property_images.length > 0 ? (
            <Carousel className="w-full max-w-4xl mx-auto">
              <CarouselContent>
                {property.property_images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="p-1">
                      <img
                        src={image.image_url}
                        alt={`${property.title} image ${index + 1}`}
                        className="w-full h-96 object-cover rounded-lg shadow-md"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          ) : (
            <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg text-muted-foreground">
              No images available
            </div>
          )}

          {/* Price and Transaction Type */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-secondary p-4 rounded-lg shadow-sm">
            <div className="flex items-center text-2xl font-bold text-price-accent mb-2 sm:mb-0">
              <DollarSign className="mr-2 h-6 w-6" /> {formatPriceInINR(property.price)}
            </div>
            <div className="flex items-center text-lg text-muted-foreground">
              <Tag className="mr-2 h-5 w-5" /> {property.transaction_type}
            </div>
          </div>

          <Separator />

          {/* Overview */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Home className="mr-2 h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Property Type:</span> {property.property_type}
              </div>
              <div className="flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
                <span className="font-medium">District:</span> {property.district}
              </div>
              <div className="flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Locality:</span> {property.locality}
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Listed On:</span> {formattedDate}
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Description</h2>
            <p className="text-muted-foreground leading-relaxed">
              {property.description}
            </p>
          </div>

          <Separator />

          {/* Contact Information (Placeholder) */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Contact Agent</h2>
            <Card className="p-4 bg-muted/50">
              <CardContent className="p-0 space-y-2">
                <p className="text-lg font-medium">Agent Name: John Doe</p>
                <div className="flex items-center text-muted-foreground">
                  <Phone className="mr-2 h-4 w-4" /> +91 98765 43210
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Mail className="mr-2 h-4 w-4" /> agent@homelinks.com
                </div>
                <Button className="mt-4 w-full">Contact Now</Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}