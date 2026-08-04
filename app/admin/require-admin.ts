import { getSessionUser } from '@/lib/session';

export async function requireAdminPage() {
  const user = await getSessionUser();
  if (!user || user.role !== 'ADMIN') return { authorized: false as const };
  return { authorized: true as const, user };
}