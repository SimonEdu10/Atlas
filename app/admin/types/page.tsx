import { redirect } from 'next/navigation';
import { requireAdminPage } from '../require-admin';
import { getTypesAdmin, createType, updateType, deleteType } from '../actions';
import { TypeManager } from '../components/TypeManager';

export default async function TypesPage() {
  const check = await requireAdminPage();
  if (!check.authorized) {
    return (
      <main className="p-6">
        <p className="text-red-600">No tienes permisos para ver esta página.</p>
      </main>
    );
  }

  const types = await getTypesAdmin();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold mb-6">Tipos</h1>
      <TypeManager types={types} createType={createType} updateType={updateType} deleteType={deleteType} />
    </main>
  );
}