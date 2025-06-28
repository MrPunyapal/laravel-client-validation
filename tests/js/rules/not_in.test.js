import { describe, it, expect } from 'vitest'
import notIn from '../../../resources/js/core/rules/not_in.js'

describe('Not In Rule', () => {
  it('should allow empty values', () => {
    expect(notIn('', ['admin', 'super_admin'])).toBe(true)
    expect(notIn(null, ['admin', 'super_admin'])).toBe(true)
    expect(notIn(undefined, ['admin', 'super_admin'])).toBe(true)
  })

  it('should accept values not in the forbidden list', () => {
    expect(notIn('user', ['admin', 'super_admin'])).toBe(true)
    expect(notIn('moderator', ['admin', 'super_admin'])).toBe(true)
    expect(notIn('guest', ['admin', 'super_admin'])).toBe(true)
  })

  it('should reject values in the forbidden list', () => {
    expect(notIn('admin', ['admin', 'super_admin'])).toBe(false)
    expect(notIn('super_admin', ['admin', 'super_admin'])).toBe(false)
  })

  it('should handle numeric values', () => {
    expect(notIn(1, ['2', '3', '4'])).toBe(true)
    expect(notIn('1', ['2', '3', '4'])).toBe(true)
    expect(notIn(2, ['2', '3', '4'])).toBe(false)
    expect(notIn('2', ['2', '3', '4'])).toBe(false)
  })

  it('should handle zero values', () => {
    expect(notIn(0, ['1', '2', '3'])).toBe(true)
    expect(notIn('0', ['1', '2', '3'])).toBe(true)
    expect(notIn(0, ['0', '1', '2'])).toBe(false)
    expect(notIn('0', ['0', '1', '2'])).toBe(false)
  })

  it('should be case sensitive', () => {
    expect(notIn('Admin', ['admin', 'super_admin'])).toBe(true)
    expect(notIn('ADMIN', ['admin', 'super_admin'])).toBe(true)
    expect(notIn('admin', ['Admin', 'Super_Admin'])).toBe(true)
  })
})
