/* eslint-disable react-hooks/rules-of-hooks -- Playwright fixture `use()` is not a React hook */
import { test as base, expect } from '@playwright/test'
import { HomePage } from './page-objects/home.page'
import { PostsPage } from './page-objects/posts.page'
import { PostDetailPage } from './page-objects/post-detail.page'
import { AboutPage } from './page-objects/about.page'
import { AdminLoginPage } from './page-objects/admin/admin-login.page'
import { AdminDashboardPage } from './page-objects/admin/admin-dashboard.page'
import { AdminCollectionPage } from './page-objects/admin/admin-collection.page'
import { AdminEditorPage } from './page-objects/admin/admin-editor.page'

/**
 * Extended test fixtures with all page objects
 * Import from this file instead of @playwright/test to get access to page objects
 *
 * @example
 * import { test, expect } from './fixtures/test-base'
 *
 * test('homepage test', async ({ homePage }) => {
 *   await homePage.goto()
 *   await expect(homePage.heroTitle).toBeVisible()
 * })
 */

type Fixtures = {
  homePage: HomePage
  postsPage: PostsPage
  postDetailPage: PostDetailPage
  aboutPage: AboutPage
  adminLoginPage: AdminLoginPage
  adminDashboardPage: AdminDashboardPage
  adminCollectionPage: AdminCollectionPage
  adminEditorPage: AdminEditorPage
}

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page)
    await use(homePage)
  },

  postsPage: async ({ page }, use) => {
    const postsPage = new PostsPage(page)
    await use(postsPage)
  },

  postDetailPage: async ({ page }, use) => {
    const postDetailPage = new PostDetailPage(page)
    await use(postDetailPage)
  },

  aboutPage: async ({ page }, use) => {
    const aboutPage = new AboutPage(page)
    await use(aboutPage)
  },

  adminLoginPage: async ({ page }, use) => {
    const adminLoginPage = new AdminLoginPage(page)
    await use(adminLoginPage)
  },

  adminDashboardPage: async ({ page }, use) => {
    const adminDashboardPage = new AdminDashboardPage(page)
    await use(adminDashboardPage)
  },

  adminCollectionPage: async ({ page }, use) => {
    const adminCollectionPage = new AdminCollectionPage(page)
    await use(adminCollectionPage)
  },

  adminEditorPage: async ({ page }, use) => {
    const adminEditorPage = new AdminEditorPage(page)
    await use(adminEditorPage)
  },
})

export { expect } from '@playwright/test'
