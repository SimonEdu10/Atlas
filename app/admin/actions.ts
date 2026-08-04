'use server';

import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { Role } from '../generated/prisma/client';

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== 'ADMIN') throw new Error('No autorizado');
  return user;
}

export async function getTypesAdmin() {
  return prisma.resourceType.findMany({ orderBy: { name: 'asc' } });
}

export async function getCategoriesAdmin() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

export async function createType(formData: FormData) {
  await requireAdmin();
  const name = formData.get('name') as string;
  if (!name) throw new Error('Falta el nombre');
  await prisma.resourceType.create({ data: { name } });
  revalidatePath('/admin');
}

export async function updateType(id: number, formData: FormData) {
  await requireAdmin();
  const name = formData.get('name') as string;
  if (!name) throw new Error('Falta el nombre');
  await prisma.resourceType.update({ where: { id }, data: { name } });
  revalidatePath('/admin');
}

export async function deleteType(id: number) {
  await requireAdmin();
  await prisma.resourceType.delete({ where: { id } });
  revalidatePath('/admin');
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const name = formData.get('name') as string;
  if (!name) throw new Error('Falta el nombre');
  await prisma.category.create({ data: { name } });
  revalidatePath('/admin');
}

export async function updateCategory(id: number, formData: FormData) {
  await requireAdmin();
  const name = formData.get('name') as string;
  if (!name) throw new Error('Falta el nombre');
  await prisma.category.update({ where: { id }, data: { name } });
  revalidatePath('/admin');
}

export async function deleteCategory(id: number) {
  await requireAdmin();
  await prisma.category.delete({ where: { id } });
  revalidatePath('/admin');
}

export async function getUsersAdmin() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' },
  });
  const order = { PENDING: 0, USER: 1, ADMIN: 2 };
  return users.sort((a, b) => order[a.role] - order[b.role]);
}

export async function updateUserRole(userId: string, role: Role) {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath('/admin/users');
}