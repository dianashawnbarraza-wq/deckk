"use client";

import { AuthShell } from "@/components/layout/auth-shell";
import { DeckSettingsForm } from "@/components/deck/deck-settings-form";

export default function OnboardingForm() {
  return (
    <AuthShell
      title="Claim your handle"
      subtitle="Pick your address, name, and accent — you can update your name and theme anytime from deck settings."
    >
      <DeckSettingsForm mode="create" />
    </AuthShell>
  );
}
