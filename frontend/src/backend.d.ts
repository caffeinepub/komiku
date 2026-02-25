import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface Comment {
    id: bigint;
    username: string;
    userId: Uint8Array;
    createdAt: Time;
    text: string;
    chapterId: bigint;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Comic {
    id: bigint;
    status: string;
    title: string;
    createdAt: Time;
    type: string;
    description: string;
    author: string;
    coverImage: string;
    updatedAt: Time;
    viewCount: bigint;
    genres: Array<bigint>;
    artist: string;
}
export interface Genre {
    id: bigint;
    name: string;
}
export interface Chapter {
    id: bigint;
    title: string;
    createdAt: Time;
    comicId: bigint;
    number: bigint;
    pages: Array<string>;
}
export interface UserProfile {
    username: string;
    avatarUrl: string;
}
export interface http_header {
    value: string;
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(chapterId: bigint, text: string, username: string): Promise<Comment>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createChapter(comicId: bigint, number: bigint, title: string, pages: Array<string>): Promise<Chapter>;
    createComic(title: string, description: string, coverImage: string, type: string, genreIds: Array<bigint>, status: string, author: string, artist: string): Promise<Comic>;
    createGenre(name: string): Promise<Genre>;
    deleteChapter(id: bigint): Promise<void>;
    deleteComic(id: bigint): Promise<void>;
    deleteComment(commentId: bigint): Promise<void>;
    deleteGenre(id: bigint): Promise<void>;
    getAllChapters(): Promise<Array<Chapter>>;
    getAllComics(): Promise<Array<Comic>>;
    getAllGenres(): Promise<Array<Genre>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChapterById(id: bigint): Promise<Chapter>;
    getChaptersByComicId(comicId: bigint): Promise<Array<Chapter>>;
    getComicById(id: bigint): Promise<Comic>;
    getComics(genre: bigint | null, type: string | null, status: string | null, search: string | null): Promise<Array<Comic>>;
    getCommentsByChapterId(chapterId: bigint): Promise<Array<Comment>>;
    getLatestUpdatedComics(limit: bigint): Promise<Array<Comic>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    grabComicPages(url: string): Promise<string>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateChapter(id: bigint, number: bigint, title: string, pages: Array<string>): Promise<Chapter>;
    updateComic(id: bigint, title: string, description: string, coverImage: string, type: string, genreIds: Array<bigint>, status: string, author: string, artist: string): Promise<Comic>;
}
