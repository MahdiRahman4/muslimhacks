import { useAuth } from "@/hooks/useAuth";
import { SignedIn, UserButton } from "@clerk/clerk-react";
import { Lock, LayoutDashboard, FileUser, Cog } from 'lucide-react';
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Profile() {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const [imgSize] = useState(16);

  return (
    <SignedIn>
      <UserButton>
        <UserButton.MenuItems>
          {/* Conditional mapping without using wrapper Fragments (<> </>) */}
          {isAdmin ? (
            <UserButton.Link
              label={t("profile.admin")}
              labelIcon={<Lock size={imgSize} />}
              href="/admin/applications"
            />
          ) : (
            <UserButton.Link
              label={t("profile.dashboard")}
              labelIcon={<LayoutDashboard size={imgSize} />}
              href="/dashboard"
            />
          )}

          {isAdmin ? (
            <UserButton.Link
              label={t("profile.eventOperations")}
              labelIcon={<Cog size={imgSize} />}
              href="/admin/event-ops"
            />
          ) : (
            <UserButton.Link
              label={t("profile.application")}
              labelIcon={<FileUser size={imgSize} />}
              href="/apply"
            />
          )}
        </UserButton.MenuItems>
      </UserButton>
    </SignedIn>
  );
}