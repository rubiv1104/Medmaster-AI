export function validateEmail(email: string) {
  const value = email.trim().toLowerCase()

  if (!value) {
    return 'Email is required.'
  }

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(value)) {
    return 'Please enter a valid email address.'
  }

  return null
}

export function validatePassword(password: string) {
  if (!password) {
    return 'Password is required.'
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters.'
  }

  return null
}

export function validateFullName(name: string) {
  const value = name.trim()

  if (!value) {
    return 'Full name is required.'
  }

  if (value.length < 2) {
    return 'Full name is too short.'
  }

  return null
}