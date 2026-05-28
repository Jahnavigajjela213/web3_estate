import type { Property } from "@/lib/types";

const hiddenDuringCreation = new Set<number>();

function toPropertyId(id?: number | string | null): number | null {
  const value = Number(id);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function markPropertyCreationPending(id?: number | string | null) {
  const propertyId = toPropertyId(id);
  if (propertyId) hiddenDuringCreation.add(propertyId);
}

export function markPropertyCreationComplete(id?: number | string | null) {
  const propertyId = toPropertyId(id);
  if (propertyId) hiddenDuringCreation.delete(propertyId);
}

export function isPropertyFullyCreated(property: Pick<Property, "id" | "token_address">): boolean {
  return Boolean(String(property.token_address ?? "").trim()) && !hiddenDuringCreation.has(property.id);
}

export function filterFullyCreatedProperties<T extends Pick<Property, "id" | "token_address">>(properties: T[]): T[] {
  return properties.filter(isPropertyFullyCreated);
}
