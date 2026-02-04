/**
 * Centralized exports for all test fixtures and page objects
 * Import everything you need from this single entry point
 */

// Test base with all fixtures
export { test, expect } from './test-base'

// Auth utilities
export { setupAuth, STORAGE_STATE, TEST_ADMIN } from './auth.fixture'

// Page Objects - Public pages
export { HomePage } from './page-objects/home.page'
export { PostsPage } from './page-objects/posts.page'
export { PostDetailPage } from './page-objects/post-detail.page'
export { AboutPage } from './page-objects/about.page'

// Page Objects - Admin pages
export { AdminLoginPage } from './page-objects/admin/admin-login.page'
export { AdminDashboardPage } from './page-objects/admin/admin-dashboard.page'
export { AdminCollectionPage } from './page-objects/admin/admin-collection.page'
export { AdminEditorPage } from './page-objects/admin/admin-editor.page'
