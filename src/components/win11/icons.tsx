import type { SVGProps } from "react";
import type { IconKey } from "@/data/desktop";

type P = SVGProps<SVGSVGElement> & { size?: number };

const base = (size = 16, props: P) => ({
  width: size,
  height: size,
  "aria-hidden": true,
  ...props,
});

/* ---------- Colorful app / file icons ---------- */

function Folder({ size = 48, accent, ...p }: P & { accent?: React.ReactNode }) {
  return (
    <svg viewBox="0 0 48 48" {...base(size, p)}>
      <defs>
        <linearGradient id="fb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFC83D" />
          <stop offset="1" stopColor="#E8A317" />
        </linearGradient>
        <linearGradient id="ff" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE38A" />
          <stop offset="1" stopColor="#FFC83D" />
        </linearGradient>
      </defs>
      <path d="M4 10a3 3 0 0 1 3-3h11l4 4h19a3 3 0 0 1 3 3v24a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V10Z" fill="url(#fb)" />
      <path d="M4 17a3 3 0 0 1 3-3h34a3 3 0 0 1 3 3v19a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V17Z" fill="url(#ff)" />
      {accent}
    </svg>
  );
}

function FolderBadge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <g>
      <rect x="27" y="25" width="16" height="16" rx="4" fill={color} />
      <g transform="translate(27 25)" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
    </g>
  );
}

function Pc({ size = 48, ...p }: P) {
  return (
    <svg viewBox="0 0 48 48" {...base(size, p)}>
      <defs>
        <linearGradient id="pcs" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3CCBF4" />
          <stop offset="1" stopColor="#0F6CBD" />
        </linearGradient>
      </defs>
      <rect x="4" y="7" width="40" height="27" rx="3" fill="#3B3B3B" />
      <rect x="6" y="9" width="36" height="23" rx="1.5" fill="url(#pcs)" />
      <path d="M18 34h12l2 6H16l2-6Z" fill="#9AA0A6" />
      <rect x="13" y="39" width="22" height="3" rx="1.5" fill="#6B6F75" />
    </svg>
  );
}

