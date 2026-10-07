import type { ObjectDef } from '../types'
import { BUILDINGS } from './buildings'
import { CITY_BUILDINGS } from './city'
import { DECORATIONS } from './decorations'
import { TOWN_BUILDINGS, TOWN_DECORATIONS, TOWN_WORKSHOPS } from './townShop'

/** Every placeable thing, keyed by id. */
export const OBJECTS: ObjectDef[] = [...CITY_BUILDINGS, ...TOWN_BUILDINGS, ...BUILDINGS, ...TOWN_WORKSHOPS, ...DECORATIONS, ...TOWN_DECORATIONS]

export const OBJECTS_BY_ID: Record<string, ObjectDef> = Object.fromEntries(OBJECTS.map((o) => [o.id, o]))
