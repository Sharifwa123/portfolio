export const env = (name: string): string | undefined => process.env[name] ?? (import.meta.env as Record<string, string | undefined>)[name];

export const adminConfigured = (): boolean => (env('ADMIN_PASSWORD')?.length ?? 0) >= 12 && (env('SESSION_SECRET')?.length ?? 0) >= 32;
