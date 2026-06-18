import { getPlanos } from "@/app/service/pricing.service";
import { PricingClient } from "./PricingClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * PricingDataServer - Server Component
 * 
 * Fetches plans and user session on the server and passes to the client component.
 */
export async function PricingDataServer() {
  // Parallel fetch: Plans and Session
  const [plans, session] = await Promise.all([
    getPlanos(),
    getServerSession(authOptions)
  ]);

  return <PricingClient initialPlans={plans} initialSession={session} />;
}
