"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from '@/components/auth/SessionContextProvider';

export function ExportUsersToCsvButton() {
  const { session, loading: sessionLoading } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    if (sessionLoading) {
      toast.info('Session is still loading. Please wait.');
      return;
    }

    if (!session?.access_token) {
      toast.error('Authentication session not available. Please log in again.');
      return;
    }

    setIsLoading(true);
    try {
      const SUPABASE_URL = "https://vytctxgktgblnrsznhgw.supabase.co";
      const edgeFunctionUrl = new URL(`${SUPABASE_URL}/functions/v1/admin-users`);
      edgeFunctionUrl.searchParams.append('format', 'csv');

      const response = await fetch(edgeFunctionUrl.toString(), {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text(); // Get raw text for error
        let errorMessage = 'Failed to export users to CSV.';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If it's not JSON, use the raw text
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const csvBlob = await response.blob();
      const url = window.URL.createObjectURL(csvBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Users exported to CSV successfully!');
    } catch (error: any) {
      console.error('Error exporting users:', error);
      toast.error(error.message || 'An unexpected error occurred during CSV export.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={isLoading || sessionLoading}>
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
      Export to CSV
    </Button>
  );
}