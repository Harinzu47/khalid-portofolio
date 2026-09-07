/** Only a server-configured identity may operate this single-owner application. */
export function isOwnerUser(user: { id: string; is_anonymous?: boolean } | null | undefined): boolean {
  const ownerId = process.env.OWNER_USER_ID?.trim();
  return Boolean(ownerId && user && !user.is_anonymous && user.id === ownerId);
}
