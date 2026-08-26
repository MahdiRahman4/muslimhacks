import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BRAND, GLOBAL_CSS } from "@/components/Shared";
import { EventOpsHeader } from "@/components/admin/event-ops/EventOpsHeader";
import { ParticipantDetailPanel } from "@/components/admin/event-ops/ParticipantDetailPanel";

export default function AdminParticipantPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-sans" style={{ background: BRAND.navyDeep, color: BRAND.cream }}>
      <style>{GLOBAL_CSS}</style>
      <EventOpsHeader />

      <main className="max-w-xl mx-auto px-6 py-8 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/admin/event-ops"
            className="inline-flex items-center gap-2 font-sans text-sm hover:opacity-80"
            style={{ color: BRAND.sand }}
          >
            <ArrowLeft size={16} />
            Back to scanner
          </Link>
          <button
            type="button"
            onClick={() => navigate("/admin/event-ops")}
            className="px-4 py-2 rounded-full font-sans text-xs font-semibold uppercase tracking-[0.16em]"
            style={{
              background: `linear-gradient(135deg, ${BRAND.goldSoft} 0%, ${BRAND.gold} 100%)`,
              color: BRAND.navyDeep,
            }}
          >
            Scan next
          </button>
        </div>

        <ParticipantDetailPanel
          participantId={id ?? null}
          onUpdated={() => undefined}
          prominent
        />
      </main>
    </div>
  );
}
