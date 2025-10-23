"use client";

import { PropertyManagementTable } from '@/components/admin/PropertyManagementTable';
import { AdminLayout } from '@/components/admin/AdminLayout';
// Removed: import { Seo } from '@/components/seo/Seo';

export function AdminPropertiesPage() {
  return (
    <AdminLayout>
      {/* Removed: <Seo title="Admin Dashboard - Property Management | Home Links" description="Manage submitted properties, approve, and disapprove listings on Home Links." /> */}
      <PropertyManagementTable />
    </AdminLayout>
  );
}