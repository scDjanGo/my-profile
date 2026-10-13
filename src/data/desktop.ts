import { PortfolioData, PetProjects, type Project } from "./PorfolioData";
import { Tools } from "./Tools";
import { GAMES } from "./games";

export type AppId = "explorer" | "browser" | "profile" | "notepad" | "pdf" | "settings" | "calculator" | "paint" | "solitaire" | "terminal" | "run";

export type IconKey =
  | "folder"
  | "folder-projects"
  | "folder-pets"
  | "folder-tools"
  | "folder-contacts"
  | "folder-docs"
  | "folder-games"
  | "drive-c"
  | "drive-d"
  | "terminal"
  | "run"
  | "exe"
  | "pc"
  | "bin"
  | "browser"
  | "profile"
  | "notepad"
  | "pdf"
  | "github"
  | "linkedin"
  | "telegram"
  | "whatsapp"
  | "mail"
  | "settings"
  | "calculator"
  | "paint"
  | "solitaire";

export type { Project };

export type TypeKey = "app" | "pdf" | "txt" | "shortcut" | "skill" | "drive" | "game";

export interface FsNode {
  id: string;
  name: string;
  icon: IconKey;
  /** Image used instead of the icon (project screenshots, tool logos) */
  thumb?: string;
  kind: "folder" | "app" | "link" | "file";
  children?: string[];
  app?: AppId;
  url?: string;
  /** Sites that refuse to load inside an iframe are opened in a real tab */
  external?: boolean;
  project?: Project;
  /** Created by the visitor (new folders) — stored in localStorage */
  custom?: boolean;
  /** Translation key for the explorer "Type" column (projects use their own tag) */
  type?: TypeKey;
  /** Local disk shown under "Devices and drives" (sizes in GB) */
  drive?: { letter: string; total: number; free: number };
  /** Leaves the desktop and loads `url` as a real page (the /bsod easter egg) */
  navigate?: boolean;
  /** Extra words Start search and the Run dialog match (e.g. "cmd") */
  keywords?: string[];
}

export const CONTACTS = {
  email: "bek229101@gmail.com",
  phone: "+996 (557) 766 997",
  phoneRaw: "+996557766997",
  github: "https://github.com/scDjanGo/",
  linkedin: "https://www.linkedin.com/in/asadbek-kasymov-ab080a31b",
  telegram: "https://t.me/scDjanGo",
  whatsapp: "https://wa.me/996557766997?text=Привет",
};

/*
 * Layout: the desktop holds only what a recruiter needs; everything else lives on the drives.
 * C: is the work disk (projects, stack, documents, programs), D: is for fun (games, Paint, easter eggs).
 */
