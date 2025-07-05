import DOMPurify from "dompurify";

export type FieldType =
  | "text"
  | "html"
  | "email"
  | "url"
  | "number"
  | "port"
  | "connectionName"
  | "databaseName"
  | "hostname"
  | "awsAccessKey"
  | "awsRegion"
  | "filePath";

interface SanitizeOptions {
  /**
   * If true, will limit to this max length
   */
  maxLength?: number;
  /**
   * If true, will normalize unicode to NFC
   */
  normalize?: boolean;
}

/**
 * Core plain text sanitizer
 */
const sanitizePlainText = (input: string): string =>
  input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();

/**
 * Core HTML sanitizer
 */
const sanitizeHtml = (input: string): string =>
  DOMPurify.sanitize(input);

/**
 * Email sanitizer
 */
const sanitizeEmail = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[<>]/g, "")
    .replace(/\s+/g, "");

/**
 * URL sanitizer (strips dangerous protocols)
 */
const sanitizeUrl = (input: string): string =>
  input
    .trim()
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/data:/gi, "");

/**
 * Number sanitizer (keeps digits, dot, minus)
 */
const sanitizeNumber = (input: string): string =>
  input.replace(/[^0-9.-]/g, "");

/**
 * Connection name sanitizer
 */
const sanitizeConnectionName = (input: string): string =>
  input.replace(/[^a-zA-Z0-9\s\-_]/g, "").trim();

/**
 * Database name sanitizer
 */
const sanitizeDatabaseName = (input: string): string =>
  input.replace(/[^a-zA-Z0-9\-_]/g, "").trim();

/**
 * Hostname/IP sanitizer
 */
const sanitizeHostname = (input: string): string =>
  input.replace(/[^a-zA-Z0-9.\-:]/g, "").trim();

/**
 * Port sanitizer
 */
const sanitizePort = (input: string): string =>
  input.replace(/[^0-9]/g, "");

/**
 * AWS Access Key sanitizer
 */
const sanitizeAwsAccessKey = (input: string): string =>
  input.replace(/[^A-Z0-9]/g, "").trim();

/**
 * AWS Region sanitizer
 */
const sanitizeAwsRegion = (input: string): string =>
  input.replace(/[^a-zA-Z0-9\-]/g, "").trim();

/**
 * File path sanitizer
 */
const sanitizeFilePath = (input: string): string =>
  input
    .replace(/[<>:"|?*]/g, "")
    .replace(/\.\./g, "")
    .trim();

/**
 * Central sanitizer dispatcher
 */
export const sanitizeField = (
  rawInput: string,
  fieldType: FieldType = "text",
  options?: SanitizeOptions
): string => {
  let input = rawInput ?? "";

  // Normalize unicode if requested
  if (options?.normalize) {
    input = input.normalize("NFC");
  }

  let sanitized: string;

  switch (fieldType) {
    case "html":
      sanitized = sanitizeHtml(input);
      break;
    case "email":
      sanitized = sanitizeEmail(input);
      break;
    case "url":
      sanitized = sanitizeUrl(input);
      break;
    case "number":
      sanitized = sanitizeNumber(input);
      break;
    case "port":
      sanitized = sanitizePort(input);
      break;
    case "connectionName":
      sanitized = sanitizeConnectionName(input);
      break;
    case "databaseName":
      sanitized = sanitizeDatabaseName(input);
      break;
    case "hostname":
      sanitized = sanitizeHostname(input);
      break;
    case "awsAccessKey":
      sanitized = sanitizeAwsAccessKey(input);
      break;
    case "awsRegion":
      sanitized = sanitizeAwsRegion(input);
      break;
    case "filePath":
      sanitized = sanitizeFilePath(input);
      break;
    default:
      sanitized = sanitizePlainText(input);
      break;
  }

  // Optionally enforce length
  if (options?.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.slice(0, options.maxLength);
  }

  return sanitized;
};
