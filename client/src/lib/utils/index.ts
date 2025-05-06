import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { FormField } from "@/types";

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date to a localized string
 */
export function formatDate(date: Date | string): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats a datetime to a localized string
 */
export function formatDateTime(date: Date | string): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Truncates text to a specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Creates a unique ID prefixed with a string
 */
export function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Gets the type of question field
 */
export function getFieldType(fieldId: string): "string" | "text" | "int" | "checkbox" {
  if (fieldId.startsWith("customString")) return "string";
  if (fieldId.startsWith("customText")) return "text";
  if (fieldId.startsWith("customInt")) return "int";
  if (fieldId.startsWith("customCheckbox")) return "checkbox";
  return "string"; // default
}

/**
 * Reorders an array based on a drag and drop operation
 */
export function reorderArray<T = any>(
  list: T[], 
  startIndex: number, 
  endIndex: number
): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

/**
 * Gets the label for a question field
 */
export function getFieldLabel(fieldId: string): string {
  const type = getFieldType(fieldId);
  const number = fieldId.match(/\d+/)?.[0] || "";
  
  switch (type) {
    case "string":
      return `Short Text ${number}`;
    case "text":
      return `Long Text ${number}`;
    case "int":
      return `Number ${number}`;
    case "checkbox":
      return `Checkbox ${number}`;
    default:
      return fieldId;
  }
}

/**
 * Checks if all required form fields have values
 */
export function validateFormFields(
  formFields: FormField[],
  formValues: Record<string, any>
): boolean {
  for (const field of formFields) {
    if (field.required && !formValues[field.id]) {
      return false;
    }
  }
  return true;
}

/**
 * Convert form field to template property name
 */
export function fieldToPropertyName(fieldId: string, suffix: "State" | "Question"): string {
  return `${fieldId}${suffix}`;
}

/**
 * Formats field IDs for question order in template
 */
export function formatQuestionOrder(fields: FormField[]): string {
  return JSON.stringify(fields.map((field) => field.id));
}

/**
 * Parse question order from template
 */
export function parseQuestionOrder(orderString: string): string[] {
  try {
    return JSON.parse(orderString);
  } catch (error) {
    console.error("Error parsing question order:", error);
    return [];
  }
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}