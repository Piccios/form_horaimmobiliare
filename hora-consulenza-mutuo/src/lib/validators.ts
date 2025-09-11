export function isPhoneValid(value: string): boolean {
  const re = /^[0-9+().\s-]{7,}$/
  return re.test(value)
}

export function isProvinciaValid(value: string): boolean {
  return /^[A-Za-z]{2}$/.test(value)
}

export function isPositiveNumber(n: unknown): boolean {
  return typeof n === 'number' && isFinite(n) && n >= 0
}


