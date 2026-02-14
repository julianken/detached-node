/**
 * Branded types for domain primitives
 *
 * These types add compile-time guarantees that values have been validated
 * and conform to domain rules (e.g., slugs are URL-safe, dates are valid ISO strings).
 *
 * Branded types use TypeScript's structural typing system with a phantom property
 * to create nominal types that cannot be accidentally mixed with raw primitives.
 *
 * @example
 * ```typescript
 * // This will fail at compile time - can't assign string to Slug
 * const badSlug: Slug = "some-slug";
 *
 * // This is the correct way - validates and brands the value
 * const goodSlug = toSlug("some-slug");
 * ```
 */

// Nominal typing helper - creates a unique brand for each type
declare const __brand: unique symbol;
type Brand<T, TBrand extends string> = T & { readonly [__brand]: TBrand };

/**
 * URL-safe slug (lowercase, hyphens, alphanumeric)
 * Must match pattern: /^[a-z0-9-]+$/
 * Length constraints: 1-200 characters
 */
export type Slug = Brand<string, "Slug">;

/**
 * ISO 8601 date string (e.g., "2024-01-15T10:30:00.000Z")
 * Must be a valid date that roundtrips through Date parsing
 */
export type ISODateString = Brand<string, "ISODateString">;

/**
 * Payload CMS document ID (UUID v4 format)
 * Used by Payload CMS with PostgreSQL adapter
 */
export type DocumentId = Brand<string, "DocumentId">;

/**
 * Email address (validated format)
 * Basic format validation - not exhaustive RFC 5322 compliance
 */
export type Email = Brand<string, "Email">;

// =============================================================================
// Slug validation and branding
// =============================================================================

/**
 * Slug validation pattern - lowercase alphanumeric with hyphens
 * Does not allow consecutive hyphens or leading/trailing hyphens
 */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Maximum length for slugs
 */
const SLUG_MAX_LENGTH = 200;

/**
 * Validate that a string is a valid slug format
 *
 * @param value - The string to validate
 * @returns True if the value is a valid slug format
 *
 * @example
 * ```typescript
 * isValidSlug("hello-world") // true
 * isValidSlug("Hello-World") // false - uppercase
 * isValidSlug("hello--world") // false - consecutive hyphens
 * isValidSlug("-hello") // false - leading hyphen
 * ```
 */
export function isValidSlug(value: string): value is Slug {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= SLUG_MAX_LENGTH &&
    SLUG_PATTERN.test(value)
  );
}

/**
 * Validate and brand a string as a Slug
 *
 * @param value - The string to validate and brand
 * @returns The branded Slug value
 * @throws Error if the value is not a valid slug format
 *
 * @example
 * ```typescript
 * const slug = toSlug("hello-world"); // Slug type
 * toSlug("Hello-World"); // throws Error
 * ```
 */
export function toSlug(value: string): Slug {
  if (!isValidSlug(value)) {
    throw new Error(
      `Invalid slug format: "${value}". ` +
        `Slugs must be 1-${SLUG_MAX_LENGTH} characters, ` +
        `lowercase alphanumeric with single hyphens between words.`
    );
  }
  return value;
}

/**
 * Safely attempt to convert a string to a Slug
 *
 * @param value - The string to validate
 * @returns The branded Slug or null if invalid
 *
 * @example
 * ```typescript
 * const slug = tryToSlug("hello-world"); // Slug | null
 * if (slug) {
 *   // slug is Slug type here
 * }
 * ```
 */
export function tryToSlug(value: string): Slug | null {
  return isValidSlug(value) ? value : null;
}

// =============================================================================
// ISO Date String validation and branding
// =============================================================================

/**
 * Validate that a string is a valid ISO 8601 date string
 *
 * @param value - The string to validate
 * @returns True if the value is a valid ISO date string
 *
 * @example
 * ```typescript
 * isValidISODateString("2024-01-15T10:30:00.000Z") // true
 * isValidISODateString("2024-01-15") // false - not full ISO format
 * isValidISODateString("invalid") // false
 * ```
 */
