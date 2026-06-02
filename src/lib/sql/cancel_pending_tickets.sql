SELECT cron.schedule(
  'cancel_pending_tickets',
  '30 18 * * *',  -- 6:30 PM (30 mins after closing)
  $$
  UPDATE "QueuingTicket"
  SET "queuingStatus" = 'CANCELLED',
      "dateUpdated" = NOW()
  WHERE "queuingStatus" IN ('PENDING', 'LAPSED', 'CALLED', 'TRANSFERRED')
    AND ("dateCreated" AT TIME ZONE 'Asia/Manila')::date = (NOW() AT TIME ZONE 'Asia/Manila')::date;
  $$
);

-- SELECT cron.schedule(
--   'cancel_pending_tickets',
--   '59 15 * * *',
--   $$
--   UPDATE "QueuingTicket"
--   SET "queuingStatus" = 'CANCELLED',
--       "dateUpdated" = NOW()
--   WHERE "queuingStatus" IN ('PENDING', 'LAPSED', 'CALLED', 'TRANSFERRED')
--     AND ("dateCreated" AT TIME ZONE 'Asia/Manila')::date = (NOW() AT TIME ZONE 'Asia/Manila')::date;
--   $$
-- );

-- "dateCreated"::date = (NOW() AT TIME ZONE 'Asia/Manila')::date

-- ("dateCreated" AT TIME ZONE 'Asia/Manila')::date = (NOW() AT TIME ZONE 'Asia/Manila')::date

-- changed from 3:59PM to 6:30PM
