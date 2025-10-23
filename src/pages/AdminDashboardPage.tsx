import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { AdminLayout } from '@/components/admin/AdminLayout';
// Removed: import { Seo } from '@/components/seo/Seo';

export function AdminDashboardPage() {
  return (
    <AdminLayout>
      {/* Removed: <Seo title="Admin Dashboard - User Management | Home Links" description="Manage users, view profiles, and perform administrative actions on Home Links." /> */}
      <UserManagementTable />
    </AdminLayout>
  );
}