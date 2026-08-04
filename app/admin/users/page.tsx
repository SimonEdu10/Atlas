import { requireAdminPage } from '../require-admin';
import { getUsersAdmin, updateUserRole } from '../actions';
import { UserManager } from '../components/UserManager';

export default async function UsersPage() {
  const check = await requireAdminPage();
  if (!check.authorized) {
    return (
      <main className="p-6">
        <p className="text-red-600">No tienes permisos para ver esta página.</p>
      </main>
    );
  }

  const users = await getUsersAdmin();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold mb-6">Usuarios</h1>
      <UserManager users={users} updateUserRole={updateUserRole} />
    </main>
  );
}