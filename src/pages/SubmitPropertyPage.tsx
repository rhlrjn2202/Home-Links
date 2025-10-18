"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Corrected this line
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const KERALA_DISTRICTS = [
  "Alappuzha", "Ernakulam", "Idukku", "Kannur", "Kasaragod", "Kollam",
  "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta",
  "Thiruvananthapuram", "Thrissur", "Wayanad"
];

const PROPERTY_TYPES = ["Apartment", "House", "Land", "Commercial"];
const TRANSACTION_TYPES = ["For Sale", "For Rent"];

const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }).max(100, { message: 'Title must not exceed 100 characters.' }),
  description: z.string().min(20, { message: 'Description must be at least 20 characters.' }).max(1000, { message: 'Description must not exceed 1000 characters.' }),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, { message: 'Price must be a valid number.' }),
  district: z.string().min(1, { message: 'Please select a district.' }),
  locality: z.string().min(3, { message: 'Locality must be at least 3 characters.' }).max(100, { message: 'Locality must not exceed 100 characters.' }),
  propertyType: z.string().min(1, { message: 'Please select a property type.' }),
  transactionType: z.enum(["For Sale", "For Rent"], { message: 'Please select a transaction type.' }),
});

type PropertyFormValues = z.infer<typeof formSchema>;

export function SubmitPropertyPage() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      price: '',
      district: '',
      locality: '',
      propertyType: '',
      transactionType: "For Sale", // Default to For Sale
    },
  });

  async function onSubmit(values: PropertyFormValues) {
    setIsLoading(true);
    console.log("Property Submission Data:", values);
    // Here you would typically send this data to your backend/Supabase
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Property submitted successfully! (This is a demo submission)');
      form.reset();
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit property. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Submit Your Property</CardTitle>
          <CardDescription className="mt-2">
            List your property for sale or rent and reach thousands of potential buyers/tenants.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Transaction Type Toggles */}
              <FormField
                control={form.control}
                name="transactionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Type</FormLabel>
                    <FormControl>
                      <ToggleGroup
                        type="single"
                        value={field.value}
                        onValueChange={(value: "For Sale" | "For Rent") => value && field.onChange(value)}
                        className="grid grid-cols-2 w-full"
                      >
                        {TRANSACTION_TYPES.map((type) => (
                          <ToggleGroupItem
                            key={type}
                            value={type}
                            aria-label={`Toggle ${type}`}
                            className={cn(
                              "w-full border h-10",
                              "bg-background text-muted-foreground",
                              "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                            )}
                          >
                            {type}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 3 BHK Luxury Apartment" {...field} />
                    </FormControl>
                    <FormDescription>
                      A concise and attractive title for your property.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your property in detail..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a detailed description including features, amenities, and highlights.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (in INR)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 7500000 (for 75 Lacs)" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the selling price or monthly rent.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select District" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {KERALA_DISTRICTS.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="locality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Locality / Area</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Kakkanad, Pattom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Property Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROPERTY_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Submit Property
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}