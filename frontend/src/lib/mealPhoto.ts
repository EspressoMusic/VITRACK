/** Flat placeholder used as a meal's photo when it was logged without a camera photo (manual/custom entry). */
export const MANUAL_ENTRY_PHOTO =
  'data:image/svg+xml;base64,' +
  btoa('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#e5c184"/></svg>')

export function isManualEntryPhoto(imageDataUrl: string): boolean {
  return imageDataUrl === MANUAL_ENTRY_PHOTO
}
