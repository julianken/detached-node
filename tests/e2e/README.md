# E2E Test Utilities

This directory contains reusable test utilities, fixtures, and page objects for Playwright E2E tests.

## Structure

```
tests/e2e/
├── fixtures/
│   ├── index.ts                  # Export all fixtures
│   ├── auth.fixture.ts           # Authenticated admin fixture
│   ├── test-base.ts              # Extended test with all page objects
│   └── page-objects/
│       ├── home.page.ts          # Home page
│       ├── posts.page.ts         # Posts listing page
│       ├── post-detail.page.ts   # Individual post page
│       ├── about.page.ts         # About page
│       └── admin/
│           ├── admin-login.page.ts      # Admin login
│           ├── admin-dashboard.page.ts  # Admin dashboard
│           ├── admin-collection.page.ts # Collection list view
│           └── admin-editor.page.ts     # Document editor
├── helpers/
│   ├── index.ts                  # Export all helpers
│   ├── rich-text.helper.ts       # Lexical editor helpers
│   ├── media.helper.ts           # Media upload helpers
│   ├── relationship.helper.ts    # Relationship field helpers
│   └── assertions.helper.ts      # Common assertions
└── example.spec.ts               # Example tests using fixtures
```

## Usage

### Using Page Objects

Import the test base to get access to all page objects as fixtures:

```typescript
import { test, expect } from './fixtures'

test('homepage test', async ({ homePage }) => {
  await homePage.goto()
  await expect(homePage.heroTitle).toBeVisible()
})
```

### Available Page Object Fixtures

- `homePage` - Home page
- `postsPage` - Posts listing page
- `postDetailPage` - Individual post detail page
- `aboutPage` - About page
- `adminLoginPage` - Admin login page
- `adminDashboardPage` - Admin dashboard
- `adminCollectionPage` - Collection list view
- `adminEditorPage` - Document editor

### Using Helpers

Import helpers from the helpers directory:

```typescript
import { test, expect } from './fixtures'
import {
  fillRichText,
  uploadMedia,
  selectRelationship,
  expectValidationError
} from './helpers'

test('create post', async ({ adminEditorPage }) => {
  await adminEditorPage.gotoCreate('posts')

  // Fill text fields
  await adminEditorPage.fillField('title', 'My Post')
  await adminEditorPage.fillField('slug', 'my-post')

  // Fill rich text editor
  await fillRichText(adminEditorPage.page, 'Post content here', 'content')

  // Upload media
  await uploadMedia(adminEditorPage.page, '/path/to/image.png', 'featuredImage')

  // Select relationship
  await selectRelationship(adminEditorPage.page, 'author', 'John Doe')

  // Save
  await adminEditorPage.save()
})
```

### Authentication

Tests automatically use authenticated admin session. The auth setup runs once before all tests:

- Test credentials: `test@example.com` / `testpassword123`
- Auth state is saved to `tests/.auth/admin.json`
- Auth state is reused across all tests for efficiency

To run tests without authentication, use the regular `page` fixture instead of page objects.

### Helper Functions

#### Rich Text Helpers

```typescript
// Fill editor with plain text
await fillRichText(page, 'Content here', 'fieldName')

// Format selected text
await formatRichText(page, 'bold')
await formatRichText(page, 'italic')

// Insert heading
await insertHeading(page, 1, 'My Heading')

// Insert link
await insertLink(page, 'https://example.com', 'Link text')

// Get content
const content = await getRichTextContent(page, 'fieldName')
```

#### Media Helpers

```typescript
// Upload single file
await uploadMedia(page, '/path/to/file.png', 'fieldName')

// Upload multiple files
await uploadMultipleMedia(page, ['/path/1.png', '/path/2.png'], 'fieldName')

// Remove uploaded media
await removeMedia(page, 'fieldName')

// Create test image
const testImagePath = await createTestImage('test.png')

// Check if media is present
const hasImage = await hasMedia(page, 'fieldName')
```

#### Relationship Helpers

```typescript
// Select single relationship
await selectRelationship(page, 'author', 'John Doe')

// Select multiple relationships
await selectMultipleRelationships(page, 'tags', ['Tag 1', 'Tag 2'])

// Search and select
await searchAndSelectRelationship(page, 'author', 'john', 'John Doe')

// Remove relationship
await removeRelationship(page, 'author')

// Get selected values
const selected = await getSelectedRelationships(page, 'tags')

// Clear all
await clearAllRelationships(page, 'tags')
```

#### Assertion Helpers

```typescript
// Validation errors
await expectValidationError(page, 'title', 'required')
await expectNoValidationError(page, 'title')
await expectRequiredError(page, 'title')

// Form errors
await expectFormError(page, 'Failed to save')
await expectSuccess(page, 'Saved successfully')

// Field values
await expectFieldValue(page, 'title', 'My Title')
await expectFieldChecked(page, 'featured')
await expectFieldUnchecked(page, 'draft')
await expectFieldDisabled(page, 'slug')
await expectFieldEnabled(page, 'title')

// General assertions
await expectVisible(locator)
await expectNotVisible(locator)
await expectCount(locator, 5)
await expectUrl(page, /\/admin\/posts/)
await expectTitle(page, /Dashboard/)
```

## Page Object Pattern

Each page object encapsulates:
- **Locators**: Selectors for page elements
- **Navigation**: Methods to navigate to the page
- **Actions**: Methods for common user interactions
- **Queries**: Methods to retrieve page data

Example:

```typescript
class HomePage {
  readonly heroTitle: Locator

  async goto() {
    await this.page.goto('/')
  }

  async getFeaturedPostCount() {
    return await this.featuredPostCards.count()
  }
}
```

## Best Practices

1. **Use page objects** for all page interactions
2. **Use helper functions** for complex operations (rich text, media, etc.)
3. **Use assertion helpers** for consistent error checking
4. **Keep tests readable** - page objects abstract DOM details
5. **Reuse fixtures** - avoid duplicating page object creation
6. **Name tests clearly** - describe what they test, not how

## Examples

See `example.spec.ts` for working examples of:
- Using page object fixtures
- Using helper functions
- Using assertion helpers
- Testing navigation
- Testing forms