function Bin({ size = 48, ...p }: P) {
  return (
    <svg viewBox="0 0 48 48" {...base(size, p)}>
      <defs>
        <linearGradient id="bn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E6EEF7" />
          <stop offset="1" stopColor="#B5C4D6" />
        </linearGradient>
      </defs>
      <path d="M10 12h28l-3 30a3 3 0 0 1-3 2.7H16A3 3 0 0 1 13 42L10 12Z" fill="url(#bn)" stroke="#8DA2BB" />
      <rect x="8" y="8" width="32" height="5" rx="2.5" fill="#CFDAE6" stroke="#8DA2BB" />
      <path d="M19 19v19M24 19v19M29 19v19" stroke="#8DA2BB" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Browser({ size = 48, ...p }: P) {
  // Three 120° wedges around a white ring and a blue core
  const pt = (deg: number, r = 21) => {
    const a = (deg * Math.PI) / 180;
    return `${24 + r * Math.cos(a)} ${24 + r * Math.sin(a)}`;
  };
  const wedge = (a: number, b: number) => `M24 24 L${pt(a)} A21 21 0 0 1 ${pt(b)} Z`;
  return (
    <svg viewBox="0 0 48 48" {...base(size, p)}>
      <path d={wedge(210, 330)} fill="#EA4335" />
      <path d={wedge(330, 450)} fill="#FBBC04" />
      <path d={wedge(90, 210)} fill="#34A853" />
      <circle cx="24" cy="24" r="10" fill="#fff" />
      <circle cx="24" cy="24" r="7.8" fill="#1A73E8" />
    </svg>
  );
}

function Settings({ size = 48, ...p }: P) {
  const teeth = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <svg viewBox="0 0 48 48" {...base(size, p)}>
      <defs>
        <linearGradient id="st" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8A97A8" />
          <stop offset="1" stopColor="#4A5566" />
        </linearGradient>
      </defs>
      <g fill="url(#st)">
        {teeth.map((d) => (
          <rect key={d} x="20.5" y="4" width="7" height="10" rx="2" transform={`rotate(${d} 24 24)`} />
        ))}
        <circle cx="24" cy="24" r="15" />
      </g>
      <circle cx="24" cy="24" r="6.5" fill="#E8EDF3" />
    </svg>
  );
}

function Notepad({ size = 48, ...p }: P) {
  return (
    <svg viewBox="0 0 48 48" {...base(size, p)}>
      <rect x="9" y="6" width="30" height="38" rx="3" fill="#fff" stroke="#C8CDD3" />
      <rect x="9" y="6" width="30" height="8" rx="3" fill="#3B9BEA" />
      <path d="M15 21h18M15 27h18M15 33h12" stroke="#7A8590" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 4v6M21 4v6M27 4v6M33 4v6" stroke="#5A6470" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Pdf({ size = 48, ...p }: P) {
  return (
    <svg viewBox="0 0 48 48" {...base(size, p)}>
      <path d="M11 4h18l10 10v28a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" fill="#fff" stroke="#C8CDD3" />
      <path d="M29 4v8a2 2 0 0 0 2 2h8" fill="#E9ECEF" stroke="#C8CDD3" />
      <rect x="5" y="24" width="26" height="13" rx="2" fill="#D13438" />
      <text x="18" y="33.5" textAnchor="middle" fontSize="8" fontWeight="700" fill="#fff" fontFamily="Segoe UI, sans-serif">
        PDF
      </text>
    </svg>
  );
}

function Drive({ size = 48, system, ...p }: P & { system?: boolean }) {
  return (
    <svg viewBox="0 0 48 48" {...base(size, p)}>
      <defs>
        <linearGradient id="dv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E9EDF2" />
          <stop offset="1" stopColor="#B9C2CC" />
        </linearGradient>
      </defs>
      <path d="M8 28 12 13a3 3 0 0 1 2.9-2.2h18.2A3 3 0 0 1 36 13l4 15Z" fill="#D7DDE4" stroke="#9AA4AF" />
      <rect x="6" y="27" width="36" height="12" rx="3" fill="url(#dv)" stroke="#8E98A3" />
      <rect x="31" y="31.5" width="7" height="3" rx="1.5" fill="#3FB950" />
      <path d="M11 33h14" stroke="#8E98A3" strokeWidth="1.5" strokeLinecap="round" />
      {system && (
        <g transform="translate(17 13.5)">
          <rect width="6.2" height="6.2" fill="#0F6CBD" />
          <rect x="7" width="6.2" height="6.2" fill="#0F6CBD" />
          <rect y="7" width="6.2" height="6.2" fill="#0F6CBD" />
          <rect x="7" y="7" width="6.2" height="6.2" fill="#0F6CBD" />
        </g>
      )}
    </svg>
  );
}

function Tile({ size = 48, bg, children, ...p }: P & { bg: string }) {
  return (
    <svg viewBox="0 0 48 48" {...base(size, p)}>
      <rect x="4" y="4" width="40" height="40" rx="10" fill={bg} />
      {children}
    </svg>
  );
}

export function AppIcon({ icon, size = 48 }: { icon: IconKey; size?: number }) {
  switch (icon) {
    case "folder":
      return <Folder size={size} />;
    case "folder-projects":
      return (
        <Folder
          size={size}
          accent={
            <FolderBadge color="#0F6CBD">
              <path d="M5 6 2.5 8 5 10M11 6l2.5 2L11 10M9 4.5 7 11.5" />
            </FolderBadge>
          }
        />
      );
    case "folder-pets":
      return (
        <Folder
          size={size}
          accent={
            <FolderBadge color="#C239B3">
              <path d="M8 12.5s-4.5-2.6-4.5-5.6A2.4 2.4 0 0 1 8 5.6a2.4 2.4 0 0 1 4.5 1.3c0 3-4.5 5.6-4.5 5.6Z" />
            </FolderBadge>
          }
        />
      );
    case "folder-tools":
      return (
        <Folder
          size={size}
          accent={
            <FolderBadge color="#13A10E">
              <path d="M10.5 3.5a3 3 0 0 0-3.8 3.8L3 11l2 2 3.7-3.7a3 3 0 0 0 3.8-3.8l-1.8 1.8-1.6-.4-.4-1.6 1.8-1.8Z" />
            </FolderBadge>
          }
        />
      );
    case "folder-contacts":
      return (
        <Folder
          size={size}
          accent={
            <FolderBadge color="#8764B8">
              <circle cx="8" cy="6" r="2.3" />
              <path d="M3.8 13c.5-2.3 2.2-3.5 4.2-3.5s3.7 1.2 4.2 3.5" />
            </FolderBadge>
          }
        />
      );
    case "folder-docs":
      return (
        <Folder
          size={size}
          accent={
            <FolderBadge color="#5C6670">
              <path d="M5 3.5h4l2.5 2.5v6.5h-6.5ZM6.5 8.5h3.5M6.5 10.5h3.5" />
            </FolderBadge>
          }
        />
      );
    case "folder-games":
      return (
        <Folder
          size={size}
          accent={
            <FolderBadge color="#E3008C">
              <path d="M4.5 6.5h7a2 2 0 0 1 2 2.2l-.4 2.6a1.3 1.3 0 0 1-2.3.6L10 10.5H6l-.8 1.4a1.3 1.3 0 0 1-2.3-.6l-.4-2.6a2 2 0 0 1 2-2.2ZM5.5 8v1.6M4.7 8.8h1.6" />
            </FolderBadge>
          }
        />
      );
    case "drive-c":
      return <Drive size={size} system />;
    case "drive-d":
      return <Drive size={size} />;
    case "terminal":
      return (
        <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden>
          <rect x="4" y="7" width="40" height="34" rx="4" fill="#1E1E1E" stroke="#4A4A4A" />
          <rect x="4" y="7" width="40" height="7" rx="4" fill="#3A3A3A" />
          <path d="M11 22l6 5-6 5" fill="none" stroke="#E6E6E6" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 33h10" stroke="#E6E6E6" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      );
    case "run":
      return (
        <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden>
          <rect x="5" y="9" width="38" height="30" rx="3" fill="#fff" stroke="#9AA4AF" />
          <rect x="5" y="9" width="38" height="7" rx="3" fill="#0F6CBD" />
          <rect x="10" y="24" width="22" height="7" rx="1.5" fill="#E9EDF2" stroke="#9AA4AF" />
          <path d="M34 27.5h5m-2.5-2.5 2.5 2.5-2.5 2.5" fill="none" stroke="#0F6CBD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "exe":
      return (
        <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden>
          <rect x="5" y="8" width="38" height="32" rx="3" fill="#F3F5F8" stroke="#9AA4AF" />
          <rect x="5" y="8" width="38" height="7" rx="3" fill="#C42B1C" />
          <path d="M24 20.5 33 36H15Z" fill="#FFB900" stroke="#C78E00" strokeLinejoin="round" />
          <path d="M24 25.5v5M24 33.2v.1" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "pc":
      return <Pc size={size} />;
    case "bin":
      return <Bin size={size} />;
    case "browser":
      return <Browser size={size} />;
    case "notepad":
      return <Notepad size={size} />;
    case "settings":
      return <Settings size={size} />;
    case "paint":
      return (
        <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden>
          <path d="M24 5C13 5 4.5 13 4.5 23c0 9 7 15.5 15 15.5 3 0 4-1.6 4-3.4 0-2.4-1.8-3-1.8-5.1 0-2 1.6-3.4 3.8-3.4h4.6c6.6 0 13.4-3.6 13.4-10.6C43.5 11.8 35 5 24 5Z" fill="#f4f1ea" stroke="#c9c2b3" />
          <circle cx="14" cy="22" r="3.4" fill="#e81123" />
          <circle cx="19" cy="13.5" r="3.4" fill="#ffb900" />
          <circle cx="29" cy="12" r="3.4" fill="#16c60c" />
          <circle cx="36.5" cy="18.5" r="3.4" fill="#0078d4" />
          <path d="M42 30 30.5 41.5c-1.4 1.4-3.6 1.4-5 0l-.4-.4 12.7-12.7.4.4c.8.8 2.6 1.2 3.8 1.2Z" fill="#8764b8" />
          <path d="m37.8 28.4 4.6-4.6c1-1 2.6-1 3.6 0s1 2.6 0 3.6L41.4 32Z" fill="#c4a173" />
        </svg>
      );
    case "solitaire":
      return (
        <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden>
          <rect x="6" y="9" width="22" height="31" rx="3" transform="rotate(-12 17 24)" fill="#1f5fbf" stroke="#fff" strokeWidth="1.5" />
          <rect x="19" y="7" width="23" height="32" rx="3" transform="rotate(8 30 23)" fill="#fff" stroke="#c7ccd3" />
          <path d="M31 13s-5 3.2-5 6.8a2.7 2.7 0 0 0 5 1.4 2.7 2.7 0 0 0 5-1.4c0-3.6-5-6.8-5-6.8Z" transform="rotate(8 30 23) translate(-1 4)" fill="#d4202c" />
        </svg>
      );
    case "calculator":
      return (
        <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden>
          <rect x="8" y="4" width="32" height="40" rx="5" fill="#3a3f47" />
          <rect x="12" y="8" width="24" height="9" rx="2" fill="#9fd4ff" />
          {[0, 1, 2].flatMap((r) =>
            [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={12 + c * 8.5} y={21 + r * 7.5} width="6.5" height="5.5" rx="1.2" fill={c === 2 && r === 2 ? "#0f6cbd" : "#6b7380"} />),
          )}
        </svg>
      );
    case "pdf":
      return <Pdf size={size} />;
    case "profile":
      return (
        <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden>
          <defs>
            <linearGradient id="pf" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#A53DFF" />
              <stop offset="1" stopColor="#5B2DD8" />
            </linearGradient>
          </defs>
          <circle cx="24" cy="24" r="20" fill="url(#pf)" />
          <circle cx="24" cy="19" r="7" fill="#fff" />
          <path d="M11.5 37c2.5-5.5 7-8 12.5-8s10 2.5 12.5 8a20 20 0 0 1-25 0Z" fill="#fff" />
        </svg>
      );
    case "github":
      return (
        <Tile size={size} bg="#1F2328">
          <path
            transform="translate(12 12) scale(1.5)"
            fill="#fff"
            d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.72 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.65-.89-3.65-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 8 0Z"
          />
        </Tile>
      );
    case "linkedin":
      return (
        <Tile size={size} bg="#0A66C2">
          <text x="24" y="32" textAnchor="middle" fontSize="22" fontWeight="700" fill="#fff" fontFamily="Segoe UI, Arial, sans-serif">
            in
          </text>
        </Tile>
      );
    case "telegram":
      return (
        <Tile size={size} bg="#2AABEE">
          <path d="M12 23.5 34.5 14.6c1-.4 1.9.2 1.6 1.7l-3.8 18c-.3 1.3-1 1.6-2.1 1l-5.8-4.3-2.8 2.7c-.3.3-.6.6-1.2.6l.4-6L31.6 18.5c.5-.4-.1-.7-.7-.2L17 27l-5.7-1.8c-1.2-.4-1.3-1.2.3-1.7Z" fill="#fff" />
        </Tile>
      );
    case "whatsapp":
      return (
        <Tile size={size} bg="#25D366">
          <path d="M24 12a12 12 0 0 0-10.4 18L12 36l6.2-1.6A12 12 0 1 0 24 12Z" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M19.5 18.5c.4-.6 1.2-.6 1.5 0l1 2.3c.2.4 0 .8-.3 1.1l-.6.6c.8 1.6 2 2.8 3.6 3.6l.6-.6c.3-.3.7-.4 1.1-.3l2.3 1c.6.3.6 1.1 0 1.5-1.2 1-2.8 1.2-4.3.4a11 11 0 0 1-5.2-5.2c-.8-1.5-.6-3.1.3-4.4Z" fill="#fff" />
        </Tile>
      );
    case "mail":
      return (
        <Tile size={size} bg="#fff">
          <rect x="4.5" y="4.5" width="39" height="39" rx="9.5" fill="none" stroke="#DADCE0" />
          <path d="M11 16v17h5V21l8 6 8-6v12h5V16l-13 9.5Z" fill="#EA4335" />
          <path d="M11 16v17h5V21Z" fill="#4285F4" />
          <path d="M32 21v12h5V16Z" fill="#34A853" />
        </Tile>
      );
  }
}

/* ---------- Monochrome UI glyphs (Fluent-like, 16px) ---------- */

const g = (size: number | undefined, props: P) => ({
  width: size ?? 16,
  height: size ?? 16,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...props,
});

export const WinLogo = ({ size = 24, ...p }: P) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden {...p}>
    <defs>
      <linearGradient id="wl" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#4CC2FF" />
        <stop offset="1" stopColor="#0067C0" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="9.5" height="9.5" rx="1" fill="url(#wl)" />
    <rect x="12.5" y="2" width="9.5" height="9.5" rx="1" fill="url(#wl)" />
    <rect x="2" y="12.5" width="9.5" height="9.5" rx="1" fill="url(#wl)" />
    <rect x="12.5" y="12.5" width="9.5" height="9.5" rx="1" fill="url(#wl)" />
  </svg>
);

export const IconSearch = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <circle cx="6.8" cy="6.8" r="4.6" />
    <path d="m10.3 10.3 4 4" />
  </svg>
);
export const IconClose = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="m3.5 3.5 9 9m0-9-9 9" />
  </svg>
);
export const IconMin = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M3 8h10" />
  </svg>
);
export const IconMax = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <rect x="3.5" y="3.5" width="9" height="9" rx="1.2" />
  </svg>
);
export const IconRestore = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <rect x="3" y="5" width="8" height="8" rx="1.2" />
    <path d="M5.5 3h6A1.5 1.5 0 0 1 13 4.5v6" />
  </svg>
);
export const IconBack = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M13 8H3m4-4.5L2.5 8 7 12.5" />
  </svg>
);
export const IconForward = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M3 8h10M9 3.5 13.5 8 9 12.5" />
  </svg>
);
export const IconUp = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M8 13V3M3.5 7 8 2.5 12.5 7" />
  </svg>
);
export const IconReload = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M13 8a5 5 0 1 1-1.5-3.6M13 2.5v2.5h-2.5" />
  </svg>
);
export const IconHome = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M2.5 7.2 8 2.5l5.5 4.7V13a.5.5 0 0 1-.5.5H10V10H6v3.5H3a.5.5 0 0 1-.5-.5Z" />
  </svg>
);
export const IconPlus = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M8 3v10M3 8h10" />
  </svg>
);
export const IconExternal = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M9 2.5h4.5V7M13.5 2.5 7.5 8.5M12 9.5v3a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3" />
  </svg>
);
export const IconChevronRight = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="m6 3.5 4.5 4.5L6 12.5" />
  </svg>
);
export const IconChevronUp = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M3.5 10 8 5.5l4.5 4.5" />
  </svg>
);
export const IconChevronDown = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M3.5 6 8 10.5 12.5 6" />
  </svg>
);
export const IconWifi = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M1.5 6a9.5 9.5 0 0 1 13 0M3.7 8.4a6.3 6.3 0 0 1 8.6 0M5.9 10.8a3.2 3.2 0 0 1 4.2 0" />
    <circle cx="8" cy="13" r=".6" fill="currentColor" />
  </svg>
);
export const IconVolume = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M2.5 6v4h2.5L8.5 13V3L5 6Z" />
    <path d="M10.8 5.7a3.3 3.3 0 0 1 0 4.6M12.6 4a5.8 5.8 0 0 1 0 8" />
  </svg>
);
export const IconBattery = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <rect x="1.5" y="4.5" width="11.5" height="7" rx="1.5" />
    <path d="M14.5 6.8v2.4" />
    <rect x="3" y="6" width="7" height="4" rx=".5" fill="currentColor" stroke="none" />
  </svg>
);
export const IconPower = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M8 2v5.5M4.5 4.2a5 5 0 1 0 7 0" />
  </svg>
);
export const IconLock = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <rect x="3" y="7" width="10" height="7" rx="1.5" />
    <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
  </svg>
);
export const IconMoon = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M13 9.5A5.5 5.5 0 1 1 6.5 3a4.5 4.5 0 0 0 6.5 6.5Z" />
  </svg>
);
export const IconSun = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <circle cx="8" cy="8" r="2.8" />
    <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1" />
  </svg>
);
export const IconBluetooth = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="m4.5 5 7 6L8 14V2l3.5 3-7 6" />
  </svg>
);
export const IconPlane = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M7 2.5c0-.6.5-1 1-1s1 .4 1 1v4l5 3v1.5l-5-1.5v3l1.5 1.2v1L8 14l-2.5.7v-1L7 12.5v-3L2 11V9.5l5-3Z" />
  </svg>
);
export const IconCopy = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <rect x="5" y="5" width="8.5" height="8.5" rx="1.5" />
    <path d="M10.5 3a1.5 1.5 0 0 0-1.5-1H4a1.5 1.5 0 0 0-1.5 1.5V9A1.5 1.5 0 0 0 4 10.5" />
  </svg>
);
export const IconDownload = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M8 2v8.5M4.5 7 8 10.5 11.5 7M2.5 13.5h11" />
  </svg>
);
export const IconGrid = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" />
    <rect x="9" y="2.5" width="4.5" height="4.5" rx="1" />
    <rect x="2.5" y="9" width="4.5" height="4.5" rx="1" />
    <rect x="9" y="9" width="4.5" height="4.5" rx="1" />
  </svg>
);
export const IconList = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M5.5 4h8M5.5 8h8M5.5 12h8" />
    <circle cx="2.8" cy="4" r=".5" fill="currentColor" />
    <circle cx="2.8" cy="8" r=".5" fill="currentColor" />
    <circle cx="2.8" cy="12" r=".5" fill="currentColor" />
  </svg>
);
export const IconUser = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <circle cx="8" cy="5.5" r="3" />
    <path d="M2.5 14c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5" />
  </svg>
);
export const IconCode = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M5.5 4.5 2 8l3.5 3.5M10.5 4.5 14 8l-3.5 3.5M9.2 2.5 6.8 13.5" />
  </svg>
);
export const IconSparkle = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M8 1.5 9.5 6.5 14.5 8 9.5 9.5 8 14.5 6.5 9.5 1.5 8 6.5 6.5Z" />
  </svg>
);
export const IconChat = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M2.5 4a1.5 1.5 0 0 1 1.5-1.5h8A1.5 1.5 0 0 1 13.5 4v5.5A1.5 1.5 0 0 1 12 11H7l-3.5 3v-3a1 1 0 0 1-1-1Z" />
  </svg>
);
export const IconInfo = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <circle cx="8" cy="8" r="6" />
    <path d="M8 7.2V11" />
    <circle cx="8" cy="5" r=".5" fill="currentColor" />
  </svg>
);
export const IconRefresh = IconReload;

