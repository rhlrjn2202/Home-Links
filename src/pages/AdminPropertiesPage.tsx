"use client";

import { PropertyManagementTable } from '@/components/admin/PropertyManagementTable';

export function AdminPropertiesPage() {
  return (
    <div className="container mx-auto p-8">
      <PropertyManagementTable />
    </div>
  );
}