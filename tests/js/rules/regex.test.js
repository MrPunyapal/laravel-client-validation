import { describe, it, expect } from 'vitest'
import regex from '../../../resources/js/core/rules/regex.js'

describe('Regex Rule', () => {
  it('should allow empty values', () => {
    expect(regex('', ['/^[0-9]{10}$/'])).toBe(true)
    expect(regex(null, ['/^[0-9]{10}$/'])).toBe(true)
    expect(regex(undefined, ['/^[0-9]{10}$/'])).toBe(true)
  })

  it('should validate against basic patterns', () => {
    expect(regex('1234567890', ['/^[0-9]{10}$/'])).toBe(true)
    expect(regex('123', ['/^[0-9]{10}$/'])).toBe(false)
    expect(regex('abc123', ['/^[0-9]{10}$/'])).toBe(false)
    expect(regex('12345678901', ['/^[0-9]{10}$/'])).toBe(false)
  })

  it('should validate email patterns', () => {
    const emailPattern = '/^[a-zA-Z0-9\\._-]+@[a-zA-Z0-9\\.-]+\\.[a-zA-Z]{2,}$/'
    expect(regex('test@example.com', [emailPattern])).toBe(true)
    expect(regex('user.name@domain.org', [emailPattern])).toBe(true)
    expect(regex('invalid-email', [emailPattern])).toBe(false)
    expect(regex('@example.com', [emailPattern])).toBe(false)
  })

  it('should handle patterns without slashes', () => {
    expect(regex('hello', ['^[a-z]+$'])).toBe(true)
    expect(regex('Hello', ['^[a-z]+$'])).toBe(false)
    expect(regex('123', ['^[a-z]+$'])).toBe(false)
  })

  it('should handle patterns with flags', () => {
    expect(regex('Hello', ['/^[a-z]+$/i'])).toBe(true)
    expect(regex('HELLO', ['/^[a-z]+$/i'])).toBe(true)
    expect(regex('Hello123', ['/^[a-z]+$/i'])).toBe(false)
  })

  it('should handle invalid regex patterns gracefully', () => {
    expect(regex('test', ['[invalid'])).toBe(false)
    expect(regex('test', ['/[invalid/'])).toBe(false)
  })

  it('should validate phone number patterns', () => {
    const phonePattern = '/^[0-9]{10,15}$/'
    expect(regex('1234567890', [phonePattern])).toBe(true)
    expect(regex('123456789012345', [phonePattern])).toBe(true)
    expect(regex('123', [phonePattern])).toBe(false)
    expect(regex('12345678901234567890', [phonePattern])).toBe(false)
    expect(regex('123abc7890', [phonePattern])).toBe(false)
  })
})
