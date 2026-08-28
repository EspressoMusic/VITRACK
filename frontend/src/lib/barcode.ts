import { BarcodeDetector } from 'barcode-detector/pure'
import type { Lang } from './i18n/lang'

// Retail food packaging almost exclusively uses these — keeping the list narrow avoids
// wasting decode passes on formats (QR, PDF417, etc.) that would never appear on a product.
const FOOD_BARCODE_FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e'] as const

let detector: BarcodeDetector | null = null

function getDetector(): BarcodeDetector {
  if (!detector) detector = new BarcodeDetector({ formats: [...FOOD_BARCODE_FORMATS] })
  return detector
}

/** Decodes a food-product barcode from a live video frame or still image. Null if none is found. */
export async function decodeBarcodeFromFrame(
  source: HTMLVideoElement | HTMLCanvasElement
): Promise<string | null> {
  const barcodes = await getDetector().detect(source)
  return barcodes[0]?.rawValue ?? null
}

export interface BarcodeProduct {
  name: string
}

interface OpenFoodFactsProduct {
  product_name?: string
  product_name_he?: string
  brands?: string
}

/** Looks up a scanned barcode against Open Food Facts. Null if the product isn't in the database. */
export async function lookupProductByBarcode(code: string, lang: Lang): Promise<BarcodeProduct | null> {
  const res = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,product_name_he,brands,status`
  )
  if (!res.ok) throw new Error(`Open Food Facts request failed (${res.status})`)

  const data = (await res.json()) as { status?: number; product?: OpenFoodFactsProduct }
  if (data.status !== 1 || !data.product) return null

  const name = ((lang === 'he' && data.product.product_name_he) || data.product.product_name || '').trim()
  if (!name) return null

  const brand = data.product.brands?.split(',')[0]?.trim()
  return { name: brand ? `${name} (${brand})` : name }
}
