import { mockSpaces } from "../data/mockSpaces.js";
import { mockReports } from "../data/mockReports.js";

export const MOCK_SPACES_KEY = "studyspot-mock-spaces";
export const MOCK_REPORTS_KEY = "studyspot-mock-reports";
const MOCK_USERS_KEY = "studyspot-mock-users";

function read(key, seed) {
  const saved = localStorage.getItem(key);
  if (saved === null) {
    const initial = structuredClone(seed);
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    const value = JSON.parse(saved);
    if (!Array.isArray(value)) throw new Error("Stored value is not a list.");
    return value;
  } catch (error) {
    throw new Error(`Unable to read StudySpot mock data (${key}). Reset the sample data to continue.`, { cause: error });
  }
}

export function readSpaces() {
  return read(MOCK_SPACES_KEY, mockSpaces);
}

export function writeSpaces(spaces) {
  localStorage.setItem(MOCK_SPACES_KEY, JSON.stringify(spaces));
}

export function readReports() {
  return read(MOCK_REPORTS_KEY, mockReports);
}

export function writeReports(reports) {
  localStorage.setItem(MOCK_REPORTS_KEY, JSON.stringify(reports));
}

export function readRegisteredUsers() {
  return read(MOCK_USERS_KEY, []);
}

export function writeRegisteredUsers(users) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

export function resetMockData() {
  localStorage.removeItem(MOCK_SPACES_KEY);
  localStorage.removeItem(MOCK_REPORTS_KEY);
  localStorage.removeItem(MOCK_USERS_KEY);
}
