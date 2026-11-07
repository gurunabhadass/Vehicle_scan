VEHICLE NUMBER SCANNER — SETUP

Files:
- index.html: GitHub Pages frontend. Saves only recognized vehicle numbers in browser localStorage.
- worker.js: Cloudflare Worker proxy. Keeps the Parkese API key out of public GitHub code.

IMPORTANT:
This package is not live until you configure an AI API key and deploy the Worker.

1) Create/sign in to a Parkese account and obtain an ALPR API key:
   https://parkese.com/
2) Create a Cloudflare Worker and paste the contents of worker.js.
3) In Worker Settings > Variables and Secrets, add a SECRET:
   Name: PARKESE_API_KEY
   Value: your Parkese API key
4) Deploy the Worker and copy its public Worker URL.
5) Open index.html and replace:
   PASTE_YOUR_CLOUDFLARE_WORKER_URL_HERE
   with the deployed Worker URL.
6) Upload index.html to your GitHub Pages repository and enable GitHub Pages.

DATA:
- Scanning requires internet.
- Only recognized vehicle numbers and scan date/time are stored in this device's browser localStorage.
- Images are not stored in history.
- Browser data clearing, private browsing, or switching devices may remove/make local history unavailable.
- The browser's localStorage is device/browser-local, not a server database.

SECURITY:
Never put the Parkese API key in index.html or a public GitHub repository.
