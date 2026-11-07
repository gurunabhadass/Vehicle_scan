// Cloudflare Worker: securely proxies image uploads to Parkese ALPR.
// In Cloudflare Worker settings, add secret: PARKESE_API_KEY
// Deploy this file, then paste the Worker URL into WORKER_URL in index.html.

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") {
      return Response.json({ error: "Use POST with an image upload." }, { status: 405, headers: cors });
    }
    if (!env.PARKESE_API_KEY) {
      return Response.json({ error: "Server API key is not configured." }, { status: 500, headers: cors });
    }
    try {
      const incoming = await request.formData();
      const image = incoming.get("image");
      if (!(image instanceof File)) {
        return Response.json({ error: "Image file is missing." }, { status: 400, headers: cors });
      }
      if (image.size > 5 * 1024 * 1024) {
        return Response.json({ error: "Image must be 5 MB or smaller." }, { status: 413, headers: cors });
      }
      const upstreamForm = new FormData();
      upstreamForm.append("image", image, image.name || "vehicle.jpg");
      upstreamForm.append("country", "IND");

      const upstream = await fetch("https://alpr.parkese.com/api/v1/plate/recognize", {
        method: "POST",
        headers: { "x-api-key": env.PARKESE_API_KEY },
        body: upstreamForm
      });
      const payload = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        return Response.json({ error: payload.message || payload.error || "AI recognition provider rejected the request." },
          { status: upstream.status, headers: cors });
      }

      // Normalize likely provider response shapes; return only one most prominent plate.
      const plates = Array.isArray(payload.plates) ? payload.plates : [];
      const first = plates[0] || payload.result || payload.data || payload;
      const number = first.number || first.plate_number || first.registration ||
                     first.text?.full || first.text || payload.number || payload.plate_number || "";
      if (!number) {
        return Response.json({ error: "No readable vehicle number plate was detected." }, { status: 422, headers: cors });
      }
      return Response.json({ number: String(number) }, { headers: cors });
    } catch (err) {
      return Response.json({ error: "Server error while processing image." }, { status: 500, headers: cors });
    }
  }
};
