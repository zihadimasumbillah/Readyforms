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
 * Format a date string to a more readable format
 * @param dateString - The date string to format
 * @returns Formatted date string (Month Day, Year, Hour:Minute AM/PM)
 */
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Handle invalid dates
  if (isNaN(date.getTime())) return '';
  
  // Default options for formatting
  const defaultOptions: Intl.DateTimeFormatOptions = options || {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
}

/**
 * Format a date string to a short format (MM/DD/YYYY)
 * @param dateString - The date string to format
 * @returns Formatted short date string
 */
export function formatShortDate(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Handle invalid dates
  if (isNaN(date.getTime())) return '';
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Format a date string to a time format (HH:MM AM/PM)
 * @param dateString - The date string to format
 * @returns Formatted time string
 */
export function formatTime(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Handle invalid dates
  if (isNaN(date.getTime())) return '';
  
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

/**
 * Format a relative time (e.g., "2 days ago")
 * @param dateString - The date string to format
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Handle invalid dates
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
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
  if (fieldId.includes('String')) return "string";
  if (fieldId.includes('Text')) return "text";
  if (fieldId.includes('Int')) return "int";
  if (fieldId.includes('Checkbox')) return "checkbox";
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