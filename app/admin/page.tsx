import Link from 'next/link';
import { requireAdminPage } from './require-admin';

export default async function AdminPage() {
    const check = await requireAdminPage();
    if (!check.authorized) {
        return (
            <main className="p-6">
                <p className="text-red-600">No tienes permisos para ver esta página.</p>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-3xl p-6">
            <h1 className="text-2xl font-bold mb-6">Administración</h1>
            <div className="grid gap-4 sm:grid-cols-2">
                <Link href="/admin/types" className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm hover:shadow-lg transition-shadow">
                    <h2 className="text-lg font-bold">Tipos</h2>
                    <p className="text-sm text-gray-500 mt-1">Gestiona los tipos de recursos</p>
                </Link>
                <Link href="/admin/categories" className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm hover:shadow-lg transition-shadow">
                    <h2 className="text-lg font-bold">Categorías</h2>
                    <p className="text-sm text-gray-500 mt-1">Gestiona las categorías</p>
                </Link>
                <Link href="/admin/users" className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm hover:shadow-lg transition-shadow">
                    <h2 className="text-lg font-bold">Usuarios</h2>
                    <p className="text-sm text-gray-500 mt-1">Aprueba y gestiona los roles de los usuarios</p>
                </Link>
            </div>
        </main>
    );
}