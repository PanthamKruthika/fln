// Shared enum constants used across multiple models.
// Keeping them in one place avoids magic-string drift between schemas.
export const USER_ROLES = [
  "superadmin",
  "admin",
  "district_admin",
  "block_admin",
  "school",
  "teacher",
  "volunteer",
];

export const STATUS = ["active", "inactive", "archived"];

export const SCHOOL_TYPE = [
  "primary",
  "upper_primary",
  "secondary",
  "higher_secondary",
];

export const MANAGEMENT_TYPE = [
  "government",
  "private_aided",
  "private_unaided",
  "central_government",
  "state_government",
  "municipal",
];

export const BOARD = [
  "CBSE",
  "ICSE",
  "State Board",
  "IB",
  "ICSE_ISC",
  "NIOS",
  "Other",
];

export const MEDIUM = [
  "English",
  "Hindi",
  "Telugu",
  "Tamil",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Bengali",
  "Gujarati",
  "Punjabi",
  "Odia",
  "Urdu",
  "Other",
];

export const GENDER = ["Male", "Female", "Other"];

export const QUESTION_TYPES = [
  "handwriting",
  "number",
  "multiple_choice",
  "circle",
  "matching",
  "tick",
  "trace",
  "drawing",
];

export const DIFFICULTY = ["easy", "medium", "hard"];

export const FLN_LEVELS = ["L1", "L2", "L3", "L4", "L5"];

export const ASSESSMENT_TYPES = ["Diagnostic", "Practice", "Summative"];

export const ASSESSMENT_STATUS = [
  "Upcoming",
  "Generated",
  "Conducted",
  "Scripts Uploaded",
  "Evaluated",
  "Published",
];

export const WORKSHEET_TYPES = ["Diagnostic", "Practice"];

export const WORKSHEET_ASSIGNMENT_STATUS = [
  "Assigned",
  "Completed",
  "Reviewed",
  "Expired",
];

export const SUBMISSION_PROCESSING_STATUS = [
  "Uploaded",
  "Processing",
  "Completed",
  "Needs Review",
  "Failed",
];

export const NOTIFICATION_TYPE = [
  "info",
  "warning",
  "success",
  "announcement",
];

export const AUDIT_MODULE = [
  "auth",
  "users",
  "schools",
  "students",
  "assessments",
  "worksheets",
  "submissions",
  "evaluations",
  "reports",
  "system",
];

export const AUDIT_ACTION = [
  "create",
  "read",
  "update",
  "delete",
  "login",
  "logout",
  "download",
  "upload",
  "print",
  "submit",
  "evaluate",
  "publish",
];

export const CONCEPT_TOPICS = [
  "Counting",
  "Number Sense",
  "Addition",
  "Subtraction",
  "Patterns",
  "Shapes",
  "Measurement",
  "Money",
  "Calendar and Time",
  "Fractions",
  "Data Handling",
];

// 2-letter state code → standard Indian abbreviation (matches UDISE+).
export const STATE_CODE_PATTERN = /^[A-Z]{2}$/;
// UDISE+ School ID is an 11-digit numeric code.
export const UDISE_PATTERN = /^\d{11}$/;
export const PINCODE_PATTERN = /^\d{6}$/;
// Indian mobile number (10 digits, optional +91 prefix).
export const MOBILE_PATTERN = /^(?:\+?91)?[6-9]\d{9}$/;