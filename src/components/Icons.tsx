/** 선 아이콘 모음 (장식용, aria-hidden). 모두 24×24 격자, currentColor. */

export type IconName =
  | "book"
  | "mic"
  | "chat"
  | "upload"
  | "users"
  | "feather"
  | "settings"
  | "search"
  | "chevron-down"
  | "arrow-right"
  | "lock"
  | "calendar"
  | "chapters"
  | "play"
  | "pause"
  | "menu"
  | "leaf"
  | "send"
  | "spark";

export function Icon({ name, size = 20, className = "", strokeWidth = 1.7 }: { name: IconName; size?: number; className?: string; strokeWidth?: number }) {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
  switch (name) {
    case "book":
      return (<svg {...p}><path d="M3 5.5c2.8-1.2 5.7-1.2 9 1v13c-3.3-2.2-6.2-2.2-9-1z" /><path d="M21 5.5c-2.8-1.2-5.7-1.2-9 1v13c3.3-2.2 6.2-2.2 9-1z" /></svg>);
    case "mic":
      return (<svg {...p}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0" /><path d="M12 17.5V21" /></svg>);
    case "chat":
      return (<svg {...p}><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A2.5 2.5 0 0 1 4 13.5z" /><path d="M8.5 9.5h7M8.5 12.5h4" /></svg>);
    case "upload":
      return (<svg {...p}><path d="M12 15V4" /><path d="m7.5 8.5 4.5-4.5 4.5 4.5" /><path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" /></svg>);
    case "users":
      return (<svg {...p}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19.5c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" /><path d="M15.5 4.9a3.2 3.2 0 0 1 0 6.2" /><path d="M17.5 14.7c1.7.6 2.8 2.2 3 4.8" /></svg>);
    case "feather":
      return (<svg {...p}><path d="M20 4c-6 0-11 4-12.5 10.5L6 20" /><path d="M20 4c0 6-4 10.5-10.5 11.5" /><path d="M9 13h6" /></svg>);
    case "settings":
      return (<svg {...p}><circle cx="12" cy="12" r="3" /><path d="M12 2.8v2.4M12 18.8v2.4M4.2 7.5l2.1 1.2M17.7 15.3l2.1 1.2M4.2 16.5l2.1-1.2M17.7 8.7l2.1-1.2" /><circle cx="12" cy="12" r="7" /></svg>);
    case "search":
      return (<svg {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>);
    case "chevron-down":
      return (<svg {...p}><path d="m6 9 6 6 6-6" /></svg>);
    case "arrow-right":
      return (<svg {...p}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>);
    case "lock":
      return (<svg {...p}><rect x="5" y="10.5" width="14" height="10" rx="2.2" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></svg>);
    case "calendar":
      return (<svg {...p}><rect x="4" y="5.5" width="16" height="14.5" rx="2.2" /><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" /></svg>);
    case "chapters":
      return (<svg {...p}><path d="M3.5 8.5 12 5l8.5 3.5L12 12z" /><path d="M3.5 8.5v7L12 19l8.5-3.5v-7" /><path d="M12 12v7" /></svg>);
    case "play":
      return (<svg {...p} fill="currentColor" stroke="none"><path d="M8 5.6v12.8a.8.8 0 0 0 1.2.7l10-6.4a.8.8 0 0 0 0-1.4l-10-6.4A.8.8 0 0 0 8 5.6z" /></svg>);
    case "pause":
      return (<svg {...p} fill="currentColor" stroke="none"><rect x="6.5" y="5" width="4" height="14" rx="1.2" /><rect x="13.5" y="5" width="4" height="14" rx="1.2" /></svg>);
    case "menu":
      return (<svg {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>);
    case "send":
      return (<svg {...p}><path d="M4.5 12 20 4.5 15.5 20l-3-6.5z" /><path d="m12.5 13.5 3-3" /></svg>);
    case "spark":
      return (<svg {...p}><path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></svg>);
    case "leaf":
      return (<svg {...p}><path d="M5 20C6 11 11 5.5 21 4c-.8 9.5-6.5 14.5-15 15" /><path d="M5 20c3-5 6.5-8.5 11-11" /></svg>);
  }
}

/** 로고: 여운 + 잎사귀 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-end gap-1.5 font-serif font-bold tracking-tight text-ink ${className}`}>
      <span className="text-[1.75rem] leading-none">여운</span>
      <Icon name="leaf" size={30} strokeWidth={1.2} className="-mb-0.5 text-accent" />
    </span>
  );
}

