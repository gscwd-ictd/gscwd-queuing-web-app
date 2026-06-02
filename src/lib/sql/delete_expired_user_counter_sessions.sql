 -- Morning cleanup (5:00 AM)
SELECT cron.schedule(
  'delete_expired_user_sessions_morning',
  '0 5 * * *',
  $$DELETE FROM "UserSession" WHERE "expiresAt" < (NOW() AT TIME ZONE 'Asia/Manila');$$
);

-- Night cleanup (8:00 PM)
SELECT cron.schedule(
  'delete_expired_user_sessions_night',
  '0 20 * * *',
  $$DELETE FROM "UserSession" WHERE "expiresAt" < (NOW() AT TIME ZONE 'Asia/Manila');$$
);


--Previous: delete session was during 3:59 PM in the afternoon '59 15 * * *',
--New changes: Morning sched at 5am and night at 7pm. This only deletes expired sessions  '0 5 * * *' and '0 20 * * *',