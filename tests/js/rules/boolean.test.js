import { describe, it, expect } from 'vitest'
import boolean from '../../../resources/js/core/rules/boolean.js'

describe('Boolean Rule', () => {
  it('should allow empty values', () => {
    expect(boolean('')).toBe(true)
    expect(boolean(null)).toBe(true)
    expect(boolean(undefined)).toBe(true)
  })

  it('should accept boolean values', () => {
    expect(boolean(true)).toBe(true)
    expect(boolean(false)).toBe(true)
  })

  it('should accept numeric boolean representations', () => {
    expect(boolean(1)).toBe(true)
    expect(boolean(0)).toBe(true)
    expect(boolean('1')).toBe(true)
    expect(boolean('0')).toBe(true)
  })

  it('should accept string boolean representations', () => {
    expect(boolean('true')).toBe(true)
    expect(boolean('false')).toBe(true)
    expect(boolean('on')).toBe(true)
  })

  it('should reject invalid boolean values', () => {
    expect(boolean('yes')).toBe(false)
    expect(boolean('no')).toBe(false)
    expect(boolean('invalid')).toBe(false)
    expect(boolean('2')).toBe(false)
    expect(boolean(2)).toBe(false)
    expect(boolean('off')).toBe(false)
    expect(boolean([])).toBe(false)
    expect(boolean({})).toBe(false)
  })

  it('should follow Laravel boolean validation rules', () => {
    // Laravel accepts: true, false, 1, 0, "1", "0", "true", "false", "on"
    const validValues = [true, false, 1, 0, '1', '0', 'true', 'false', 'on']
    const invalidValues = ['yes', 'no', 'off', '2', 2, 'TRUE', 'FALSE', 'On', 'ON']

    validValues.forEach(value => {
      expect(boolean(value)).toBe(true)
    })

    invalidValues.forEach(value => {
      expect(boolean(value)).toBe(false)
    })
  })
})
