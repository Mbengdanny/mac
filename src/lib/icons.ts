import { TreePine, Layers, Square, Frame, Hammer, Package, Waves, Box, MoreHorizontal, TreeDeciduous } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const map: Record<string, LucideIcon> = {
  'tree': TreeDeciduous,
  'tree-pine': TreePine,
  'layers': Layers,
  'square': Square,
  'frame': Frame,
  'screwdriver': Hammer,
  'package': Package,
  'grain': Box,
  'waves': Waves,
  'box': Box,
  'more-horizontal': MoreHorizontal,
}

export function iconFor(name: string | null): LucideIcon {
  return (name && map[name]) || Box
}
