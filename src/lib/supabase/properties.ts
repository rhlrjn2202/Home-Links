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

export async function fetchUserProperties(userId: string): Promise<Property[]> {
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
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching properties for user ${userId}:`, error);
    throw new Error('Failed to fetch user properties.');
  }

  return data.map(property => ({
    ...property,
    property_type: property.property_type,
    transaction_type: property.transaction_type as 'For Sale' | 'For Rent',
    status: property.status as 'pending' | 'approved' | 'rejected',
    property_images: property.property_images.sort((a, b) => a.order_index - b.order_index),
  }));
}

interface FilteredPropertiesParams {
  transactionType?: 'For Sale' | 'For Rent';
  district?: string;
  query?: string; // For searching title, locality, description
  propertyType?: string; // For filtering by property type
}

export async function fetchFilteredProperties({
  transactionType,
  district,
  query,
  propertyType,
}: FilteredPropertiesParams): Promise<Property[]> {
  let queryBuilder = supabase
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
    .eq('status', 'approved'); // Always filter for approved properties

  if (transactionType) {
    queryBuilder = queryBuilder.eq('transaction_type', transactionType);
  }
  if (district) {
    queryBuilder = queryBuilder.eq('district', district);
  }
  if (propertyType) {
    queryBuilder = queryBuilder.eq('property_type', propertyType);
  }
  if (query) {
    // Use ilike for case-insensitive search across multiple fields
    queryBuilder = queryBuilder.or(
      `title.ilike.%${query}%,locality.ilike.%${query}%,description.ilike.%${query}%`
    );
  }

  queryBuilder = queryBuilder.order('created_at', { ascending: false });

  const { data, error } = await queryBuilder;

  if (error) {
    console.error('Error fetching filtered properties:', error);
    throw new Error('Failed to fetch filtered properties.');
  }

  return data.map(property => ({
    ...property,
    property_type: property.property_type,
    transaction_type: property.transaction_type as 'For Sale' | 'For Rent',
    status: property.status as 'pending' | 'approved' | 'rejected',
    property_images: property.property_images.sort((a, b) => a.order_index - b.order_index),
  }));
}