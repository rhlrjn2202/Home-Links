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
      property_images(image_url, order_index)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching public properties:', error);
    throw new Error('Failed to fetch properties.');
  }

  return data.map(property => ({
    ...property,
    property_type: property.property_type, // Ensure correct type
    transaction_type: property.transaction_type as 'For Sale' | 'For Rent', // Ensure correct type
    property_images: property.property_images.sort((a, b) => a.order_index - b.order_index),
  }));
}