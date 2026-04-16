import { Page, Locator } from '@playwright/test'

/**
 * Page Object Model for the Posts listing page
 */
export class PostsPage {
  readonly page: Page
  readonly pageTitle: Locator
  readonly pageSubtitle: Locator
  readonly postCards: Locator
  readonly emptyState: Locator
  readonly navigation: Locator

  constructor(page: Page) {
    this.page = page
    this.navigation = page.locator('nav')
    this.pageTitle = page.getByRole('heading', { name: /^Posts$/i })
    this.pageSubtitle = page.getByText(/Essays and analysis/)
    this.postCards = page.locator('a[href^="/posts/"]')
    this.emptyState = page.getByText(/No posts yet/)
  }

  async goto() {
    await this.page.goto('/posts')
    await this.page.waitForLoadState('networkidle')
  }

  async getPostCount() {
    return await this.postCards.count()
  }

  async clickPost(index: number) {
    await this.postCards.nth(index).click()
    await this.page.waitForLoadState('networkidle')
  }

  async getPostTitles() {
    const count = await this.getPostCount()
    const titles: string[] = []

    for (let i = 0; i < count; i++) {
      const title = await this.postCards.nth(i).locator('h2').textContent()
      if (title) titles.push(title.trim())
    }

    return titles
  }

  async getPostByTitle(title: string) {
    return this.postCards.filter({ has: this.page.getByRole('heading', { name: title }) })
  }
}
