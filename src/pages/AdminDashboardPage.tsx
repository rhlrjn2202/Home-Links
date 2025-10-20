import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { AdminLayout } from '@/components/admin/AdminLayout'; // Import AdminLayout

export function AdminDashboardPage() {
  return (
    <AdminLayout>
      <UserManagementTable />
    </AdminLayout>
  );
}