import { Page, Locator } from '@playwright/test'

/**
 * Page Object Model for the Home page
 */
export class HomePage {
  readonly page: Page
  readonly heroTitle: Locator
  readonly featuredPostsSection: Locator
  readonly featuredPostsHeading: Locator
  readonly featuredPostCards: Locator
  readonly navigation: Locator

  constructor(page: Page) {
    this.page = page
    this.navigation = page.locator('nav')
    this.heroTitle = page.getByRole('heading', { name: /detached-node/i })
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