export function isValidISODateString(value: string): value is ISODateString {
  if (typeof value !== "string") return false;

  const date = new Date(value);
  if (isNaN(date.getTime())) return false;

  // Check if the value is in ISO format (toISOString roundtrips correctly)
  // This ensures we have the full ISO 8601 format with timezone
  return date.toISOString() === value;
}

/**
 * Validate and brand a string or Date as an ISODateString
 *
 * @param value - The string or Date to validate and brand
 * @returns The branded ISODateString value
 * @throws Error if the value is not a valid ISO date string
 *
 * @example
 * ```typescript
 * const date = toISODateString(new Date()); // ISODateString type
 * const dateStr = toISODateString("2024-01-15T10:30:00.000Z"); // ISODateString type
 * toISODateString("invalid"); // throws Error
 * ```
 */
export function toISODateString(value: string | Date): ISODateString {
  if (value instanceof Date) {
    if (isNaN(value.getTime())) {
      throw new Error("Invalid Date object: date is NaN");
    }
    return value.toISOString() as ISODateString;
  }

  if (!isValidISODateString(value)) {
    throw new Error(
      `Invalid ISO date string: "${value}". ` +
        `Expected format: YYYY-MM-DDTHH:mm:ss.sssZ`
    );
  }
  return value;
}

/**
 * Safely attempt to convert a string or Date to an ISODateString
 *
 * @param value - The string or Date to validate
 * @returns The branded ISODateString or null if invalid
 */
export function tryToISODateString(value: string | Date): ISODateString | null {
  try {
    return toISODateString(value);
  } catch {
    return null;
  }
}

// =============================================================================
// Document ID validation and branding
// =============================================================================

/**
 * Validate that a value is a valid Payload document ID
 * Payload with PostgreSQL uses UUID v4 format
 *
 * @param value - The value to validate
 * @returns True if the value is a valid document ID
 */
export function isValidDocumentId(value: unknown): value is DocumentId {
  const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return typeof value === "string" && UUID_V4_PATTERN.test(value);
}

/**
 * Validate and brand a string as a DocumentId
 *
 * @param value - The UUID string to validate and brand
 * @returns The branded DocumentId value
 * @throws Error if the value is not a valid document ID
 */
export function toDocumentId(value: string): DocumentId {
  if (!isValidDocumentId(value)) {
    throw new Error(
      `Invalid document ID: ${value}. ` +
        `Document IDs must be valid UUID v4 strings.`
    );
  }
  return value;
}

/**
 * Safely attempt to convert a string to a DocumentId
 *
 * @param value - The UUID string to validate
 * @returns The branded DocumentId or null if invalid
 */
export function tryToDocumentId(value: string): DocumentId | null {
  return isValidDocumentId(value) ? value : null;
}

// =============================================================================
// Email validation and branding
// =============================================================================

/**
 * Basic email validation pattern
 * This is intentionally permissive - full RFC 5322 compliance is rarely needed
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate that a string is a valid email format
 *
 * @param value - The string to validate
 * @returns True if the value matches basic email format
 */
export function isValidEmail(value: string): value is Email {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 254 && // RFC 5321 max length
    EMAIL_PATTERN.test(value)
  );
}

/**
 * Validate and brand a string as an Email
 *
 * @param value - The string to validate and brand
 * @returns The branded Email value
 * @throws Error if the value is not a valid email format
 */
export function toEmail(value: string): Email {
  if (!isValidEmail(value)) {
    throw new Error(`Invalid email format: "${value}"`);
  }
  return value;
}

/**
 * Safely attempt to convert a string to an Email
 *
 * @param value - The string to validate
 * @returns The branded Email or null if invalid
 */
export function tryToEmail(value: string): Email | null {
  return isValidEmail(value) ? value : null;
}

// =============================================================================
// Type utilities
// =============================================================================

/**
 * Extract the underlying primitive type from a branded type
 *
 * @example
 * ```typescript
 * type SlugBase = Unbrand<Slug>; // string
 * type IdBase = Unbrand<DocumentId>; // number
 * ```
 */
export type Unbrand<T> = T extends Brand<infer U, string> ? U : T;

/**
 * Helper to check if a value matches a branded type at runtime
 * Useful for type guards in generic contexts
 */
export type BrandValidator<T> = (value: unknown) => value is T;
