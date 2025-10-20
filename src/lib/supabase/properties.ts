import { supabase } from '@/integrations/supabase/client';

export interface Property {
  id: string;
  title: string;
  description: string;
  price: string;
  district: string;
  locality: string;
  property_type: string;
  transaction_type: 'For Sale' | 'For Rent';
  created_at: string;
  status: 'pending' | 'approved' | 'rejected'; // Added status
  property_images: { image_url: string; order_index: number }[];
}

export async function fetchPublicProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      id,
      title,
      description,
      price,
      district,
      locality,
      property_type,
      transaction_type,
      created_at,
      status,
      property_images(image_url, order_index)
    `)
    .eq('status', 'approved') // ONLY fetch approved properties for the frontend
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching public properties:', error);
    throw new Error('Failed to fetch properties.');
  }

  return data.map(property => ({
    ...property,
    property_type: property.property_type, // Ensure correct type
    transaction_type: property.transaction_type as 'For Sale' | 'For Rent', // Ensure correct type
    status: property.status as 'pending' | 'approved' | 'rejected', // Ensure correct type
    property_images: property.property_images.sort((a, b) => a.order_index - b.order_index),
  }));
}

export async function fetchPropertyById(id: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      id,
      title,
      description,
      price,
      district,
      locality,
      property_type,
      transaction_type,
      created_at,
      status,
      property_images(image_url, order_index)
    `)
    .eq('id', id)
    .eq('status', 'approved') // Only fetch approved properties
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error(`Error fetching property with ID ${id}:`, error);
    throw new Error('Failed to fetch property details.');
  }

  if (!data) {
    return null;
  }

  return {
    ...data,
    property_type: data.property_type,
    transaction_type: data.transaction_type as 'For Sale' | 'For Rent',
    status: data.status as 'pending' | 'approved' | 'rejected',
    property_images: data.property_images.sort((a, b) => a.order_index - b.order_index),
  };
}