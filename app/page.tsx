import { Suspense } from 'react';
import {
  getResourcesWithFavorites,
  getTypes,
  getCategories,
  getShareableUsers,
  createResource,
  deleteResource,
  toggleFavorite,
  updateResource,
} from './actions';
import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { AddResourceButton } from './components/AddResourceButton';
import { ResourceList } from './components/ResourceList';
import { FilterBar } from './components/FilterBar';
import { Pagination } from './components/Pagination';

export const dynamic = 'force-dynamic';

type SearchParams = { type?: string; category?: string; favorite?: string; q?: string; page?: string };

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const params = await searchParams;
  const typeIds = params.type ? params.type.split(',').filter(Boolean).map(Number) : undefined;
  const categoryIds = params.category ? params.category.split(',').filter(Boolean).map(Number) : undefined;
  const favoritesOnly = params.favorite === '1';
  const search = params.q || undefined;
  const page = params.page ? Number(params.page) : 1;

  const [{ resources, totalPages, currentPage }, types, categories, shareableUsers] = await Promise.all([
    getResourcesWithFavorites({ typeIds, categoryIds, favoritesOnly, search, page }),
    getTypes(),
    getCategories(),
    getShareableUsers(),
  ]);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold mb-6">Mis links</h1>

      <Suspense fallback={null}>
        <FilterBar types={types} categories={categories} />
      </Suspense>

      <ResourceList
        resources={resources}
        types={types}
        categories={categories}
        shareableUsers={shareableUsers}
        currentUserId={user.id}
        currentUserRole={user.role}
        deleteResource={deleteResource}
        toggleFavorite={toggleFavorite}
        updateResource={updateResource}
      />

      <Suspense fallback={null}>
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </Suspense>

      <AddResourceButton types={types} categories={categories} shareableUsers={shareableUsers} createResource={createResource} />
    </main>
  );
}