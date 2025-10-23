import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { AdminLayout } from '@/components/admin/AdminLayout'; // Import AdminLayout
import { Seo } from '@/components/seo/Seo'; // Import Seo component

export function AdminDashboardPage() {
  return (
    <AdminLayout>
      <Seo
        title="Admin Dashboard - User Management | Home Links"
        description="Manage users, view profiles, and perform administrative actions on Home Links."
      />
      <UserManagementTable />
    </AdminLayout>
  );
}