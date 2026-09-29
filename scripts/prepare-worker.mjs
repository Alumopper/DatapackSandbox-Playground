import { readFile, rm, mkdir, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { unzipSync } from 'fflate'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const generated = resolve(packageRoot, '.generated')
const version = process.env.DPS_BROWSER_VERSION || '1.1.1'
const asset = `datapack-sandbox-browser-${version}.zip`
let bytes

if (process.env.DPS_BROWSER_BUNDLE) {
  bytes = await readFile(resolve(process.env.DPS_BROWSER_BUNDLE))
} else {
  const base = `https://github.com/Alumopper/DatapackSandbox/releases/download/${version}`
  const [archiveResponse, checksumsResponse] = await Promise.all([fetch(`${base}/${asset}`), fetch(`${base}/SHA256SUMS.txt`)])
  if (!archiveResponse.ok || !checksumsResponse.ok) throw new Error(`Browser release asset is unavailable: ${base}/${asset}`)
  bytes = Buffer.from(await archiveResponse.arrayBuffer())
  const sums = await checksumsResponse.text()
  const line = sums.split(/\r?\n/).find((entry) => entry.trim().endsWith(`  ${asset}`))
  if (!line) throw new Error(`Missing checksum for ${asset}`)
  const expected = line.trim().split(/\s+/)[0].toLowerCase()
  const actual = createHash('sha256').update(bytes).digest('hex')
  if (actual !== expected) throw new Error(`SHA-256 mismatch for ${asset}: ${actual} != ${expected}`)
}

await rm(generated, { recursive: true, force: true })
await mkdir(generated, { recursive: true })
const entries = unzipSync(new Uint8Array(bytes))
for (const [name, content] of Object.entries(entries)) {
  if (name.startsWith('/') || name.split('/').includes('..')) throw new Error(`Unsafe browser bundle path: ${name}`)
  if (name.endsWith('/')) continue
  const destination = resolve(generated, name)
  await mkdir(dirname(destination), { recursive: true })
  await writeFile(destination, content)
}
for (const name of ['kotlin/datapack-sandbox-browser-runtime.mjs', 'datapack-sandbox-core.js', 'vanilla-command-catalog-26.2.json', 'profiles/index.json']) {
  await readFile(resolve(generated, name))
}
