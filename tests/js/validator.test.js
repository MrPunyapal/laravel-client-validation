import { describe, it, expect } from 'vitest'
import Validator from '../../resources/js/core/validator.js'

describe('Validator Core', () => {
  it('should validate required field correctly', async () => {
    const validator = new Validator({ name: 'required' })

    expect(await validator.validateField('name', '')).toBe(false)
    expect(await validator.validateField('name', null)).toBe(false)
    expect(validator.errors.name).toContain('The name is invalid.')
    expect(await validator.validateField('name', 'John')).toBe(true)
  })

  it('should validate email field correctly', async () => {
    const validator = new Validator({ email: 'email' })

    expect(await validator.validateField('email', 'invalid-email')).toBe(false)
    expect(await validator.validateField('email', 'test@example.com')).toBe(true)
    expect(await validator.validateField('email', '')).toBe(true) // email rule allows empty
  })

  it('should validate min rule', async () => {
    const validator = new Validator({
      password: 'min:8'
    })

    expect(await validator.validateField('password', '123')).toBe(false)
    expect(await validator.validateField('password', 'password123')).toBe(true)
    expect(await validator.validateField('password', '')).toBe(true) // min allows empty
  })

  it('should validate max rule', async () => {
    const validator = new Validator({
      password: 'max:20'
    })

    expect(await validator.validateField('password', 'password123')).toBe(true)
    expect(await validator.validateField('password', 'verylongpasswordthatexceedsmaxlength')).toBe(false)
    expect(await validator.validateField('password', '')).toBe(true) // max allows empty
  })

  it('should validate numeric rule', async () => {
    const validator = new Validator({
      age: 'numeric'
    })

    expect(await validator.validateField('age', 'abc')).toBe(false)
    expect(await validator.validateField('age', '25')).toBe(true)
    expect(await validator.validateField('age', 25)).toBe(true)
    expect(await validator.validateField('age', '')).toBe(true) // numeric allows empty
  })

  it('should validate multiple rules together', async () => {
    const validator = new Validator({
      password: ['required', 'min:8']
    })

    expect(await validator.validateField('password', '')).toBe(false)
    expect(await validator.validateField('password', '123')).toBe(false)
    expect(await validator.validateField('password', 'password123')).toBe(true)
  })

  it('should validate numeric fields with constraints', async () => {
    const validator = new Validator({
      age: ['required', 'numeric', 'min:18', 'max:99']
    })

    expect(await validator.validateField('age', '')).toBe(false)
    expect(await validator.validateField('age', 'abc')).toBe(false)
    expect(await validator.validateField('age', '17')).toBe(false)
    expect(await validator.validateField('age', '25')).toBe(true)
    expect(await validator.validateField('age', '100')).toBe(false)
  })

  it('should validate complete form data', async () => {
    const validator = new Validator({
      name: 'required',
      email: ['required', 'email'],
      age: ['required', 'numeric', 'min:18']
    })

    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      age: '25'
    }

    const invalidData = {
      name: '',
      email: 'invalid-email',
      age: '17'
    }

    expect(await validator.validate(validData)).toBe(true)
    expect(await validator.validate(invalidData)).toBe(false)
    expect(Object.keys(validator.errors)).toHaveLength(3)
  })

  it('should handle regex validation', async () => {
    const validator = new Validator({
      phone: 'regex:/^[0-9]{10}$/'
    })

    expect(await validator.validateField('phone', '1234567890')).toBe(true)
    expect(await validator.validateField('phone', '123')).toBe(false)
    expect(await validator.validateField('phone', 'abc123')).toBe(false)
  })

  it('should validate in rule', async () => {
    const validator = new Validator({
      status: 'in:active,inactive,pending'
    })

    expect(await validator.validateField('status', 'active')).toBe(true)
    expect(await validator.validateField('status', 'inactive')).toBe(true)
    expect(await validator.validateField('status', 'pending')).toBe(true)
    expect(await validator.validateField('status', 'deleted')).toBe(false)
  })

  it('should validate not_in rule', async () => {
    const validator = new Validator({
      role: 'not_in:admin,root,superuser'
    })

    expect(await validator.validateField('role', 'user')).toBe(true)
    expect(await validator.validateField('role', 'moderator')).toBe(true)
    expect(await validator.validateField('role', 'admin')).toBe(false)
    expect(await validator.validateField('role', 'root')).toBe(false)
  })

  it('should validate array rules with required', async () => {
    const validator = new Validator({
      status: ['required', 'in:active,inactive,pending']
    })

    expect(await validator.validateField('status', 'active')).toBe(true)
    expect(await validator.validateField('status', 'deleted')).toBe(false)
    expect(await validator.validateField('status', '')).toBe(false) // required makes empty invalid
  })

  it('should validate boolean rule', async () => {
    const validator = new Validator({
      terms: 'boolean'
    })

    expect(await validator.validateField('terms', true)).toBe(true)
    expect(await validator.validateField('terms', false)).toBe(true)
    expect(await validator.validateField('terms', 'true')).toBe(true)
    expect(await validator.validateField('terms', 'false')).toBe(true)
    expect(await validator.validateField('terms', '1')).toBe(true)
    expect(await validator.validateField('terms', '0')).toBe(true)
    expect(await validator.validateField('terms', 1)).toBe(true)
    expect(await validator.validateField('terms', 0)).toBe(true)
    expect(await validator.validateField('terms', 'yes')).toBe(false)
    expect(await validator.validateField('terms', 'no')).toBe(false)
    expect(await validator.validateField('terms', 'invalid')).toBe(false)
  })

  it('should validate boolean rule with required', async () => {
    const validator = new Validator({
      terms: ['required', 'boolean']
    })

    expect(await validator.validateField('terms', true)).toBe(true)
    expect(await validator.validateField('terms', false)).toBe(true)
    expect(await validator.validateField('terms', 'true')).toBe(true)
    expect(await validator.validateField('terms', 'false')).toBe(true)
    expect(await validator.validateField('terms', '1')).toBe(true)
    expect(await validator.validateField('terms', '0')).toBe(true)
    expect(await validator.validateField('terms', 1)).toBe(true)
    expect(await validator.validateField('terms', 0)).toBe(true)
    expect(await validator.validateField('terms', '')).toBe(false) // required makes empty invalid
    expect(await validator.validateField('terms', null)).toBe(false)
    expect(await validator.validateField('terms', undefined)).toBe(false)
  })

  it('should clear errors correctly', () => {
    const validator = new Validator({ name: 'required' })

    // Add some errors first
    validator.errors.name = ['The name is required.']
    validator.errors.email = ['The email is invalid.']

    // Clear errors
    validator.clearErrors()

    expect(Object.keys(validator.errors)).toHaveLength(0)
  })
})
