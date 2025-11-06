SELECT cron.schedule(
  'delete_expired_user_counter_sessions',
  '59 15 * * *',
  $$DELETE FROM "UserSession"
    WHERE "expiresAt" IS NOT NULL AND "expiresAt" < (NOW() AT TIME ZONE 'Asia/Manila');$$
);
 