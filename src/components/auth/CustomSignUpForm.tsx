"use client";

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const formSchema = z.object({
  firstName: z.string().min(1, { message: 'First Name is required.' }),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, {
    message: 'Please enter a valid 10-digit Indian mobile number.',
  }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type SignUpFormValues = z.infer<typeof formSchema>;

interface CustomSignUpFormProps {
  onSignUpSuccess?: () => void;
}

export function CustomSignUpForm({ onSignUpSuccess }: CustomSignUpFormProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      mobileNumber: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: SignUpFormValues) {
    setIsLoading(true);
    const { email, password, firstName, mobileNumber } = values;

    try {
      // First, check if the mobile number already exists in user_profiles
      const { data: existingProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('mobile_number', mobileNumber)
        .single();

      if (existingProfile) {
        toast.error('This mobile number is already registered. Please use a different number.');
        setIsLoading(false);
        return;
      }

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine
        throw new Error(profileError.message);
      }

      // If mobile number is unique, proceed with Supabase auth sign-up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            mobile_number: mobileNumber,
          },
        },
      });

      if (error) {
        let userFriendlyMessage = 'An unexpected error occurred during sign up.';
        if (error.message.includes('User already registered')) {
          userFriendlyMessage = 'An account with this email already exists. Please try logging in or use a different email.';
        }
        // The unique_mobile_number constraint will also catch this at the DB level,
        // but the explicit check above provides a more immediate and user-friendly message.
        throw new Error(userFriendlyMessage);
      } else if (data.user) {
        toast.success('Sign-up successful! Please check your email to verify your account.');
        form.reset();
        onSignUpSuccess?.();
        navigate('/userauth/login');
      }
    } catch (error: any) {
      console.error('Sign-up error:', error);
      toast.error(error.message || 'An unexpected error occurred during sign up.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="Your first name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mobileNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 9876543210" type="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="••••••••" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Sign Up
        </Button>
      </form>
    </Form>
  );
}