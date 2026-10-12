import { PortfolioData, PetProjects, type Project } from "./PorfolioData";
import { Tools } from "./Tools";

export type AppId = "explorer" | "browser" | "profile" | "notepad" | "pdf" | "settings" | "calculator" | "paint" | "solitaire";

export type IconKey =
  | "folder"
  | "folder-projects"
  | "folder-pets"
  | "folder-tools"
  | "folder-contacts"
  | "folder-docs"
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

export type TypeKey = "app" | "pdf" | "txt" | "shortcut" | "skill";

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

const nodes: FsNode[] = [
  { id: "root", name: "This PC", icon: "pc", kind: "folder", children: ["desktop", "projects", "pets", "tools", "contacts", "documents", "bin"] },
  {
    id: "desktop",
    name: "Desktop",
    icon: "folder",
    kind: "folder",
    children: ["about", "projects", "pets", "browser", "resume", "readme", "tools", "contacts", "github", "bin"],
  },
  { id: "projects", name: "Projects", icon: "folder-projects", kind: "folder", children: PortfolioData.map((p) => `project-${p.id}`) },
  { id: "pets", name: "Pet Projects", icon: "folder-pets", kind: "folder", children: PetProjects.map((p) => `pet-${p.id}`) },
  { id: "tools", name: "My Tools", icon: "folder-tools", kind: "folder", children: Tools.map((t) => `tool-${t.id}`) },
  { id: "contacts", name: "Contacts", icon: "folder-contacts", kind: "folder", children: ["github", "linkedin", "telegram", "whatsapp", "gmail"] },
  { id: "documents", name: "Documents", icon: "folder-docs", kind: "folder", children: ["resume", "readme"] },
  { id: "bin", name: "Recycle Bin", icon: "bin", kind: "folder", children: [] },

  { id: "about", name: "About Me", icon: "profile", kind: "app", app: "profile", type: "app" },
  { id: "browser", name: "Google Chrome", icon: "browser", kind: "app", app: "browser", type: "app" },
  { id: "settings", name: "Settings", icon: "settings", kind: "app", app: "settings", type: "app" },
  { id: "calculator", name: "Calculator", icon: "calculator", kind: "app", app: "calculator", type: "app" },
  { id: "paint", name: "Paint", icon: "paint", kind: "app", app: "paint", type: "app" },
  { id: "solitaire", name: "Solitaire", icon: "solitaire", kind: "app", app: "solitaire", type: "app" },
  { id: "resume", name: "Resume.pdf", icon: "pdf", kind: "file", app: "pdf", type: "pdf" },
  { id: "readme", name: "readme.txt", icon: "notepad", kind: "file", app: "notepad", type: "txt" },

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
];

export const FS: Record<string, FsNode> = Object.fromEntries(nodes.map((n) => [n.id, n]));

export const SIDEBAR = ["desktop", "projects", "pets", "tools", "contacts", "documents", "root"];
