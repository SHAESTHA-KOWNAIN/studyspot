import { REPORT_STATUSES } from "./statusUtils.js";

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateLogin(values) {
  const errors = {};
  if (!values.email?.trim()) errors.email = "Email is required.";
  else if (!validateEmail(values.email)) errors.email = "Enter a valid email address.";
  if (!values.password) errors.password = "Password is required.";
  return errors;
}

export function validateRegistration(values) {
  const errors = validateLogin(values);
  if (!values.name?.trim()) errors.name = "Full name is required.";
  if (values.password && values.password.length < 8) errors.password = "Password must be at least 8 characters.";
  if (values.confirmPassword !== values.password) errors.confirmPassword = "Passwords do not match.";
  return errors;
}

export function validateReport(values) {
  const errors = {};
  if (!REPORT_STATUSES.includes(values.status)) errors.status = "Choose a valid availability status.";
  if ((values.note ?? "").length > 300) errors.note = "Notes must be 300 characters or fewer.";
  return errors;
}

export function validateSpace(values) {
  const errors = {};
  ["name", "building", "area"].forEach((field) => {
    if (!values[field]?.trim()) errors[field] = `${field[0].toUpperCase()}${field.slice(1)} is required.`;
  });
  if (!values.description?.trim()) errors.description = "Description is required.";
  if (!Array.isArray(values.facilities)) errors.facilities = "Facilities must be a list.";
  return errors;
}
