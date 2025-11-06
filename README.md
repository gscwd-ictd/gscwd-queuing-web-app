# GSCWD Queuing Web App

Created with Next.js, Prisma, PostgreSQL, NextAuth and WebSocket

## Flags for Kiosk and Displays

### These flags are used for app deployment

For Kiosk:
"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --kiosk-printing --app=http://{process.env.NEXT_PUBLIC_HOST}/kiosk

For Display/s:
"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --app=http://{process.env.NEXT_PUBLIC_HOST}/display/cw-nsa --autoplay-policy=no-user-gesture-required
