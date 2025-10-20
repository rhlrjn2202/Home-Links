"use client";

import { PropertyManagementTable } from '@/components/admin/PropertyManagementTable';
import { AdminLayout } from '@/components/admin/AdminLayout'; // Import AdminLayout

export function AdminPropertiesPage() {
  return (
    <AdminLayout>
      <PropertyManagementTable />
    </AdminLayout>
  );
}