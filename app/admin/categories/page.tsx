import { requireAdminPage } from '../require-admin';
import { getCategoriesAdmin, createCategory, updateCategory, deleteCategory } from '../actions';
import { CategoryManager } from '../components/CategoryManager';

export default async function CategoriesPage() {
  const check = await requireAdminPage();
  if (!check.authorized) {
    return (
      <main className="p-6">
        <p className="text-red-600">No tienes permisos para ver esta página.</p>
      </main>
    );
  }

  const categories = await getCategoriesAdmin();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold mb-6">Categorías</h1>
      <CategoryManager
        categories={categories}
        createCategory={createCategory}
        updateCategory={updateCategory}
        deleteCategory={deleteCategory}
      />
    </main>
  );
}