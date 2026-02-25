import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Comic, Chapter, Comment, Genre, UserProfile } from '../backend';
import { UserRole } from '../backend';

// ─── Genres ───────────────────────────────────────────────────────────────────

export function useGetAllGenres() {
  const { actor, isFetching } = useActor();
  return useQuery<Genre[]>({
    queryKey: ['genres'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllGenres();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateGenre() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createGenre(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'] });
    },
  });
}

export function useDeleteGenre() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteGenre(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'] });
    },
  });
}

// ─── Comics ───────────────────────────────────────────────────────────────────

export function useGetComics(filters: {
  genre?: bigint | null;
  type?: string | null;
  status?: string | null;
  search?: string | null;
}) {
  const { actor, isFetching } = useActor();
  // Serialize bigint to string for query key to avoid BigInt-in-query-key lint error
  const queryKey = [
    'comics',
    filters.genre != null ? filters.genre.toString() : null,
    filters.type ?? null,
    filters.status ?? null,
    filters.search ?? null,
  ];
  return useQuery<Comic[]>({
    queryKey,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getComics(
        filters.genre ?? null,
        filters.type ?? null,
        filters.status ?? null,
        filters.search ?? null
      );
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllComics() {
  const { actor, isFetching } = useActor();
  return useQuery<Comic[]>({
    queryKey: ['allComics'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllComics();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetComicById(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Comic>({
    queryKey: ['comic', id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) throw new Error('Actor or ID not available');
      return actor.getComicById(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useGetLatestUpdatedComics(limit: number) {
  const { actor, isFetching } = useActor();
  return useQuery<Comic[]>({
    queryKey: ['latestComics', limit],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLatestUpdatedComics(BigInt(limit));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateComic() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      coverImage: string;
      type: string;
      genreIds: bigint[];
      status: string;
      author: string;
      artist: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createComic(
        data.title,
        data.description,
        data.coverImage,
        data.type,
        data.genreIds,
        data.status,
        data.author,
        data.artist
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comics'] });
      queryClient.invalidateQueries({ queryKey: ['allComics'] });
      queryClient.invalidateQueries({ queryKey: ['latestComics'] });
    },
  });
}

export function useUpdateComic() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      description: string;
      coverImage: string;
      type: string;
      genreIds: bigint[];
      status: string;
      author: string;
      artist: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateComic(
        data.id,
        data.title,
        data.description,
        data.coverImage,
        data.type,
        data.genreIds,
        data.status,
        data.author,
        data.artist
      );
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['comics'] });
      queryClient.invalidateQueries({ queryKey: ['allComics'] });
      queryClient.invalidateQueries({ queryKey: ['comic', vars.id.toString()] });
      queryClient.invalidateQueries({ queryKey: ['latestComics'] });
    },
  });
}

export function useDeleteComic() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteComic(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comics'] });
      queryClient.invalidateQueries({ queryKey: ['allComics'] });
      queryClient.invalidateQueries({ queryKey: ['latestComics'] });
    },
  });
}

// ─── Chapters ─────────────────────────────────────────────────────────────────

export function useGetChaptersByComicId(comicId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Chapter[]>({
    queryKey: ['chapters', comicId?.toString()],
    queryFn: async () => {
      if (!actor || comicId === null) return [];
      return actor.getChaptersByComicId(comicId);
    },
    enabled: !!actor && !isFetching && comicId !== null,
  });
}

export function useGetChapterById(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Chapter>({
    queryKey: ['chapter', id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) throw new Error('Actor or ID not available');
      return actor.getChapterById(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useGetAllChapters() {
  const { actor, isFetching } = useActor();
  return useQuery<Chapter[]>({
    queryKey: ['allChapters'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllChapters();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateChapter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      comicId: bigint;
      number: bigint;
      title: string;
      pages: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createChapter(data.comicId, data.number, data.title, data.pages);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['chapters', vars.comicId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['allChapters'] });
      queryClient.invalidateQueries({ queryKey: ['allComics'] });
      queryClient.invalidateQueries({ queryKey: ['latestComics'] });
    },
  });
}

export function useUpdateChapter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      comicId: bigint;
      number: bigint;
      title: string;
      pages: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateChapter(data.id, data.number, data.title, data.pages);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['chapters', vars.comicId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['chapter', vars.id.toString()] });
      queryClient.invalidateQueries({ queryKey: ['allChapters'] });
    },
  });
}

export function useDeleteChapter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: bigint; comicId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteChapter(data.id);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['chapters', vars.comicId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['allChapters'] });
    },
  });
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export function useGetCommentsByChapterId(chapterId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Comment[]>({
    queryKey: ['comments', chapterId?.toString()],
    queryFn: async () => {
      if (!actor || chapterId === null) return [];
      return actor.getCommentsByChapterId(chapterId);
    },
    enabled: !!actor && !isFetching && chapterId !== null,
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { chapterId: bigint; text: string; username: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addComment(data.chapterId, data.text, data.username);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['comments', vars.chapterId.toString()] });
    },
  });
}

export function useDeleteComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { commentId: bigint; chapterId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteComment(data.commentId);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['comments', vars.chapterId.toString()] });
    },
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

/**
 * Claim admin: assigns the caller as admin (one-time operation).
 * Uses assignCallerUserRole with the caller's own principal and admin role.
 * This only works if no admin has been set yet (backend enforces this).
 */
export function useClaimAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (callerPrincipal: import('@dfinity/principal').Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignCallerUserRole(callerPrincipal, UserRole.admin);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
    },
  });
}

export function useGrabComicPages() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (url: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.grabComicPages(url);
    },
  });
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
