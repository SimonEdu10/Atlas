'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Prisma } from '../app/generated/prisma/client';
import { getSessionUser } from '@/lib/session';
import { put } from '@vercel/blob';

async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new Error('No autenticado');
  return user;
}

const PAGE_SIZE = 8;

export async function getResourcesWithFavorites(filters: {
  typeIds?: number[];
  categoryIds?: number[];
  favoritesOnly?: boolean;
  search?: string;
  page?: number;
} = {}) {
  const user = await getSessionUser();
  const userId = user?.id;
  const page = filters.page ?? 1;

  const andConditions: any[] = [];

  if (user?.role !== 'SUPER_ADMIN') {
    andConditions.push(
      userId
        ? {
            OR: [
              { visibility: 'PUBLIC' },
              { creatorId: userId },
              { visibility: 'PRIVATE_SHARED', shares: { some: { userId } } },
            ],
          }
        : { visibility: 'PUBLIC' }
    );
  }

  if (filters.typeIds && filters.typeIds.length > 0) {
    andConditions.push({ typeId: { in: filters.typeIds } });
  }

  if (filters.categoryIds && filters.categoryIds.length > 0) {
    for (const categoryId of filters.categoryIds) {
      andConditions.push({ categories: { some: { categoryId } } });
    }
  }

  if (filters.favoritesOnly && userId) {
    andConditions.push({ favorites: { some: { userId } } });
  }

  if (filters.search) {
    andConditions.push({
      OR: [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ],
    });
  }

  const where = andConditions.length > 0 ? { AND: andConditions } : {};

  const [resources, totalCount] = await Promise.all([
    prisma.resource.findMany({
      where,
      include: {
        type: true,
        categories: { include: { category: true } },
        favorites: userId ? { where: { userId } } : false,
        creator: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.resource.count({ where }),
  ]);

  return {
    resources: resources.map((r) => ({ ...r, isFavorite: userId ? r.favorites.length > 0 : false })),
    totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    currentPage: page,
  };
}

export async function getShareableUsers() {
  const currentUser = await requireUser();
  return prisma.user.findMany({
    where: { id: { not: currentUser.id }, role: { in: ['USER', 'ADMIN', 'SUPER_ADMIN'] } },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  });
}

export async function toggleFavorite(resourceId: number) {
  const user = await requireUser();

  const existing = await prisma.favorite.findUnique({
    where: { userId_resourceId: { userId: user.id, resourceId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({ data: { userId: user.id, resourceId } });
  }

  revalidatePath('/');
}

export async function getTypes() {
  return prisma.resourceType.findMany({ orderBy: { name: 'asc' } });
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

async function saveImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const blob = await put(filename, file, { access: 'public' });
  return blob.url;
}

export async function createResource(formData: FormData): Promise<{ error: string } | { success: true }> {
  const user = await requireUser();

  const title = formData.get('title') as string;
  const url = formData.get('url') as string;
  const description = (formData.get('description') as string) || null;
  const typeId = Number(formData.get('typeId'));
  const categoryIds = formData.getAll('categoryIds').map(Number);
  const imageFile = formData.get('image') as File | null;
  const visibility = (formData.get('visibility') as string) || 'PUBLIC';
  const sharedUserIds = formData.getAll('sharedUserIds').map(String);

  if (!title || !url || !typeId) return { error: 'Faltan campos obligatorios.' };

  let imgUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    imgUrl = await saveImage(imageFile);
  }

  try {
    await prisma.resource.create({
      data: {
        title,
        url,
        description,
        typeId,
        imgUrl,
        visibility: visibility as any,
        creatorId: user.id,
        categories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
        ...(visibility === 'PRIVATE_SHARED'
          ? { shares: { create: sharedUserIds.map((userId) => ({ userId })) } }
          : {}),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { error: 'Ya guardaste este link antes.' };
    }
    throw error;
  }

  revalidatePath('/');
  return { success: true };
}

export async function deleteResource(id: number): Promise<{ error: string } | { success: true }> {
  const user = await requireUser();

  if (user.role === 'USER') {
    return { error: 'No tienes permiso para eliminar links.' };
  }

  const resource = await prisma.resource.findUnique({ where: { id }, select: { creatorId: true } });
  if (!resource) return { error: 'El recurso no existe.' };

  if (user.role === 'ADMIN' && resource.creatorId !== user.id) {
    return { error: 'No puedes eliminar links creados por otro admin.' };
  }

  await prisma.resource.delete({ where: { id } });
  revalidatePath('/');
  return { success: true };
}

export async function updateResource(id: number, formData: FormData): Promise<{ error: string } | { success: true }> {
  const user = await requireUser();

  const existing = await prisma.resource.findUnique({ where: { id }, select: { creatorId: true } });
  if (!existing) return { error: 'El recurso no existe.' };
  if (user.role !== 'SUPER_ADMIN' && existing.creatorId !== user.id) {
    return { error: 'No tienes permiso para editar este link.' };
  }

  const title = formData.get('title') as string;
  const url = formData.get('url') as string;
  const description = (formData.get('description') as string) || null;
  const typeId = Number(formData.get('typeId'));
  const categoryIds = formData.getAll('categoryIds').map(Number);
  const imageFile = formData.get('image') as File | null;
  const visibility = (formData.get('visibility') as string) || 'PUBLIC';
  const sharedUserIds = formData.getAll('sharedUserIds').map(String);

  if (!title || !url || !typeId) return { error: 'Faltan campos obligatorios.' };

  let imgUrl: string | undefined = undefined;
  if (imageFile && imageFile.size > 0) {
    imgUrl = await saveImage(imageFile);
  }

  try {
    await prisma.resourceCategory.deleteMany({ where: { resourceId: id } });
    await prisma.resourceShare.deleteMany({ where: { resourceId: id } });
    await prisma.resource.update({
      where: { id },
      data: {
        title,
        url,
        description,
        typeId,
        ...(imgUrl ? { imgUrl } : {}),
        visibility: visibility as any,
        categories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
        ...(visibility === 'PRIVATE_SHARED'
          ? { shares: { create: sharedUserIds.map((userId) => ({ userId })) } }
          : {}),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { error: 'Ya existe otro link con esa URL.' };
    }
    throw error;
  }

  revalidatePath('/');
  return { success: true };
}