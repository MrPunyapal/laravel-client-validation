import { describe, it, expect } from 'vitest'
import inArray from '../../../resources/js/core/rules/in.js'

describe('In Rule', () => {
  it('should allow empty values', () => {
    expect(inArray('', ['active', 'inactive'])).toBe(true)
    expect(inArray(null, ['active', 'inactive'])).toBe(true)
    expect(inArray(undefined, ['active', 'inactive'])).toBe(true)
  })

  it('should accept values in the allowed list', () => {
    expect(inArray('active', ['active', 'inactive', 'pending'])).toBe(true)
    expect(inArray('inactive', ['active', 'inactive', 'pending'])).toBe(true)
    expect(inArray('pending', ['active', 'inactive', 'pending'])).toBe(true)
  })

  it('should reject values not in the allowed list', () => {
    expect(inArray('deleted', ['active', 'inactive', 'pending'])).toBe(false)
    expect(inArray('unknown', ['active', 'inactive', 'pending'])).toBe(false)
    expect(inArray('ACTIVE', ['active', 'inactive', 'pending'])).toBe(false)
  })

  it('should handle numeric values', () => {
    expect(inArray(1, ['1', '2', '3'])).toBe(true)
    expect(inArray('1', ['1', '2', '3'])).toBe(true)
    expect(inArray(4, ['1', '2', '3'])).toBe(false)
    expect(inArray('4', ['1', '2', '3'])).toBe(false)
  })

  it('should handle zero values', () => {
    expect(inArray(0, ['0', '1', '2'])).toBe(true)
    expect(inArray('0', ['0', '1', '2'])).toBe(true)
  })

  it('should be case sensitive', () => {
    expect(inArray('Active', ['active', 'inactive'])).toBe(false)
    expect(inArray('ACTIVE', ['active', 'inactive'])).toBe(false)
    expect(inArray('active', ['Active', 'Inactive'])).toBe(false)
  })
})
