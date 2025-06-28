import { describe, it, expect } from 'vitest'
import min from '../../../resources/js/core/rules/min.js'

describe('Min Rule', () => {
  it('should allow empty values', () => {
    expect(min('', ['3'])).toBe(true)
    expect(min(null, ['3'])).toBe(true)
    expect(min(undefined, ['3'])).toBe(true)
  })

  it('should validate string length by default', () => {
    expect(min('hello', ['3'])).toBe(true)
    expect(min('hi', ['3'])).toBe(false)
    expect(min('exact', ['5'])).toBe(true)
    expect(min('short', ['10'])).toBe(false)
  })

  it('should validate numeric values', () => {
    expect(min(10, ['5'])).toBe(true)
    expect(min(3, ['5'])).toBe(false)
    expect(min(5, ['5'])).toBe(true)
    expect(min(0, ['0'])).toBe(true)
  })

  it('should validate numeric strings when in numeric context', () => {
    const numericContext = { rules: ['numeric', 'min:5'] }
    expect(min('10', ['5'], 'age', numericContext)).toBe(true)
    expect(min('3', ['5'], 'age', numericContext)).toBe(false)
    expect(min('5', ['5'], 'age', numericContext)).toBe(true)
  })

  it('should validate array length', () => {
    expect(min(['a', 'b', 'c'], ['2'])).toBe(true)
    expect(min(['a'], ['2'])).toBe(false)
    expect(min([], ['1'])).toBe(false)
    expect(min([], ['0'])).toBe(true)
  })

  it('should validate file size in KB', () => {
    // Create mock File objects with size property
    const smallFile = Object.create(File.prototype, {
      size: { value: 1024 } // 1KB
    })
    const largeFile = Object.create(File.prototype, {
      size: { value: 5120 } // 5KB
    })

    expect(min(smallFile, ['1'])).toBe(true)
    expect(min(smallFile, ['2'])).toBe(false)
    expect(min(largeFile, ['3'])).toBe(true)
  })
})
