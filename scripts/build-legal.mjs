// Regenerates website/{terms,privacy,refund}.html bodies from frontend/src/lib/legalContent.ts.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const { LEGAL_PARTS, LEGAL_LAST_UPDATED, SUPPORT_EMAIL } = await import(
  pathToFileURL(`${root}frontend/src/lib/legalContent.ts`).href
)

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const rich = (s) =>
  esc(s).split(SUPPORT_EMAIL).join(`<a href="mailto:${SUPPORT_EMAIL}" style="text-decoration: underline;">${SUPPORT_EMAIL}</a>`)

function renderBlocks(blocks) {
  const out = []
  for (const b of blocks) {
    if (b.heading) out.push(`      <h2>${esc(b.heading)}</h2>`)
    let list = null
    const flush = () => {
      if (list) out.push('      <ul>', ...list, '      </ul>')
      list = null
    }
    for (const p of b.paragraphs) {
      if (p.startsWith('• ')) (list ??= []).push(`        <li>${rich(p.slice(2))}</li>`)
      else {
        flush()
        out.push(`      <p>${rich(p)}</p>`)
      }
    }
    flush()
    out.push('')
  }
  return out
}

const part = (id) => LEGAL_PARTS.find((p) => p.id === id)
const pages = [
  { file: 'terms', h1: 'Terms &amp; Conditions', blocks: [...part('terms').blocks, { heading: 'Credits', paragraphs: part('credits').blocks.flatMap((b) => b.paragraphs) }] },
  { file: 'privacy', h1: 'Privacy Policy', blocks: part('privacy').blocks },
  { file: 'refund', h1: 'Refund Policy', blocks: part('refund').blocks },
]
const navItems = [
  ['terms', 'Terms &amp; Conditions'],
  ['privacy', 'Privacy Policy'],
  ['refund', 'Refund Policy'],
]

for (const page of pages) {
  const path = `${root}website/${page.file}.html`
  const html = readFileSync(path, 'utf8').replace(/\r\n/g, '\n')
  const start = html.indexOf('      <h1>')
  const end = html.indexOf('    </div>\n  </div>\n</main>')
  if (start < 0 || end < 0) throw new Error(`markers not found in ${page.file}.html`)
  const lines = [
    `      <h1>${page.h1}</h1>`,
    `      <p class="updated">Last updated: ${LEGAL_LAST_UPDATED}</p>`,
    '',
    '      <div class="legal-nav">',
    ...navItems.map(([id, label]) => `        <a${id === page.file ? ' class="active"' : ''} href="/${id}.html">${label}</a>`),
    '      </div>',
    '',
    ...renderBlocks(page.blocks),
  ]
  const next = html.slice(0, start) + lines.join('\n').replace(/\n+$/, '\n') + html.slice(end)
  writeFileSync(path, next.replace(/\n/g, '\r\n'))
  console.log(`${page.file}.html: ${page.blocks.length} sections`)
}
