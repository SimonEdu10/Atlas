'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

type Props = {
  currentPage: number;
  totalPages: number;
};

export function Pagination({ currentPage, totalPages }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="rounded-lg border border-red-100 px-3 py-2 text-sm disabled:opacity-40 hover:border-red-300"
      >
        ← Anterior
      </button>

      <span className="text-sm text-gray-500 px-2">
        Página {currentPage} de {totalPages}
      </span>

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="rounded-lg border border-red-100 px-3 py-2 text-sm disabled:opacity-40 hover:border-red-300"
      >
        Siguiente →
      </button>
    </div>
  );
}