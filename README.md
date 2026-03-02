# GSCWD Web-based Queuing App

Created with Next.js, Prisma, PostgreSQL, NextAuth and WebSocket

## Flags for Kiosk and Displays

These flags are used for app deployment in kiosk/s and display/s. Refer to this article on how to change target field for app shortcut (for Windows only). Replace {process.env.NEXT_PUBLIC_HOST} with server IP address.

<https://learn.microsoft.com/en-us/answers/questions/4158575/how-to-edit-the-target-of-a-shortcut-in-windows-11?forum=windows-all&referrer=answers>

### For Kiosk

"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --kiosk-printing --app=http://{process.env.NEXT_PUBLIC_HOST}/kiosk

### For Display/s (main display)

Customer Welfare

"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --app=http://{process.env.NEXT_PUBLIC_HOST}/display/cw-nsa --autoplay-policy=no-user-gesture-required

Payment

"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --app=http://{process.env.NEXT_PUBLIC_HOST}/display/payment --autoplay-policy=no-user-gesture-required

## Deployment for Counter/s

### For users with multiple displays

We will be using Microsoft PowerToys' Workspaces feature for opening multiple browser windows with just one click. You can download PowerToys at <https://github.com/microsoft/PowerToys>.

For setting up Workspaces for specific user, refer to this article <https://www.windowscentral.com/microsoft/windows-11/how-to-automate-your-desktop-layout-with-powertoys-workspaces-on-windows-11>

#### Arguments to be used

Screen 1 (main display) - This is where apps/software to be used by the user are displayed

--new-window http://{process.env.NEXT_PUBLIC_HOST}/home

Screen 2 (secondary display) - This is where the queuing number is display if it is called by the user

--new-window --app=http://{process.env.NEXT_PUBLIC_HOST}/display/now-serving-customer --autoplay-policy=no-user-gesture-required

### For users with single display

The app can be accessed using any web browser available (with updated version, if possible) at http://{process.env.NEXT_PUBLIC_HOST}.
