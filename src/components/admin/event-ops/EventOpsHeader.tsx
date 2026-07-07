import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface EventOpsHeaderProps {
  email: string;
  activeSection: "event-ops" | "exports";
  onSectionChange: (section: "event-ops" | "exports") => void;
  onLogout: () => void;
}

export function EventOpsHeader({
  email,
  activeSection,
  onSectionChange,
  onLogout,
}: EventOpsHeaderProps) {
  return (
    <header className="border-b bg-background sticky top-0 z-10">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Staff tool</p>
          <h1 className="text-xl font-semibold">MuslimHacks 2026 — Event Ops</h1>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>

        <nav className="flex items-center gap-2">
          <Button
            variant={activeSection === "event-ops" ? "default" : "outline"}
            size="sm"
            onClick={() => onSectionChange("event-ops")}
          >
            Event Ops
          </Button>
          <Button
            variant={activeSection === "exports" ? "default" : "outline"}
            size="sm"
            onClick={() => onSectionChange("exports")}
          >
            Exports
          </Button>
          <Link to="/admin/applications" className="text-sm underline px-2">
            Applications
          </Link>
          <Button variant="outline" size="sm" onClick={onLogout}>
            Sign out
          </Button>
        </nav>
      </div>
    </header>
  );
}
