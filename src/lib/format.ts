export function fcfa(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'
}

export function greeting(): string {
  const h = new Date().getHours()
  return h >= 5 && h < 18 ? 'Bonjour' : 'Bonsoir'
}

export function nextQuoteNumber(existing: string[]): string {
  const year = new Date().getFullYear()
  let max = 0
  for (const n of existing) {
    const m = n.match(/DEV-(\d{4})-(\d+)/)
    if (m && parseInt(m[1]) === year) max = Math.max(max, parseInt(m[2]))
  }
  return `DEV-${year}-${String(max + 1).padStart(4, '0')}`
}

export function nextOrderNumber(existing: string[]): string {
  const year = new Date().getFullYear()
  let max = 0
  for (const n of existing) {
    const m = n.match(/CMD-(\d{4})-(\d+)/)
    if (m && parseInt(m[1]) === year) max = Math.max(max, parseInt(m[2]))
  }
  return `CMD-${year}-${String(max + 1).padStart(4, '0')}`
}

export function paymentLabel(method: string): string {
  switch (method) {
    case 'airtel': return 'Airtel Money — 076452070'
    case 'moov': return 'Moov Money — 066819615'
    case 'livraison': return 'Paiement à la livraison'
    default: return method
  }
}
