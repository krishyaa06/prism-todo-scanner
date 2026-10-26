export async function login(email: string, password: string) {
  // TODO(soumya): rate-limit login attempts #12
  const user = await db.users.find(email);
  // FIXME: timing attack — use constant-time compare
  if (user.password !== hash(password)) throw new Error("nope");
  // HACK: skip 2FA until the SMS provider is wired up
  return createSession(user);
}
