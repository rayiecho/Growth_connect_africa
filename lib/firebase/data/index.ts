/**
 * Re-exports for the data layer — `import { ... } from "@/lib/firebase/data"`.
 */
export * as applicants from "./applicants";
export * as videoSubmissions from "./video-submissions";
export * as verifications from "./verifications";
export * as templates from "./templates";
export * as batches from "./verification-batches";
export { logSend } from "./send-log";
export { logRun } from "./engine-log";
export * as dates from "./dates";
export {
  RT,
  emailLookupKey,
  generateLpxId,
  readApplicant,
  readTemplate,
  writeApplicantRecord,
} from "./_references";
