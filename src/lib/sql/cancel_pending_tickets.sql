SELECT cron.schedule(
  'cancel_pending_tickets',
  '59 15 * * *',
  $$
  UPDATE "QueuingTicket"
  SET "queuingStatus" = 'CANCELLED',
      "dateUpdated" = NOW()
  WHERE "queuingStatus" IN ('PENDING', 'LAPSED', 'CALLED', 'TRANSFERRED')
    AND ("dateCreated" AT TIME ZONE 'Asia/Manila')::date = (NOW() AT TIME ZONE 'Asia/Manila')::date;
  $$
);

-- "dateCreated"::date = (NOW() AT TIME ZONE 'Asia/Manila')::date

-- ("dateCreated" AT TIME ZONE 'Asia/Manila')::date = (NOW() AT TIME ZONE 'Asia/Manila')::date