export const IconWifiOff = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M1.5 6a9.5 9.5 0 0 1 4-2.2M3.7 8.4a6.3 6.3 0 0 1 2.4-1.4M10.6 7.3a6.3 6.3 0 0 1 1.7 1.1M8.5 4a9.5 9.5 0 0 1 6 2M5.9 10.8a3.2 3.2 0 0 1 4.2 0M2 2l12 12" />
  </svg>
);
export const IconVolumeMute = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M2.5 6v4h2.5L8.5 13V3L5 6Z" />
    <path d="m10.5 6 4 4m0-4-4 4" />
  </svg>
);
export const IconVolumeLow = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M2.5 6v4h2.5L8.5 13V3L5 6Z" />
    <path d="M10.8 5.7a3.3 3.3 0 0 1 0 4.6" />
  </svg>
);
export const IconBatteryCharging = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <rect x="1.5" y="4.5" width="11.5" height="7" rx="1.5" />
    <path d="M14.5 6.8v2.4" />
    <path d="M7.8 5.5 5.6 8.2h2.6L6.2 10.5" />
  </svg>
);
export function IconBatteryLevel({ size, level, charging, ...p }: P & { level: number; charging?: boolean }) {
  if (charging) return <IconBatteryCharging size={size} {...p} />;
  const w = Math.max(0.6, (Math.min(100, level) / 100) * 8.5);
  return (
    <svg {...g(size, p)}>
      <rect x="1.5" y="4.5" width="11.5" height="7" rx="1.5" />
      <path d="M14.5 6.8v2.4" />
      <rect x="3" y="6" width={w} height="4" rx=".5" fill="currentColor" stroke="none" />
    </svg>
  );
}
export const IconBell = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M4 11.5V7a4 4 0 0 1 8 0v4.5l1 1.2H3Z" />
    <path d="M6.5 14a1.6 1.6 0 0 0 3 0" />
  </svg>
);
export const IconGear = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <circle cx="8" cy="8" r="2" />
    <path d="M8 1.8 9.2 3l1.7-.3.6 1.6 1.6.6-.3 1.7L14 8l-1.2 1.2.3 1.7-1.6.6-.6 1.6-1.7-.3L8 14.2 6.8 13l-1.7.3-.6-1.6-1.6-.6.3-1.7L2 8l1.2-1.2-.3-1.7 1.6-.6.6-1.6 1.7.3Z" />
  </svg>
);
export const IconStar = ({ size, filled, ...p }: P & { filled?: boolean }) => (
  <svg {...g(size, p)}>
    <path d="m8 1.8 1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 2 .7-4.3-3.1-3 4.3-.6Z" fill={filled ? "currentColor" : "none"} />
  </svg>
);
export const IconDotsV = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <circle cx="8" cy="3.5" r=".9" fill="currentColor" stroke="none" />
    <circle cx="8" cy="8" r=".9" fill="currentColor" stroke="none" />
    <circle cx="8" cy="12.5" r=".9" fill="currentColor" stroke="none" />
  </svg>
);
export const IconTune = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M2.5 5h6M12 5h1.5M2.5 11H4M7.5 11h6" />
    <circle cx="10.3" cy="5" r="1.6" />
    <circle cx="5.8" cy="11" r="1.6" />
  </svg>
);
export const IconCheck = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="m3 8.5 3 3 7-7" />
  </svg>
);
export const IconDot = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <circle cx="8" cy="8" r="2.5" fill="currentColor" stroke="none" />
  </svg>
);
export const IconChevronLeft = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M10 3.5 5.5 8l4.5 4.5" />
  </svg>
);
export const IconLeaf = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M3 13c0-6 3.5-9.5 10-10 0 6.5-3.5 10-9 10Z" />
    <path d="M3 13 9 7" />
  </svg>
);
export const IconNightLight = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M12.5 9.8A5 5 0 1 1 6.2 3.5a4 4 0 0 0 6.3 6.3Z" />
    <path d="M11 2v2M10 3h2" />
  </svg>
);
export const IconGlobe = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <circle cx="8" cy="8" r="6" />
    <path d="M2 8h12M8 2c1.8 1.7 2.6 3.7 2.6 6S9.8 12.3 8 14C6.2 12.3 5.4 10.3 5.4 8S6.2 3.7 8 2Z" />
  </svg>
);
export const IconMonitor = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <rect x="1.5" y="2.5" width="13" height="8.5" rx="1.2" />
    <path d="M5.5 14h5M8 11v3" />
  </svg>
);
export const IconBrush = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M13.5 2.5 7 9l-1.5-.5L6 7l6.5-6.5Z" transform="translate(0 1)" />
    <path d="M5 9.5c-1.5 0-2.5 1-2.5 2.5 0 .8-.4 1.3-1 1.5 3.5 1 6-.5 6-2.5Z" />
  </svg>
);
export const IconClock = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <circle cx="8" cy="8" r="6" />
    <path d="M8 4.5V8l2.5 1.5" />
  </svg>
);
export const IconSort = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M4.5 13V3M2 5.5 4.5 3 7 5.5M11.5 3v10M9 10.5l2.5 2.5 2.5-2.5" />
  </svg>
);
export const IconEye = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z" />
    <circle cx="8" cy="8" r="2" />
  </svg>
);
export const IconSave = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M3 2.5h8l2.5 2.5v8.5H3Z" />
    <path d="M5.5 2.5v3h5v-3M5 13.5v-4h6v4" />
  </svg>
);
export const IconFile = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M4 1.5h5.5L12.5 4.5v10H4Z" />
    <path d="M9.5 1.5v3h3" />
  </svg>
);
export const IconZoomIn = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <circle cx="6.8" cy="6.8" r="4.6" />
    <path d="m10.3 10.3 4 4M4.8 6.8h4M6.8 4.8v4" />
  </svg>
);
export const IconZoomOut = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <circle cx="6.8" cy="6.8" r="4.6" />
    <path d="m10.3 10.3 4 4M4.8 6.8h4" />
  </svg>
);
export const IconWrap = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M2 4h12M2 8h9.5a2 2 0 0 1 0 4H8m1.5-1.5L8 12l1.5 1.5M2 12h3" />
  </svg>
);
export const IconSelectAll = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M2.5 4.5v-2h2M11.5 2.5h2v2M13.5 11.5v2h-2M4.5 13.5h-2v-2M7 2.5h2M7 13.5h2M2.5 7v2M13.5 7v2" />
    <rect x="5.5" y="5.5" width="5" height="5" rx=".5" />
  </svg>
);
export const IconTabs = ({ size, ...p }: P) => (
  <svg {...g(size, p)}>
    <path d="M4.5 6.5 8 10l3.5-3.5" />
  </svg>
);

