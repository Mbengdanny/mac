import { jsPDF } from 'jspdf'
import type { QuoteItem } from './types'
import { greeting, fcfa } from './format'

type Props = {
  quoteNumber: string
  civility: 'Mr' | 'Mme'
  clientName: string
  items: QuoteItem[]
  total: number
}

export function generateQuotePDF({ quoteNumber, civility, clientName, items, total }: Props): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const M = 40
  let y = 50

  // Header band
  doc.setFillColor(22, 163, 74)
  doc.rect(0, 0, W, 8, 'F')
  doc.setFillColor(234, 179, 8)
  doc.rect(W / 3, 0, W / 3, 8, 'F')
  doc.setFillColor(37, 99, 235)
  doc.rect((W / 3) * 2, 0, W / 3, 8, 'F')

  // Logo text
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(37, 99, 235); doc.text('Services', M, y)
  const sw = doc.getTextWidth('Services ')
  doc.setTextColor(22, 163, 74); doc.text('VLD', M + sw, y)
  const vw = doc.getTextWidth('VLD')
  doc.setTextColor(200, 138, 4); doc.text('MAC', M + sw + vw, y)

  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  doc.text('Matériaux de construction · Owendo, Akanda et Libreville', M, y + 16)
  y += 44

  // Greeting + intro
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(13)
  doc.setTextColor(15, 23, 42)
  doc.text(`${greeting()} ${civility} ${clientName},`, M, y); y += 22
  doc.text(`Voici votre devis pro forma N° ${quoteNumber}`, M, y); y += 28

  // Table header
  doc.setFillColor(241, 245, 249)
  doc.rect(M, y - 14, W - M * 2, 26, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(51, 65, 85)
  doc.text('Désignation', M + 8, y + 3)
  doc.text('Qté', W - M - 200, y + 3)
  doc.text('P.U.', W - M - 130, y + 3)
  doc.text('Total', W - M - 60, y + 3)
  y += 18

  // Rows
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(15, 23, 42)
  for (const it of items) {
    if (y > 740) { doc.addPage(); y = 50 }
    doc.text(it.name, M + 8, y + 3)
    doc.text(String(it.qty), W - M - 200, y + 3)
    doc.text(fcfa(it.price), W - M - 130, y + 3)
    doc.text(fcfa(it.price * it.qty), W - M - 60, y + 3)
    y += 20
    doc.setDrawColor(226, 232, 240); doc.line(M, y - 6, W - M, y - 6)
  }

  // Total
  y += 10
  doc.setFillColor(22, 163, 74)
  doc.rect(W - M - 200, y, 200, 30, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(255, 255, 255)
  doc.text('TOTAL GÉNÉRAL', W - M - 192, y + 19)
  doc.text(fcfa(total), W - M - 60, y + 19)
  y += 56

  // Footer notes
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  const notes = [
    'Ce devis est bloqué 30 jours.',
    'Livraison sous 24h.',
    'Service client disponible 7j/7 au 076452070.',
    'Version certifiée avec tampon et RCCM, disponible bientôt.',
    'Paiement : Airtel Money (076452070) · Moov Money (066819615) · À la livraison.',
  ]
  for (const n of notes) {
    if (y > 780) { doc.addPage(); y = 50 }
    doc.setTextColor(71, 85, 105)
    doc.text(`• ${n}`, M, y); y += 16
  }

  return doc
}
