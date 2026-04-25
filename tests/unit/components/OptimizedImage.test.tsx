import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import { OptimizedImage } from '@/components/OptimizedImage'

// Mock next/image so we can assert prop pass-through without the full Next pipeline.
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    blurDataURL,
    placeholder,
    className,
    fill,
    priority,
    fetchPriority,
    sizes,
    width,
    height,
    style,
    ...rest
  }: {
    src: string
    alt: string
    blurDataURL?: string
    placeholder?: string
    className?: string
    fill?: boolean
    priority?: boolean
    fetchPriority?: string
    sizes?: string
    width?: number
    height?: number
    style?: React.CSSProperties
    [key: string]: unknown
  }) => {
    void rest
    return React.createElement('img', {
      src,
      alt,
      className,
      style,
      'data-blur-data-url': blurDataURL,
      'data-placeholder': placeholder,
      'data-fill': fill ? 'true' : undefined,
      'data-priority': priority ? 'true' : undefined,
      'data-fetch-priority': fetchPriority,
      'data-sizes': sizes,
      'data-width': width,
      'data-height': height,
    })
  },
}))

const FALLBACK_1X1_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='

describe('OptimizedImage blurDataURL prop', () => {
  it('forwards a custom blurDataURL prop to next/image', () => {
    const { container } = render(
      <OptimizedImage
        fill
        src="/media/test.png"
        alt="test"
        blurDataURL="data:foo"
      />
    )
    const img = container.querySelector('img')
    expect(img?.getAttribute('data-blur-data-url')).toBe('data:foo')
  })

  it('uses the 1×1 transparent PNG fallback when blurDataURL is not provided', () => {
    const { container } = render(
      <OptimizedImage fill src="/media/test.png" alt="test" />
    )
    const img = container.querySelector('img')
    expect(img?.getAttribute('data-blur-data-url')).toBe(FALLBACK_1X1_PNG)
  })

  it('uses the 1×1 PNG fallback when blurDataURL is explicitly undefined', () => {
    const { container } = render(
      <OptimizedImage fill src="/media/test.png" alt="test" blurDataURL={undefined} />
    )
    const img = container.querySelector('img')
    expect(img?.getAttribute('data-blur-data-url')).toBe(FALLBACK_1X1_PNG)
  })

  it('does not pass blurDataURL when placeholder="empty"', () => {
    const { container } = render(
      <OptimizedImage fill src="/media/test.png" alt="test" placeholder="empty" />
    )
    const img = container.querySelector('img')
    // placeholder="empty" must not materialise a blur data URL
    expect(img?.getAttribute('data-blur-data-url')).toBeNull()
  })
})
