import { describe, it, expect } from 'vitest'
import numeric from '../../../resources/js/core/rules/numeric.js'

describe('Numeric Rule', () => {
  it('should allow empty values', () => {
    expect(numeric('')).toBe(true)
    expect(numeric(null)).toBe(true)
    expect(numeric(undefined)).toBe(true)
  })

  it('should validate numeric strings', () => {
    expect(numeric('123')).toBe(true)
    expect(numeric('123.45')).toBe(true)
    expect(numeric('0')).toBe(true)
    expect(numeric('-123')).toBe(true)
    expect(numeric('-123.45')).toBe(true)
    expect(numeric('0.0')).toBe(true)
  })

  it('should validate numeric values', () => {
    expect(numeric(123)).toBe(true)
    expect(numeric(123.45)).toBe(true)
    expect(numeric(0)).toBe(true)
    expect(numeric(-123)).toBe(true)
    expect(numeric(-123.45)).toBe(true)
  })

  it('should reject non-numeric values', () => {
    expect(numeric('abc')).toBe(false)
    expect(numeric('123abc')).toBe(false)
    expect(numeric('abc123')).toBe(false)
    expect(numeric('12.34.56')).toBe(false)
    expect(numeric('--123')).toBe(false)
    expect(numeric('12-34')).toBe(false)
    expect(numeric({})).toBe(false)
    expect(numeric([])).toBe(false)
    expect(numeric(true)).toBe(false)
    expect(numeric(false)).toBe(false)
  })

  it('should handle edge cases', () => {
    expect(numeric('Infinity')).toBe(false)
    expect(numeric('NaN')).toBe(false)
    expect(numeric(Infinity)).toBe(false)
    expect(numeric(NaN)).toBe(false)
  })
})
