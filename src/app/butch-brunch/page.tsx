import { redirect } from "next/navigation";

/** Old vanity URL → canonical /events/butch-brunch */
export default function ButchBrunchRedirect() {
  redirect("/events/butch-brunch");
}
