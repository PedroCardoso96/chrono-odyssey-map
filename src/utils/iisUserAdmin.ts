// src/utils/isUserAdmin.ts
export function isUserAdmin(user: any): boolean {
  if (!user || !user.email) return false;

  const adminEmails = ['odysseychrono@gmail.com'];

  if (import.meta.env.DEV) {
    adminEmails.push('pedrohfsc96@gmail.com');
  }

  return adminEmails.includes(user.email);
}

