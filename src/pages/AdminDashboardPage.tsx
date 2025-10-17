import { UserManagementTable } from '@/components/admin/UserManagementTable';

export function AdminDashboardPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <UserManagementTable />
    </div>
  );
}