// Admin access control utilities

/**
 * Get list of admin emails from environment variable
 */
export function getAdminEmails(): string[] {
  const adminEmailsEnv = process.env.ADMIN_EMAILS || '';
  return adminEmailsEnv.split(',').map(email => email.trim()).filter(Boolean);
}

/**
 * Check if an email is in the admin list
 */
export function isAdmin(email: string | undefined): boolean {
  if (!email) return false;

  const adminEmails = getAdminEmails();
  return adminEmails.includes(email.toLowerCase());
}

/**
 * Check if current user is an admin (server-side)
 */
export async function checkIsAdmin(userEmail: string | undefined): Promise<boolean> {
  return isAdmin(userEmail);
}
