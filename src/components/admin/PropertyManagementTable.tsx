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
import { Loader2, ChevronLeft, ChevronRight, Image as ImageIcon, Check, X } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { formatPriceInINR, formatDateToIST } from '@/lib/formatters'; // Import formatters

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
  status: 'pending' | 'approved' | 'rejected'; // Added status
  images: string[];
  submittedByEmail: string;
  submittedByName: string;
  submittedByMobile: string;
}

const ITEMS_PER_PAGE = 10;

export function PropertyManagementTable() {
  const { session, loading: sessionLoading } = useSession();
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // To manage loading state for individual actions

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

  const performPropertyAction = async (action: 'approveProperty' | 'disapproveProperty', propertyId: string) => {
    if (!session?.access_token) {
      toast.error('Authentication session not available. Please log in again.');
      return;
    }

    setActionLoading(propertyId);
    try {
      const SUPABASE_URL = "https://vytctxgktgblnrsznhgw.supabase.co";
      const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/admin-property-actions`;

      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, propertyId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to perform action on property.`);
      }

      const result = await response.json();
      toast.success(result.message);
      fetchProperties(); // Refresh the property list after action
    } catch (err: any) {
      console.error(`Error performing ${action} for property ${propertyId}:`, err);
      toast.error(err.message || `An unexpected error occurred during property action.`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveProperty = (propertyId: string) => {
    performPropertyAction('approveProperty', propertyId);
  };

  const handleDisapproveProperty = (propertyId: string) => {
    performPropertyAction('disapproveProperty', propertyId);
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
                <TableHead>Status</TableHead> {/* New Status column */}
                <TableHead className="text-center">Actions</TableHead> {/* New Actions column */}
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-24 text-center">
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
                    <TableCell>{formatPriceInINR(property.price)}</TableCell> {/* Apply formatter */}
                    <TableCell>{property.locality}, {property.district}</TableCell>
                    <TableCell>
                      <span className="font-medium">{property.submittedByName}</span>
                      <br />
                      <span className="text-muted-foreground text-sm">{property.submittedByEmail}</span>
                      {property.submittedByMobile !== 'N/A' && (
                        <>
                          <br />
                          <span className="text-muted-foreground text-sm">{property.submittedByMobile}</span>
                        </>
                      )}
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
                    <TableCell>
                      <Badge
                        className={
                          property.status === 'approved'
                            ? 'bg-green-500 hover:bg-green-500/80'
                            : property.status === 'rejected'
                            ? 'bg-red-500 hover:bg-red-500/80'
                            : 'bg-yellow-500 hover:bg-yellow-500/80'
                        }
                      >
                        {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex justify-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleApproveProperty(property.id)}
                        disabled={actionLoading === property.id || property.status === 'approved'}
                        title="Approve Property"
                      >
                        {actionLoading === property.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDisapproveProperty(property.id)}
                        disabled={actionLoading === property.id || property.status === 'rejected'}
                        title="Disapprove Property"
                      >
                        {actionLoading === property.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>{formatDateToIST(property.createdAt)}</TableCell> {/* Apply formatter */}
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