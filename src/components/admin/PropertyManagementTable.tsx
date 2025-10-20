"use client";

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from '@/components/auth/SessionContextProvider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface PropertyData {
  id: string;
  title: string;
  description: string;
  price: string;
  district: string;
  locality: string;
  propertyType: string;
  transactionType: string;
  createdAt: string;
  images: string[];
  submittedByEmail: string;
  submittedByName: string;
}

const ITEMS_PER_PAGE = 10;

export function PropertyManagementTable() {
  const { session, loading: sessionLoading } = useSession();
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);

  const fetchProperties = async () => {
    if (sessionLoading) return;

    if (!session?.access_token) {
      setError('Authentication session not available. Please log in again.');
      setLoading(false);
      toast.error('Authentication required to view property data.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const SUPABASE_URL = "https://vytctxgktgblnrsznhgw.supabase.co";
      const edgeFunctionUrl = new URL(`${SUPABASE_URL}/functions/v1/admin-properties`);
      edgeFunctionUrl.searchParams.append('page', currentPage.toString());
      edgeFunctionUrl.searchParams.append('limit', ITEMS_PER_PAGE.toString());

      const response = await fetch(edgeFunctionUrl.toString(), {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch properties');
      }
      const { properties: fetchedProperties, totalCount }: { properties: PropertyData[], totalCount: number } = await response.json();
      setProperties(fetchedProperties);
      setTotalProperties(totalCount);
    } catch (err: any) {
      console.error('Error fetching properties:', err);
      setError(err.message || 'An unexpected error occurred.');
      toast.error(err.message || 'Failed to load property data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [session, sessionLoading, currentPage]);

  const totalPages = Math.ceil(totalProperties / ITEMS_PER_PAGE);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (loading || sessionLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        <p>Error: {error}</p>
        <p>Please try again later.</p>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Manage Properties</CardTitle>
        <CardDescription>View and manage all submitted properties.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">SL No</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Transaction</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead className="text-center">Images</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No properties found.
                  </TableCell>
                </TableRow>
              ) : (
                properties.map((property, index) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                    <TableCell>{property.title}</TableCell>
                    <TableCell>{property.propertyType}</TableCell>
                    <TableCell>{property.transactionType}</TableCell>
                    <TableCell>{property.price}</TableCell>
                    <TableCell>{property.locality}, {property.district}</TableCell>
                    <TableCell>
                      <span className="font-medium">{property.submittedByName}</span>
                      <br />
                      <span className="text-muted-foreground text-sm">{property.submittedByEmail}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      {property.images && property.images.length > 0 ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon">
                              <ImageIcon className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Images for {property.title}</DialogTitle>
                            </DialogHeader>
                            <Carousel className="w-full max-w-2xl mx-auto">
                              <CarouselContent>
                                {property.images.map((imageUrl, imgIndex) => (
                                  <CarouselItem key={imgIndex}>
                                    <div className="p-1">
                                      <img
                                        src={imageUrl}
                                        alt={`Property image ${imgIndex + 1}`}
                                        className="w-full h-auto max-h-[500px] object-contain rounded-md"
                                      />
                                    </div>
                                  </CarouselItem>
                                ))}
                              </CarouselContent>
                              <CarouselPrevious />
                              <CarouselNext />
                            </Carousel>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <span className="text-muted-foreground text-sm">No Images</span>
                      )}
                    </TableCell>
                    <TableCell>{property.createdAt}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}