"use client";

import { PropertyManagementTable } from '@/components/admin/PropertyManagementTable';
import { AdminLayout } from '@/components/admin/AdminLayout'; // Import AdminLayout
import { Seo } from '@/components/seo/Seo'; // Import Seo component

export function AdminPropertiesPage() {
  return (
    <AdminLayout>
      <Seo
        title="Admin Dashboard - Property Management | Home Links"
        description="Manage submitted properties, approve, and disapprove listings on Home Links."
      />
      <PropertyManagementTable />
    </AdminLayout>
  );
}