import { Page, Locator } from '@playwright/test'

/**
 * Page Object Model for the Home page
 */
export class HomePage {
  readonly page: Page
  readonly heroTitle: Locator
  readonly heroSubtitle: Locator
  readonly browsePostsButton: Locator
  readonly aboutButton: Locator
  readonly featuredPostsSection: Locator
  readonly featuredPostsHeading: Locator
  readonly featuredPostCards: Locator
  readonly navigation: Locator

  constructor(page: Page) {
    this.page = page
    this.navigation = page.locator('nav')
    this.heroTitle = page.getByRole('heading', { name: /autonomous systems/i })
    this.heroSubtitle = page.locator('section').first().getByText(/agentic AI workflows/i)
    this.browsePostsButton = page.getByRole('link', { name: /browse the archive/i })
    this.aboutButton = page.getByRole('link', { name: /about this project/i })
    this.featuredPostsHeading = page.getByRole('heading', { name: /featured posts/i })
    this.featuredPostsSection = page.locator('section').last()
    this.featuredPostCards = page.locator('section').last().locator('a[href^="/posts/"]')
  }

  async goto() {
    await this.page.goto('/')
    await this.page.waitForLoadState('domcontentloaded')
  }

  async getFeaturedPostCount() {
    return await this.featuredPostCards.count()
  }

  async clickBrowsePosts() {
    await this.browsePostsButton.click()
    await this.page.waitForURL(/\/posts$/)
  }

  async clickAbout() {
    await this.aboutButton.click()
    await this.page.waitForURL(/\/about$/)
  }

  async getFeaturedPostTitles() {
    const count = await this.getFeaturedPostCount()
    const titles: string[] = []

    for (let i = 0; i < count; i++) {
      const title = await this.featuredPostCards.nth(i).locator('h3').textContent()
      if (title) titles.push(title)
    }

    return titles
  }
}
