const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getAllowedDomains() {
  return (process.env.COLLEGE_EMAIL_DOMAINS || '')
    .split(',')
    .map((domain) => domain.trim().toLowerCase().replace(/^@/, ''))
    .filter(Boolean);
}

function isValidEmailFormat(email) {
  return EMAIL_REGEX.test(email);
}

function isCollegeEmail(email) {
  if (typeof email !== 'string') {
    return false;
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!isValidEmailFormat(normalizedEmail)) {
    return false;
  }

  const parts = normalizedEmail.split('@');

  if (parts.length !== 2) {
    return false;
  }

  const domain = parts[1];
  const allowedDomains = getAllowedDomains();

  if (allowedDomains.length === 0) {
    throw new Error('COLLEGE_EMAIL_DOMAINS is not configured.');
  }

  return allowedDomains.includes(domain);
}

module.exports = {
  getAllowedDomains,
  isValidEmailFormat,
  isCollegeEmail
};