import { z } from "zod";

export const MAX_IMPRESSIONS = 1_000_000_000;
export const MAX_CPM = 10_000_000;
export const MAX_PUBLICATIONS = 10_000;

export const impressionsSchema = z
  .number({ invalid_type_error: "Impressions must be a number" })
  .int({ message: "Impressions must be a whole number" })
  .positive({ message: "Impressions must be greater than 0" })
  .max(MAX_IMPRESSIONS, { message: "Impressions must be 1,000,000,000 or less" });

export const cpmSchema = z
  .number({ invalid_type_error: "CPM must be a number" })
  .positive({ message: "CPM must be greater than 0" })
  .max(MAX_CPM, { message: "CPM value is unreasonably large" });

export const publicationCountSchema = z
  .number({ invalid_type_error: "Publications must be a number" })
  .int({ message: "Publications must be a whole number" })
  .min(1, { message: "At least 1 publication is required" })
  .max(MAX_PUBLICATIONS, { message: "Publications must be 10,000 or less" });

/** Parses raw input text into a bounded, safe non-negative integer. */
export const toSafeInt = (raw: string, max: number): number => {
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.min(parsed, max);
};

/** Parses raw input text into a bounded, safe non-negative float. */
export const toSafeFloat = (raw: string, max: number): number => {
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.min(parsed, max);
};
