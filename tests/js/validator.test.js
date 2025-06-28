import { describe, it, expect } from 'vitest'
import Validator from '../../resources/js/core/validator.js'

describe('Validator Core', () => {
  it('should validate required field correctly', () => {
    const validator = new Validator({ name: 'required' })

    expect(validator.validateField('name', '')).toBe(false)
    expect(validator.validateField('name', null)).toBe(false)
    expect(validator.errors.name).toContain('The name is invalid.')
    expect(validator.validateField('name', 'John')).toBe(true)
  })

  it('should validate email field correctly', () => {
    const validator = new Validator({ email: 'email' })

    expect(validator.validateField('email', 'invalid-email')).toBe(false)
    expect(validator.validateField('email', 'test@example.com')).toBe(true)
    expect(validator.validateField('email', '')).toBe(true) // email rule allows empty
  })

  it('should validate min rule', () => {
    const validator = new Validator({
      password: 'min:8'
    })

    expect(validator.validateField('password', '123')).toBe(false)
    expect(validator.validateField('password', 'password123')).toBe(true)
    expect(validator.validateField('password', '')).toBe(true) // min allows empty
  })

  it('should validate max rule', () => {
    const validator = new Validator({
      password: 'max:20'
    })

    expect(validator.validateField('password', 'password123')).toBe(true)
    expect(validator.validateField('password', 'verylongpasswordthatexceedsmaxlength')).toBe(false)
    expect(validator.validateField('password', '')).toBe(true) // max allows empty
  })

  it('should validate numeric rule', () => {
    const validator = new Validator({
      age: 'numeric'
    })

    expect(validator.validateField('age', 'abc')).toBe(false)
    expect(validator.validateField('age', '25')).toBe(true)
    expect(validator.validateField('age', 25)).toBe(true)
    expect(validator.validateField('age', '')).toBe(true) // numeric allows empty
  })

  it('should validate multiple rules together', () => {
    const validator = new Validator({
      password: 'required|min:8|max:20'
    })

    expect(validator.validateField('password', '')).toBe(false)
    expect(validator.validateField('password', '123')).toBe(false)
    expect(validator.validateField('password', 'password123')).toBe(true)
    expect(validator.validateField('password', 'verylongpasswordthatexceedsmaxlength')).toBe(false)
  })

  it('should validate numeric fields with constraints', () => {
    const validator = new Validator({
      age: 'required|numeric|min:18|max:120'
    })

    expect(validator.validateField('age', '')).toBe(false)
    expect(validator.validateField('age', 'abc')).toBe(false)
    expect(validator.validateField('age', '17')).toBe(false)
    expect(validator.validateField('age', '25')).toBe(true)
    expect(validator.validateField('age', '150')).toBe(false)
  })

  it('should validate complete form data', () => {
    const validator = new Validator({
      name: 'required|string|min:2',
      email: 'required|email',
      age: 'required|numeric|min:18'
    })

    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      age: '25'
    }

    const invalidData = {
      name: 'J',
      email: 'invalid-email',
      age: '15'
    }

    expect(validator.validate(validData)).toBe(true)
    expect(validator.validate(invalidData)).toBe(false)
    expect(Object.keys(validator.errors)).toHaveLength(3)
  })

  it('should handle regex validation', () => {
    const validator = new Validator({
      phone: 'regex:/^[0-9]{10,15}$/'
    })

    expect(validator.validateField('phone', '1234567890')).toBe(true)
    expect(validator.validateField('phone', '123')).toBe(false)
    expect(validator.validateField('phone', 'abc123')).toBe(false)
  })

  it('should validate in rule', () => {
    const validator = new Validator({
      status: 'in:active,inactive,pending'
    })

    expect(validator.validateField('status', 'active')).toBe(true)
    expect(validator.validateField('status', 'inactive')).toBe(true)
    expect(validator.validateField('status', 'pending')).toBe(true)
    expect(validator.validateField('status', 'deleted')).toBe(false)
    expect(validator.validateField('status', '')).toBe(true) // in allows empty
  })

  it('should validate not_in rule', () => {
    const validator = new Validator({
      role: 'not_in:admin,super_admin'
    })

    expect(validator.validateField('role', 'user')).toBe(true)
    expect(validator.validateField('role', 'moderator')).toBe(true)
    expect(validator.validateField('role', 'admin')).toBe(false)
    expect(validator.validateField('role', 'super_admin')).toBe(false)
    expect(validator.validateField('role', '')).toBe(true) // not_in allows empty
  })

  it('should validate array rules with required', () => {
    const validator = new Validator({
      status: 'required|in:active,inactive,pending',
      role: 'not_in:admin,super_admin'
    })

    expect(validator.validateField('status', 'active')).toBe(true)
    expect(validator.validateField('status', 'deleted')).toBe(false)
    expect(validator.validateField('status', '')).toBe(false) // required makes empty invalid
    expect(validator.validateField('role', 'user')).toBe(true)
    expect(validator.validateField('role', 'admin')).toBe(false)
  })

  it('should validate boolean rule', () => {
    const validator = new Validator({
      terms: 'boolean'
    })

    expect(validator.validateField('terms', true)).toBe(true)
    expect(validator.validateField('terms', false)).toBe(true)
    expect(validator.validateField('terms', 'true')).toBe(true)
    expect(validator.validateField('terms', 'false')).toBe(true)
    expect(validator.validateField('terms', '1')).toBe(true)
    expect(validator.validateField('terms', '0')).toBe(true)
    expect(validator.validateField('terms', 1)).toBe(true)
    expect(validator.validateField('terms', 0)).toBe(true)
    expect(validator.validateField('terms', 'on')).toBe(true)
    expect(validator.validateField('terms', 'invalid')).toBe(false)
    expect(validator.validateField('terms', '')).toBe(true) // boolean allows empty
  })

  it('should validate boolean rule with required', () => {
    const validator = new Validator({
      terms: 'required|boolean'
    })

    expect(validator.validateField('terms', true)).toBe(true)
    expect(validator.validateField('terms', false)).toBe(true)
    expect(validator.validateField('terms', 'true')).toBe(true)
    expect(validator.validateField('terms', '1')).toBe(true)
    expect(validator.validateField('terms', 'invalid')).toBe(false)
    expect(validator.validateField('terms', '')).toBe(false) // required makes empty invalid
  })

  it('should clear errors correctly', () => {
    const validator = new Validator({ name: 'required' })

    validator.validateField('name', '')
    expect(validator.errors.name).toBeDefined()

    validator.validateField('name', 'John')
    expect(validator.errors.name).toHaveLength(0)
  })
})
