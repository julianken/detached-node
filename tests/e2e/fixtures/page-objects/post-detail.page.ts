import { Page, Locator } from '@playwright/test'

/**
 * Page Object Model for individual Post detail page
 */
export class PostDetailPage {
  readonly page: Page
  readonly postTitle: Locator
  readonly postDate: Locator
  readonly postSummary: Locator
  readonly postContent: Locator
  readonly backToPostsLink: Locator
  readonly navigation: Locator

  constructor(page: Page) {
    this.page = page
    this.navigation = page.locator('nav')
    this.postTitle = page.locator('article h1').first()
    this.postDate = page.locator('article header p').last()
    this.postSummary = page.locator('article p.text-lg').first()
    this.postContent = page.locator('article section.prose')
    this.backToPostsLink = page.getByRole('link', { name: /back to posts/i })
  }

  async goto(slug: string) {
    await this.page.goto(`/posts/${slug}`)
    await this.page.waitForLoadState('domcontentloaded')
  }

  async getPostTitle() {
    return await this.postTitle.textContent()
  }

  async getPostDate() {
    return await this.postDate.textContent()
  }

  async getPostSummary() {
    return await this.postSummary.textContent()
  }

  async clickBackToPosts() {
    await this.backToPostsLink.click()
    await this.page.waitForURL(/\/posts$/)
  }
}
