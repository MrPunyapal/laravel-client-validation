import { describe, it, expect } from 'vitest'
import required from '../../../resources/js/core/rules/required.js'

describe('Required Rule', () => {
  it('should reject empty values', () => {
    expect(required('')).toBe(false)
    expect(required(null)).toBe(false)
    expect(required(undefined)).toBe(false)
    expect(required('   ')).toBe(false)
    expect(required([])).toBe(false)
  })

  it('should accept non-empty values', () => {
    expect(required('hello')).toBe(true)
    expect(required(['item'])).toBe(true)
    expect(required(0)).toBe(true)
    expect(required(false)).toBe(true)
    expect(required('0')).toBe(true)
  })
})
