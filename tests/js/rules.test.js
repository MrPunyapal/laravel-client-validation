import { describe, it, expect } from 'vitest'
import required from '../../resources/js/core/rules/required.js'
import email from '../../resources/js/core/rules/email.js'
import min from '../../resources/js/core/rules/min.js'
import max from '../../resources/js/core/rules/max.js'
import numeric from '../../resources/js/core/rules/numeric.js'
import regex from '../../resources/js/core/rules/regex.js'
import boolean from '../../resources/js/core/rules/boolean.js'

describe('Validation Rules', () => {
  describe('required rule', () => {
    it('should validate required values correctly', () => {
      expect(required('')).toBe(false)
      expect(required(null)).toBe(false)
      expect(required(undefined)).toBe(false)
      expect(required('   ')).toBe(false)
      expect(required([])).toBe(false)
      expect(required('hello')).toBe(true)
      expect(required(['item'])).toBe(true)
      expect(required(0)).toBe(true)
      expect(required(false)).toBe(true)
    })
  })

  describe('email rule', () => {
    it('should validate email addresses correctly', () => {
      expect(email('')).toBe(true) // empty is allowed
      expect(email(null)).toBe(true) // null is allowed
      expect(email('test@example.com')).toBe(true)
      expect(email('user+tag@domain.org')).toBe(true)
      expect(email('invalid-email')).toBe(false)
      expect(email('@example.com')).toBe(false)
      expect(email('user@')).toBe(false)
      expect(email('user space@example.com')).toBe(false)
    })
  })

  describe('min rule', () => {
    it('should validate minimum length for strings', () => {
      expect(min('hello', ['3'])).toBe(true)
      expect(min('hi', ['3'])).toBe(false)
      expect(min('', ['3'])).toBe(true) // empty is allowed
      expect(min('exact', ['5'])).toBe(true)
    })

    it('should validate minimum value for numbers', () => {
      expect(min(10, ['5'])).toBe(true)
      expect(min(3, ['5'])).toBe(false)
      expect(min(5, ['5'])).toBe(true)
      expect(min('10', ['5'])).toBe(true)
    })
  })

  describe('max rule', () => {
    it('should validate maximum length for strings', () => {
      expect(max('hello', ['10'])).toBe(true)
      expect(max('very long string', ['5'])).toBe(false)
      expect(max('', ['3'])).toBe(true) // empty is allowed
      expect(max('exact', ['5'])).toBe(true)
    })

    it('should validate maximum value for numbers', () => {
      expect(max(5, ['10'])).toBe(true)
      expect(max(15, ['10'])).toBe(false)
      expect(max(10, ['10'])).toBe(true)
      expect(max('5', ['10'])).toBe(true)
    })
  })

  describe('numeric rule', () => {
    it('should validate numeric values correctly', () => {
      expect(numeric('')).toBe(true) // empty is allowed
      expect(numeric('123')).toBe(true)
      expect(numeric('123.45')).toBe(true)
      expect(numeric('0')).toBe(true)
      expect(numeric('-123')).toBe(true)
      expect(numeric('abc')).toBe(false)
      expect(numeric('123abc')).toBe(false)
      expect(numeric(123)).toBe(true)
    })
  })

  describe('regex rule', () => {
    it('should validate against regex patterns', () => {
      expect(regex('1234567890', ['/^[0-9]{10}$/'])).toBe(true)
      expect(regex('123', ['/^[0-9]{10}$/'])).toBe(false)
      expect(regex('abc123', ['/^[0-9]{10}$/'])).toBe(false)
      expect(regex('', ['/^[0-9]{10}$/'])).toBe(true) // empty is allowed

      // Test email regex
      expect(regex('test@example.com', ['/^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$/'])).toBe(true)
      expect(regex('invalid-email', ['/^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$/'])).toBe(false)
    })
  })

  describe('boolean rule', () => {
    it('should validate boolean values correctly', () => {
      expect(boolean('')).toBe(true) // empty is allowed
      expect(boolean(true)).toBe(true)
      expect(boolean(false)).toBe(true)
      expect(boolean('true')).toBe(true)
      expect(boolean('false')).toBe(true)
      expect(boolean('1')).toBe(true)
      expect(boolean('0')).toBe(true)
      expect(boolean(1)).toBe(true)
      expect(boolean(0)).toBe(true)
      expect(boolean('yes')).toBe(false)
      expect(boolean('no')).toBe(false)
      expect(boolean('invalid')).toBe(false)
    })
  })
})
