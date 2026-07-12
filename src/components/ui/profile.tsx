import { useAuth } from "@/hooks/useAuth";
import { SignedIn, UserButton } from "@clerk/clerk-react";

export default function Profile() {
  const { isAdmin } = useAuth();

  return (
    <SignedIn>
      <UserButton>
        {isAdmin && (
          <UserButton.MenuItems>
            <UserButton.Link
              label="Admin"
              labelIcon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="lucide lucide-shield-user-icon lucide-shield-user"
                >
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                  <path d="M6.376 18.91a6 6 0 0 1 11.249.003" />
                  <circle cx="12" cy="11" r="4" />
                </svg>
              }
              href="/admin/applications"
            />
          </UserButton.MenuItems>
        )}
        {!isAdmin && (
          <UserButton.MenuItems>
            <UserButton.Link
              label="Dashboard"
              labelIcon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="lucide lucide-layout-dashboard-icon lucide-layout-dashboard"
                >
                  <rect width="7" height="9" x="3" y="3" rx="1" />
                  <rect width="7" height="5" x="14" y="3" rx="1" />
                  <rect width="7" height="9" x="14" y="12" rx="1" />
                  <rect width="7" height="5" x="3" y="16" rx="1" />
                </svg>
              }
              href="/dashboard"
            />
            <UserButton.Link
              label="Application"
              labelIcon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="lucide lucide-file-user-icon lucide-file-user"
                >
                  <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
                  <path d="M14 2v5a1 1 0 0 0 1 1h5" />
                  <path d="M16 22a4 4 0 0 0-8 0" />
                  <circle cx="12" cy="15" r="3" />
                </svg>
              }
              href="/apply"
            />
          </UserButton.MenuItems>
        )}
      </UserButton>
    </SignedIn>
  );
}
