"use client";

import { FS, type FsNode } from "@/data/desktop";
import { useWM } from "./WindowManager";
import { useFs } from "./fs";
import { useFsLabels } from "./i18n";

/** Windows shell folders that Win+R understands */
const SHELL_FOLDERS: Record<string, string> = {
  "shell:recyclebinfolder": "bin",
  "shell:desktop": "desktop",
  "shell:mycomputerfolder": "root",
  "shell:personal": "documents",
  "shell:programfiles": "program-files",
};

/** Settings pages behind the classic Control Panel names */
const SETTINGS_ALIASES: Record<string, string> = {
  winver: "about",
  "ncpa.cpl": "network",
  "desk.cpl": "system",
  "timedate.cpl": "time",
  "ms-settings:about": "about",
  "ms-settings:network": "network",
  "ms-settings:personalization": "personalization",
};

const looksLikeUrl = (q: string) => /^https?:\/\//.test(q) || /^www\./.test(q) || /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}(\/\S*)?$/.test(q);

/**
 * Resolves what a visitor typed into Run (or `start` in cmd) and opens it.
 * Returns false when nothing matches, so the caller can show "Windows cannot find…".
 */
export function useLauncher() {
  const { open, openNode } = useWM();
  const fsState = useFs();
  const labels = useFsLabels();

  const find = (q: string): FsNode | undefined => {
    const all = [...Object.values(FS), ...Object.values(fsState.created)];
    const bare = (s: string) => s.toLowerCase().replace(/\.(exe|lnk|url)$/, "");
    return all.find(
      (n) => n.keywords?.includes(q) || labels.name(n).toLowerCase() === q || n.name.toLowerCase() === q || bare(labels.name(n)) === bare(q),
    );
  };

  /** `urls: false` for cmd, where "google.com" is not a command */
  return (raw: string, { urls = true }: { urls?: boolean } = {}): boolean => {
    const q = raw.trim().toLowerCase();
    if (!q) return false;

    const drive = /^([a-z]):\\?$/.exec(q);
    if (drive) {
      if (!FS[drive[1]]) return false;
      open("explorer", { folder: drive[1] });
      return true;
    }
    if (q === "." || q === "explorer" || q === "explorer.exe" || q === "\\") {
      open("explorer", { folder: "root" });
      return true;
    }
    if (SHELL_FOLDERS[q]) {
      open("explorer", { folder: SHELL_FOLDERS[q] });
      return true;
    }
    if (SETTINGS_ALIASES[q]) {
      open("settings", { section: SETTINGS_ALIASES[q] });
      return true;
    }

    const node = find(q);
    if (node) {
      if (node.kind === "folder") open("explorer", { folder: node.id });
      else openNode(node);
      return true;
    }

    if (urls && looksLikeUrl(q)) {
      open("browser", { url: /^https?:\/\//.test(q) ? raw.trim() : `https://${raw.trim()}` });
      return true;
    }
    return false;
  };
}
