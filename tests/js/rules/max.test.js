import { describe, it, expect } from 'vitest'
import max from '../../../resources/js/core/rules/max.js'

describe('Max Rule', () => {
  it('should allow empty values', () => {
    expect(max('', ['3'])).toBe(true)
    expect(max(null, ['3'])).toBe(true)
    expect(max(undefined, ['3'])).toBe(true)
  })

  it('should validate string length by default', () => {
    expect(max('hello', ['10'])).toBe(true)
    expect(max('very long string', ['5'])).toBe(false)
    expect(max('exact', ['5'])).toBe(true)
    expect(max('toolongstring', ['5'])).toBe(false)
  })

  it('should validate numeric values', () => {
    expect(max(5, ['10'])).toBe(true)
    expect(max(15, ['10'])).toBe(false)
    expect(max(10, ['10'])).toBe(true)
    expect(max(0, ['5'])).toBe(true)
  })

  it('should validate numeric strings when in numeric context', () => {
    const numericContext = { rules: ['numeric', 'max:10'] }
    expect(max('5', ['10'], 'age', numericContext)).toBe(true)
    expect(max('15', ['10'], 'age', numericContext)).toBe(false)
    expect(max('10', ['10'], 'age', numericContext)).toBe(true)
  })

  it('should validate array length', () => {
    expect(max(['a', 'b'], ['3'])).toBe(true)
    expect(max(['a', 'b', 'c', 'd'], ['3'])).toBe(false)
    expect(max([], ['1'])).toBe(true)
    expect(max(['a', 'b', 'c'], ['3'])).toBe(true)
  })

  it('should validate file size in KB', () => {
    // Create mock File objects with size property
    const smallFile = Object.create(File.prototype, {
      size: { value: 1024 } // 1KB
    })
    const largeFile = Object.create(File.prototype, {
      size: { value: 5120 } // 5KB
    })

    expect(max(smallFile, ['2'])).toBe(true)
    expect(max(smallFile, ['0.5'])).toBe(false)
    expect(max(largeFile, ['10'])).toBe(true)
    expect(max(largeFile, ['3'])).toBe(false)
  })
})
