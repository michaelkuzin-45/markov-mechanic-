// Removes the thin white horizontal "light bar" lines that are baked into the first part of the hero frame sequence (emissive display-panel
// edges in the render, seen as a laser-like line behind the car). Only long, thin, bright-on-dark horizontal runs are touched; each is replaced
// by the average of the pixels a few rows above and below. Reads public/hero/<set>, writes public/hero-clean/<set> (originals untouched).
// Usage: node scripts/remove-baked-lines.mjs desktop 0 96
// needs the sharp package (not a dependency of this site: install it temporarily, or set SHARP_PATH to an existing copy)
const sharp = (await import(process.env.SHARP_PATH ?? 'sharp')).default
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
const [set = 'desktop', from = '0', to = '40'] = process.argv.slice(2)
const lum = (d, i) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
let total = 0
for (let n = Number(from); n < Number(to); n++) {
  const name = `frame_${String(n).padStart(3, '0')}.webp`
  const file = `public/hero/${set}/${name}`
  mkdirSync(`public/hero-clean/${set}`, { recursive: true })
  const { data, info } = await sharp(readFileSync(file)).raw().toBuffer({ resolveWithObject: true })
  const W = info.width, H = info.height, C = info.channels
  const out = Buffer.from(data)
  let fixed = 0
  for (let y = 6; y < H - 6; y++) {
    let run = 0
    for (let x = 0; x <= W; x++) {
      const i = (y * W + x) * C
      const hit = x < W && lum(data, i) > 150 && lum(data, ((y - 4) * W + x) * C) < 95 && lum(data, ((y + 4) * W + x) * C) < 95
      if (hit) { run++; continue }
      if (run >= 90) {
        for (let k = x - run; k < x; k++) for (const dy of [-1, 0, 1, 2]) { // line is 2-4 px thick: rows y-1..y+2 around the hit row
          const yy = y + dy; if (yy < 5 || yy >= H - 5) continue
          for (let c = 0; c < 3; c++) out[(yy * W + k) * C + c] = (data[((y - 5) * W + k) * C + c] + data[((y + 6) * W + k) * C + c]) >> 1
        }
        fixed += run
      }
      run = 0
    }
  }
  total += fixed
  const buf = await sharp(out, { raw: { width: W, height: H, channels: C } }).webp({ quality: 82 }).toBuffer()
  writeFileSync(`public/hero-clean/${set}/${name}`, buf)
}
console.log('total', total)
