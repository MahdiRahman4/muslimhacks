import { useAuth } from "@/hooks/useAuth";
import { SignedIn, UserButton } from "@clerk/clerk-react";
import { Lock, LayoutDashboard, FileUser, Cog } from 'lucide-react';
import { useState } from "react";

export default function Profile() {
  const { isAdmin } = useAuth();
  const [imgSize] = useState(16);

  return (
    <SignedIn>
      <UserButton>
        <UserButton.MenuItems>
          {/* Conditional mapping without using wrapper Fragments (<> </>) */}
          {isAdmin ? (
            <UserButton.Link
              label="Admin"
              labelIcon={<Lock size={imgSize} />}
              href="/admin/applications"
            />
          ) : (
            <UserButton.Link
              label="Dashboard"
              labelIcon={<LayoutDashboard size={imgSize} />}
              href="/dashboard"
            />
          )}

          {isAdmin ? (
            <UserButton.Link
              label="Event Operations"
              labelIcon={<Cog size={imgSize} />}
              href="/admin/event-ops"
            />
          ) : (
            <UserButton.Link
              label="Application"
              labelIcon={<FileUser size={imgSize} />}
              href="/apply"
            />
          )}
        </UserButton.MenuItems>
      </UserButton>
    </SignedIn>
  );
}