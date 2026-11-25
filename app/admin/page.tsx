import type { Metadata } from "next";
import { AdminApp } from "@/components/admin/dashboard";
import "./admin.css";

/**
 * The studio's dashboard: visits and what visitors did (server/analytics.mjs),
 * and the "Report a problem or suggestion" button that files a ticket in the
 * tracker. A static shell like every other page; everything in it comes from
 * /api/admin/* after sign-in, so the export holds no numbers.
 */
export const metadata: Metadata = {
  title: "Dashboard — Welcome to Mimoland",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminApp />;
}
