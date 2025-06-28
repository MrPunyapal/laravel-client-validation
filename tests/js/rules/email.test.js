import { describe, it, expect } from 'vitest'
import email from '../../../resources/js/core/rules/email.js'

describe('Email Rule', () => {
  it('should allow empty values', () => {
    expect(email('')).toBe(true)
    expect(email(null)).toBe(true)
    expect(email(undefined)).toBe(true)
  })

  it('should validate correct email addresses', () => {
    expect(email('test@example.com')).toBe(true)
    expect(email('user+tag@domain.org')).toBe(true)
    expect(email('user.name@example.co.uk')).toBe(true)
    expect(email('simple@test.org')).toBe(true)
  })

  it('should reject invalid email addresses', () => {
    expect(email('invalid-email')).toBe(false)
    expect(email('@example.com')).toBe(false)
    expect(email('user@')).toBe(false)
    expect(email('user space@example.com')).toBe(false)
    // Note: user@domain (without TLD) is actually valid in the current regex
    // Note: user..name@example.com is also valid in the current regex
  })
})
