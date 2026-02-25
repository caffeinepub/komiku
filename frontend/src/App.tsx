import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/Layout';
import AdminLayout from './components/admin/AdminLayout';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import ComicDetailPage from './pages/ComicDetailPage';
import ChapterReaderPage from './pages/ChapterReaderPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ComicManagementPage from './pages/admin/ComicManagementPage';
import ChapterManagementPage from './pages/admin/ChapterManagementPage';
import GenreManagementPage from './pages/admin/GenreManagementPage';
import CommentModerationPage from './pages/admin/CommentModerationPage';
import ChapterGrabbingPage from './pages/admin/ChapterGrabbingPage';

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Public layout route
const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'public-layout',
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

// Public routes
const homeRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/',
  component: HomePage,
});

const browseRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/browse',
  component: BrowsePage,
});

const comicDetailRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/comic/$id',
  component: ComicDetailPage,
});

const chapterReaderRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/comic/$comicId/chapter/$chapterId',
  component: ChapterReaderPage,
});

// Admin layout route
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'admin-layout',
  component: () => (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  ),
});

// Admin routes
const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin',
  component: AdminDashboardPage,
});

const adminComicsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/comics',
  component: ComicManagementPage,
});

const adminChaptersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/chapters',
  component: ChapterManagementPage,
});

const adminGenresRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/genres',
  component: GenreManagementPage,
});

const adminCommentsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/comments',
  component: CommentModerationPage,
});

const adminGrabRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/grab',
  component: ChapterGrabbingPage,
});

const routeTree = rootRoute.addChildren([
  publicLayoutRoute.addChildren([
    homeRoute,
    browseRoute,
    comicDetailRoute,
    chapterReaderRoute,
  ]),
  adminLayoutRoute.addChildren([
    adminDashboardRoute,
    adminComicsRoute,
    adminChaptersRoute,
    adminGenresRoute,
    adminCommentsRoute,
    adminGrabRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster theme="dark" richColors />
    </>
  );
}
