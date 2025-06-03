import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { AdminDashboard } from './components/admin-dashboard';

export default async function AdminPage() {
  const session = await auth();
  
  // Check if user is authenticated and has admin role
  if (!session?.user?.id || session.user.role !== Role.ADMIN) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminDashboard />
    </div>
  );
}
