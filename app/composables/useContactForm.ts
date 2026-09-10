import { computed, reactive, ref } from 'vue'

export interface ContactFormState {
  name: string
  email: string
  message: string
}

export type ContactFormErrors = Partial<Record<keyof ContactFormState, 'required' | 'invalid'>>
export type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateContactForm(form: ContactFormState): ContactFormErrors {
  const errors: ContactFormErrors = {}
  if (!form.name.trim()) errors.name = 'required'
  if (!form.email.trim()) errors.email = 'required'
  else if (!EMAIL_REGEX.test(form.email)) errors.email = 'invalid'
  if (!form.message.trim()) errors.message = 'required'
  return errors
}

export function useContactForm(endpoint: string) {
  const form = reactive<ContactFormState>({ name: '', email: '', message: '' })
  const errors = ref<ContactFormErrors>({})
  const status = ref<SubmitStatus>('idle')

  const isValid = computed(() => Object.keys(validateContactForm(form)).length === 0)

  async function submit() {
    const validationErrors = validateContactForm(form)
    errors.value = validationErrors
    if (Object.keys(validationErrors).length > 0) {
      status.value = 'idle'
      return
    }
    // Endpoint vide (variable d'env non configurée) : fetch() résoudrait contre la page
    // courante et signalerait un succès à tort.
    if (!endpoint) {
      status.value = 'error'
      return
    }

    status.value = 'submitting'
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      status.value = response.ok ? 'success' : 'error'
    } catch {
      status.value = 'error'
    }
  }

  return { form, errors, status, isValid, submit }
}
