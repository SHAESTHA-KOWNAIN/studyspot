import { DEMO_PASSWORD, mockUsers } from "../data/mockUsers.js";
import { readRegisteredUsers, writeRegisteredUsers } from "./mockStorage.js";
import { validateEmail, validateRegistration } from "../utils/validation.js";

const SESSION_KEY = "studyspot-mock-user";
const registeredPasswords = new Map();

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function login({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const account = mockUsers.find((user) => user.email === normalizedEmail);
  if (account && password === DEMO_PASSWORD) {
    const user = publicUser(account);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  }
  const registered = readRegisteredUsers().find((user) => user.email === normalizedEmail);
  if (registered && registeredPasswords.get(normalizedEmail) === password) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(registered));
    return registered;
  }
  throw new Error("Email or password is incorrect.");
}

export async function register(userData) {
  const errors = validateRegistration(userData);
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
  const email = userData.email.trim().toLowerCase();
  if (!validateEmail(email)) throw new Error("Enter a valid email address.");
  const existing = [...mockUsers, ...readRegisteredUsers()].some((user) => user.email === email);
  if (existing) throw new Error("An account with this email already exists.");
  const user = { id: `member-${crypto.randomUUID()}`, name: userData.name.trim(), email, role: "member" };
  const users = readRegisteredUsers();
  users.push(user);
  writeRegisteredUsers(users);
  registeredPasswords.set(email, userData.password);
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export async function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export async function getCurrentUser() {
  const saved = localStorage.getItem(SESSION_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch (error) {
    localStorage.removeItem(SESSION_KEY);
    throw new Error("Saved mock session could not be read.", { cause: error });
  }
}
