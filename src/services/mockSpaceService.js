import { filterSpaces } from "../utils/statusUtils.js";
import { readReports, readSpaces, writeSpaces } from "./mockStorage.js";
import { validateSpace } from "../utils/validation.js";

function assertValidSpace(data) {
  const errors = validateSpace(data);
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
}

export async function getSpaces(filters = {}) {
  const allSpaces = readSpaces();
  return filterSpaces(allSpaces, readReports(), filters);
}

export async function getSpaceById(id) {
  const space = readSpaces().find((item) => item.id === id && item.active);
  if (!space) throw new Error("Study space not found.");
  return space;
}

export async function createSpace(data) {
  assertValidSpace(data);
  const spaces = readSpaces();
  const space = { ...data, id: `space-${crypto.randomUUID()}`, active: true };
  spaces.push(space);
  writeSpaces(spaces);
  return space;
}

export async function updateSpace(id, data) {
  assertValidSpace(data);
  const spaces = readSpaces();
  const index = spaces.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Study space not found.");
  spaces[index] = { ...spaces[index], ...data, id, active: data.active ?? spaces[index].active };
  writeSpaces(spaces);
  return spaces[index];
}

export async function deactivateSpace(id) {
  const spaces = readSpaces();
  const index = spaces.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Study space not found.");
  spaces[index] = { ...spaces[index], active: false };
  writeSpaces(spaces);
  return spaces[index];
}
