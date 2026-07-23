type Props = { size?: number; tagline?: boolean }

export default function Logo({ size = 30, tagline = false }: Props) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', fontWeight: 800, fontSize: size, letterSpacing: '-0.02em', lineHeight: 1 }}>
      <span style={{ color: 'var(--blue)' }}>Services</span>
      <span style={{ marginLeft: 6, color: 'var(--green)' }}>VLD</span>
      <span style={{ color: 'var(--yellow)' }}>MAC</span>
      {tagline && <span style={{ marginLeft: 10, fontSize: size * 0.4, fontWeight: 600, color: 'var(--muted)' }}>Estuaire · Congo</span>}
    </span>
  )
}
