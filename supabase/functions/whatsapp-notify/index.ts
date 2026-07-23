import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { event, phone, name, ref } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Record a notification log in app_stats-like fashion via announcements table (optional)
    // Build WhatsApp message
    const adminPhone = "242076452070";
    let message = "";
    if (event === "new_order") {
      message = `Nouvelle commande ${ref} de ${name || "client"} (${phone || "N/A"}). Consultez l'espace gestionnaire.`;
    } else if (event === "new_quote") {
      message = `Nouveau devis ${ref} de ${name || "client"} (${phone || "N/A"}).`;
    } else if (event === "new_subscriber") {
      message = `Nouvel abonné : ${name || "Anonyme"} (${phone || "N/A"}).`;
    } else if (event === "broadcast") {
      // Broadcast to all subscribers
      const { data: subs } = await supabase
        .from("subscribers")
        .select("phone, name");
      const text = encodeURIComponent(ref || "Mise à jour Services VLDMAC.");
      let sent = 0;
      for (const s of subs || []) {
        const p = (s.phone || "").replace(/[^0-9]/g, "");
        if (p.length >= 9) {
          // We cannot send WhatsApp messages server-side without WhatsApp Business API.
          // We return clickable links for the admin to send from their phone.
        }
      }
      return new Response(
        JSON.stringify({
          message: "Broadcast prêt — utilisez les liens WhatsApp générés côté admin.",
          subscribers: subs || [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      message = `Notification Services VLDMAC : ${event}`;
    }

    // Return a WhatsApp deep link for the admin to send from their phone.
    const waLink = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;

    return new Response(
      JSON.stringify({ success: true, waLink, message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
