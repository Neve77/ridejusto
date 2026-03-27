/**
 * Custom hooks para a aplicação
 */
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { useCallback, useEffect, useState } from 'react'
import { checkRateLimit } from '@/security'

/**
 * Hooks tipados para Redux
 */
export const useAppDispatch = () => useReduxDispatch<AppDispatch>()
export const useAppSelector = <TSelected,>(
  selector: (state: RootState) => TSelected
): TSelected => useSelector<RootState, TSelected>(selector)

/**
 * Hook para rate limiting
 */
export const useRateLimit = (key: string, limit: number, window: number) => {
  const [isLimited, setIsLimited] = useState(false)

  const check = useCallback(() => {
    const result = checkRateLimit(key, limit, window)
    setIsLimited(!result)
    return result
  }, [key, limit, window])

  return { isLimited, check }
}

/**
 * Hook para validação de forma
 */
export const useFormValidation = (initialValues: Record<string, any>, onSubmit: (values: Record<string, any>) => void) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    setTouched((prev) => ({ ...prev, [name]: true }))
  }, [])

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setIsSubmitting(true)
      try {
        await onSubmit(values)
      } finally {
        setIsSubmitting(false)
      }
    },
    [values, onSubmit]
  )

  const setFieldError = useCallback((field: string, message: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: [message],
    }))
  }, [])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldError,
    clearErrors,
    setValues,
  }
}

/**
 * Hook para session management
 */
export const useSessionTimeout = (timeout: number = 30 * 60 * 1000) => {
  const dispatch = useAppDispatch()
  const [lastActivity, setLastActivity] = useState(Date.now())

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']

    const handleActivity = () => {
      setLastActivity(Date.now())
    }

    events.forEach((event) => {
      document.addEventListener(event, handleActivity)
    })

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity)
      })
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      if (now - lastActivity > timeout) {
        // Session expired - logout
        dispatch({ type: 'auth/logout' })
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [lastActivity, timeout, dispatch])
}

/**
 * Hook para debounce
 */
export const useDebounce = <T,>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook para async data fetching com cache
 */
export const useAsync = <T,>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
) => {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(async () => {
    setStatus('pending')
    setData(null)
    setError(null)

    try {
      const response = await asyncFunction()
      setData(response)
      setStatus('success')
      return response as T
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      setStatus('error')
      throw error
    }
  }, [asyncFunction])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { execute, status, data, error }
}

/**
 * Hook para local storage com segurança
 */
export const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch {
        console.error(`Error saving to localStorage: ${key}`)
      }
    },
    [key, storedValue]
  )

  return [storedValue, setValue] as const
}
