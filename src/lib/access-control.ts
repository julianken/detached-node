/**
 * Access control utilities for Payload collections
 */
import type { Access } from "payload";

/**
 * Access control for content with status field
 * - Authenticated users: full access
 * - Anonymous users: only published content
 */
export const publishedOrAuthenticated: Access = ({ req: { user } }) => {
  if (user) return true;
  return { status: { equals: "published" } };
};

/**
 * Public read access - allows all users to read
 */
export const publicRead: Access = () => true;
