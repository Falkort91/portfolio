import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useContactForm, validateContactForm } from '../../app/composables/useContactForm'

describe('validateContactForm', () => {
  it('flags empty required fields', () => {
    const errors = validateContactForm({ name: '', email: '', message: '' })
    expect(errors).toEqual({ name: 'required', email: 'required', message: 'required' })
  })

  it('flags an invalid email format', () => {
    const errors = validateContactForm({ name: 'Ada', email: 'not-an-email', message: 'Hello' })
    expect(errors).toEqual({ email: 'invalid' })
  })

  it('returns no errors for a valid form', () => {
    const errors = validateContactForm({ name: 'Ada', email: 'ada@example.com', message: 'Hello' })
    expect(errors).toEqual({})
  })
})

describe('useContactForm', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('does not call fetch and records errors when the form is invalid', async () => {
    const { form, errors, status, submit } = useContactForm('https://formspree.io/f/test')
    form.name = ''

    await submit()

    expect(fetch).not.toHaveBeenCalled()
    expect(errors.value.name).toBe('required')
    expect(status.value).toBe('idle')
  })

  it('sets status to success when the request succeeds', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 200 }))
    const { form, status, submit } = useContactForm('https://formspree.io/f/test')
    form.name = 'Ada'
    form.email = 'ada@example.com'
    form.message = 'Hello'

    await submit()

    expect(fetch).toHaveBeenCalledWith(
      'https://formspree.io/f/test',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(status.value).toBe('success')
  })

  it('sets status to error when the request fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 500 }))
    const { form, status, submit } = useContactForm('https://formspree.io/f/test')
    form.name = 'Ada'
    form.email = 'ada@example.com'
    form.message = 'Hello'

    await submit()

    expect(status.value).toBe('error')
  })

  it('sets status to error when fetch throws (network failure)', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('network down'))
    const { form, status, submit } = useContactForm('https://formspree.io/f/test')
    form.name = 'Ada'
    form.email = 'ada@example.com'
    form.message = 'Hello'

    await submit()

    expect(status.value).toBe('error')
  })

  it('resets status to idle on an invalid resubmit after a previous success', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 200 }))
    const { form, errors, status, submit } = useContactForm('https://formspree.io/f/test')
    form.name = 'Ada'
    form.email = 'ada@example.com'
    form.message = 'Hello'

    await submit()
    expect(status.value).toBe('success')

    form.name = ''
    await submit()

    expect(status.value).toBe('idle')
    expect(errors.value.name).toBe('required')
  })

  it('does not call fetch and sets status to error when the endpoint is empty', async () => {
    const { form, status, submit } = useContactForm('')
    form.name = 'Ada'
    form.email = 'ada@example.com'
    form.message = 'Hello'

    await submit()

    expect(fetch).not.toHaveBeenCalled()
    expect(status.value).toBe('error')
  })
})
