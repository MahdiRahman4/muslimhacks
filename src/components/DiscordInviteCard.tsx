import { BRAND, Eyebrow } from "@/components/Shared";

export const DISCORD_INVITE_URL = "https://discord.gg/7Ud4XubFd";

function DiscordMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.1 16.1 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.32-.26c.02-.01.05-.01.07 0c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07 0c.1.09.21.18.32.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.02.06.03.09.02c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z" />
    </svg>
  );
}

export function DiscordInviteCard({ fullName }: { fullName: string | null }) {
  const name = fullName?.trim() || "the full name you applied with";

  return (
    <div
      className="rounded-2xl p-7 flex flex-col gap-5"
      style={{
        background: "rgba(88,101,242,0.12)",
        border: "1px solid rgba(88,101,242,0.4)",
        boxShadow: "0 24px 60px rgba(6,15,32,0.4)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="p-2 rounded-lg shrink-0"
          style={{ background: "rgba(88,101,242,0.2)", color: "#C9D1FF" }}
        >
          <DiscordMark />
        </div>
        <div className="flex flex-col gap-1">
          <Eyebrow>RSVP</Eyebrow>
          <h2 className="font-display text-2xl font-bold" style={{ color: BRAND.cream }}>
            Join Discord
          </h2>
          <p
            className="font-intimate text-base leading-relaxed"
            style={{ fontStyle: "italic", color: BRAND.creamMuted }}
          >
            Joining the server is how we know you&apos;re coming. Please don&apos;t share this invite.
          </p>
        </div>
      </div>

      <p className="font-sans text-sm leading-relaxed" style={{ color: BRAND.cream }}>
        Set your Discord nickname to your full application name:{" "}
        <strong style={{ color: BRAND.gold }}>{name}</strong>
      </p>

      <a
        href={DISCORD_INVITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-sans text-sm font-semibold uppercase tracking-[0.15em] transition-all duration-200 hover:brightness-110 active:scale-[0.98] self-start"
        style={{
          background: "#5865F2",
          color: "#ffffff",
          boxShadow: "0 0 18px rgba(88,101,242,0.35)",
        }}
      >
        Open Discord
      </a>
    </div>
  );
}