const nodes: FsNode[] = [
  { id: "root", name: "This PC", icon: "pc", kind: "folder", children: ["c", "d"] },
  { id: "desktop", name: "Desktop", icon: "folder", kind: "folder", children: ["root", "about", "resume", "projects", "contacts", "bin"] },
  {
    id: "c",
    name: "Local Disk (C:)",
    icon: "drive-c",
    kind: "folder",
    type: "drive",
    drive: { letter: "C", total: 476, free: 213.4 },
    children: ["projects", "pets", "tools", "contacts", "documents", "program-files"],
  },
  {
    id: "d",
    name: "Fun (D:)",
    icon: "drive-d",
    kind: "folder",
    type: "drive",
    drive: { letter: "D", total: 931, free: 512.7 },
    children: ["games", "paint", "crash"],
  },
  { id: "projects", name: "Projects", icon: "folder-projects", kind: "folder", children: PortfolioData.map((p) => `project-${p.id}`) },
  { id: "pets", name: "Pet Projects", icon: "folder-pets", kind: "folder", children: PetProjects.map((p) => `pet-${p.id}`) },
  { id: "tools", name: "My Tools", icon: "folder-tools", kind: "folder", children: Tools.map((t) => `tool-${t.id}`) },
  { id: "contacts", name: "Contacts", icon: "folder-contacts", kind: "folder", children: ["github", "linkedin", "telegram", "whatsapp", "gmail"] },
  { id: "documents", name: "Documents", icon: "folder-docs", kind: "folder", children: ["resume", "readme"] },
  { id: "program-files", name: "Program Files", icon: "folder", kind: "folder", children: ["browser", "calculator", "cmd", "settings"] },
  { id: "games", name: "Games", icon: "folder-games", kind: "folder", children: ["solitaire", ...GAMES.map((g) => `game-${g.id}`)] },
  { id: "bin", name: "Recycle Bin", icon: "bin", kind: "folder", children: [] },

  { id: "about", name: "About Me", icon: "profile", kind: "app", app: "profile", type: "app" },
  { id: "browser", name: "Google Chrome", icon: "browser", kind: "app", app: "browser", type: "app", keywords: ["chrome"] },
  { id: "settings", name: "Settings", icon: "settings", kind: "app", app: "settings", type: "app", keywords: ["control", "ms-settings:"] },
  { id: "calculator", name: "Calculator", icon: "calculator", kind: "app", app: "calculator", type: "app", keywords: ["calc", "calc.exe"] },
  { id: "paint", name: "Paint", icon: "paint", kind: "app", app: "paint", type: "app", keywords: ["mspaint", "mspaint.exe"] },
  { id: "solitaire", name: "Solitaire", icon: "solitaire", kind: "app", app: "solitaire", type: "game", keywords: ["sol", "sol.exe"] },
  { id: "cmd", name: "Command Prompt", icon: "terminal", kind: "app", app: "terminal", type: "app", keywords: ["cmd", "cmd.exe", "terminal", "wt", "powershell", "терминал"] },
  { id: "run", name: "Run", icon: "run", kind: "app", app: "run", type: "app", keywords: ["run", "win+r"] },
  { id: "crash", name: "DO_NOT_OPEN.exe", icon: "exe", kind: "link", url: "/bsod", navigate: true, type: "app" },
  { id: "resume", name: "Resume.pdf", icon: "pdf", kind: "file", app: "pdf", type: "pdf" },
  { id: "readme", name: "readme.txt", icon: "notepad", kind: "file", app: "notepad", type: "txt", keywords: ["notepad", "notepad.exe"] },

  { id: "github", name: "GitHub", icon: "github", kind: "link", url: CONTACTS.github, external: true, type: "shortcut" },
  { id: "linkedin", name: "LinkedIn", icon: "linkedin", kind: "link", url: CONTACTS.linkedin, external: true, type: "shortcut" },
  { id: "telegram", name: "Telegram", icon: "telegram", kind: "link", url: CONTACTS.telegram, external: true, type: "shortcut" },
  { id: "whatsapp", name: "WhatsApp", icon: "whatsapp", kind: "link", url: CONTACTS.whatsapp, external: true, type: "shortcut" },
  { id: "gmail", name: "Gmail", icon: "mail", kind: "link", url: `mailto:${CONTACTS.email}`, external: true, type: "shortcut" },

  ...PortfolioData.map<FsNode>((p) => ({
    id: `project-${p.id}`,
    name: p.title,
    icon: "browser",
    thumb: p.img,
    kind: "link",
    url: p.link,
    project: p,
  })),
  ...PetProjects.map<FsNode>((p) => ({
    id: `pet-${p.id}`,
    name: p.title,
    icon: "browser",
    thumb: p.img,
    kind: "link",
    url: p.link,
    project: p,
  })),
  ...Tools.map<FsNode>((t) => ({
    id: `tool-${t.id}`,
    name: t.title,
    icon: "browser",
    thumb: t.img,
    kind: "link",
    url: `https://www.google.com/search?igu=1&q=${encodeURIComponent(t.title)}`,
    type: "skill",
  })),
  ...GAMES.map<FsNode>((g) => ({
    id: `game-${g.id}`,
    name: g.title,
    icon: "folder-games",
    thumb: g.icon,
    kind: "link",
    url: g.url,
    external: g.external,
    type: "game",
  })),
];

export const FS: Record<string, FsNode> = Object.fromEntries(nodes.map((n) => [n.id, n]));

/** Explorer navigation pane: Quick access, then This PC with its drives */
export const SIDEBAR = { quick: ["desktop", "documents", "projects", "contacts"], drives: ["c", "d"] };
