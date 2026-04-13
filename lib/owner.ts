/**
 * В mock-режиме владелец — это пользователь с таким email после входа.
 * Поменяйте константу на свой рабочий email перед демо.
 */
export const OWNER_EMAIL = "admin@neuroshot.ai";

export function isOwnerEmail(email: string): boolean {
  return email.trim().toLowerCase() === OWNER_EMAIL.trim().toLowerCase();
}
