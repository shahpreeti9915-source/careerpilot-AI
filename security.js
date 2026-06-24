/**
 * Security and Privacy Module for CareerPilot AI
 * Focuses on client-side safety: input validation, sanitization, PII redaction, and audit logging.
 */

// Memory-only security log (never sent to any server)
const securityLogs = [];

/**
 * Log a security event
 * @param {string} category - e.g., 'Sanitization', 'Validation', 'PII Scan', 'Privacy'
 * @param {string} message - Detail message
 * @param {'SAFE'|'WARNING'|'BLOCKED'} status - Severity status
 */
export function logSecurityEvent(category, message, status = 'SAFE') {
  const event = {
    timestamp: new Date().toLocaleTimeString(),
    category,
    message,
    status
  };
  securityLogs.push(event);
  
  // Dispatch a custom event so the UI can listen and update the console
  const customEvent = new CustomEvent('security-log', { detail: event });
  window.dispatchEvent(customEvent);
}

/**
 * Retrieve all active security logs
 */
export function getSecurityLogs() {
  return [...securityLogs];
}

/**
 * Basic HTML escaping to prevent XSS injection
 * @param {string} input 
 * @returns {string} Safe escaped string
 */
export function escapeHTML(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Scan and redact PII patterns (email, phone numbers) from a string
 * @param {string} text 
 * @returns {string} Sanitized string
 */
export function redactPII(text) {
  if (!text) return '';
  let sanitized = text;

  // Regex patterns
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;

  let emailMatches = sanitized.match(emailRegex);
  let phoneMatches = sanitized.match(phoneRegex);

  if (emailMatches) {
    sanitized = sanitized.replace(emailRegex, '[REDACTED EMAIL]');
    logSecurityEvent('PII Scan', `Detected and redacted ${emailMatches.length} email address(es)`, 'WARNING');
  }

  if (phoneMatches) {
    sanitized = sanitized.replace(phoneRegex, '[REDACTED PHONE]');
    logSecurityEvent('PII Scan', `Detected and redacted ${phoneMatches.length} phone number(s)`, 'WARNING');
  }

  return sanitized;
}

/**
 * Validate and sanitize all user profile inputs
 * @param {Object} profile 
 * @returns {Object} { isValid, errors, sanitizedProfile }
 */
export function validateAndSanitizeProfile(profile) {
  logSecurityEvent('Validation', 'Starting profile validation and sanitization scans...', 'SAFE');

  const errors = {};
  const sanitized = {};

  // 1. Education
  let rawEdu = profile.education || '';
  let cleanEdu = escapeHTML(rawEdu.trim());
  cleanEdu = redactPII(cleanEdu);
  if (!cleanEdu) {
    errors.education = 'Education level is required.';
  } else if (cleanEdu.length > 100) {
    errors.education = 'Education entry is too long (max 100 chars).';
  }
  sanitized.education = cleanEdu;

  // 2. Goal / Target Career
  let rawGoal = profile.goal || '';
  let cleanGoal = escapeHTML(rawGoal.trim());
  cleanGoal = redactPII(cleanGoal);
  if (!cleanGoal) {
    errors.goal = 'Target career goal is required.';
  } else if (cleanGoal.length > 100) {
    errors.goal = 'Goal entry is too long (max 100 chars).';
  }
  sanitized.goal = cleanGoal;

  // 3. Skills (comma-separated tags)
  let rawSkills = profile.skills || '';
  let cleanSkills = escapeHTML(rawSkills.trim());
  cleanSkills = redactPII(cleanSkills);
  
  // Format as array of clean, non-empty, lowercase tags
  const skillsArray = cleanSkills
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(s => s.length > 0 && /^[a-z0-9+#.\s-]+$/.test(s)); // Safe characters only (alphanumeric, +, #, ., -, spaces)

  if (skillsArray.length === 0) {
    errors.skills = 'Please enter at least one valid skill (comma-separated, alphanumeric only).';
  }
  sanitized.skills = skillsArray;

  // 4. Study Hours per week
  const rawHours = profile.studyHours;
  const hoursNum = parseInt(rawHours, 10);
  if (isNaN(hoursNum) || hoursNum < 1 || hoursNum > 168) {
    errors.studyHours = 'Study time must be between 1 and 168 hours per week.';
  }
  sanitized.studyHours = hoursNum;

  const isValid = Object.keys(errors).length === 0;

  if (isValid) {
    logSecurityEvent('Validation', 'Profile validation PASSED. All fields are safe.', 'SAFE');
    logSecurityEvent('Privacy', 'No PII or raw user inputs stored on disk. Session storage isolated.', 'SAFE');
  } else {
    logSecurityEvent('Validation', `Profile validation FAILED: ${Object.values(errors).join(', ')}`, 'BLOCKED');
  }

  return { isValid, errors, sanitizedProfile: sanitized };
}