/** The little arrow Windows draws over shortcut icons */
export const ShortcutBadge = ({ size = 14 }: { size?: number }) => (
  <svg viewBox="0 0 14 14" width={size} height={size} aria-hidden>
    <rect x=".5" y=".5" width="13" height="13" rx="2" fill="#fff" stroke="#c9ced6" />
    <path d="M4 10.5c.2-3.4 2-5 5.3-5H10M8 3.5 10.2 5.6 8 7.7" fill="none" stroke="#0067c0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Windows boot / shutdown spinner: five dots chasing each other */
export const WinSpinner = ({ size = 40 }: { size?: number }) => (
  <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden className="win-spinner">
    {[0, 1, 2, 3, 4].map((i) => (
      <circle key={i} cx="20" cy="4" r="2.4" fill="currentColor" style={{ animationDelay: `${i * 0.12}s` }} />
    ))}
  </svg>
);

/** Windows' default account picture: a neutral silhouette instead of a personal photo */
export function UserAvatar({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={`shrink-0 rounded-full ${className}`} aria-hidden>
      <defs>
        <linearGradient id="ua-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9d1dc" />
          <stop offset="1" stopColor="#9aa6b6" />
        </linearGradient>
        <clipPath id="ua-clip">
          <circle cx="32" cy="32" r="32" />
        </clipPath>
      </defs>
      <circle cx="32" cy="32" r="32" fill="url(#ua-bg)" />
      <g clipPath="url(#ua-clip)" fill="#fff">
        <circle cx="32" cy="25" r="11" />
        <path d="M10 64c1.5-13 10.5-20 22-20s20.5 7 22 20Z" />
      </g>
    </svg>
  );
}
