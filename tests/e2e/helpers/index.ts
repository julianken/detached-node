/**
 * Centralized exports for all test helpers
 * Import utility functions from this single entry point
 */

// Rich text editor helpers
export {
  fillRichText,
  formatRichText,
  insertHeading,
  insertLink,
  getRichTextContent,
} from './rich-text.helper'

// Media upload helpers
export {
  uploadMedia,
  uploadMultipleMedia,
  removeMedia,
  createTestImage,
  hasMedia,
} from './media.helper'

// Relationship field helpers
export {
  selectRelationship,
  selectMultipleRelationships,
  searchAndSelectRelationship,
  removeRelationship,
  getSelectedRelationships,
  clearAllRelationships,
} from './relationship.helper'

// Assertion helpers
export {
  expectValidationError,
  expectNoValidationError,
  expectRequiredError,
  expectFormError,
  expectSuccess,
  expectFieldValue,
  expectFieldChecked,
  expectFieldUnchecked,
  expectFieldDisabled,
  expectFieldEnabled,
  expectCount,
  expectUrl,
  expectTitle,
  expectVisible,
  expectNotVisible,
} from './assertions.helper'
