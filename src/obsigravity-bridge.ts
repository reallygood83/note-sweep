import { App, Notice, TFile } from "obsidian";
import { t, type PulseLocale } from "./i18n";

const OBSIGRAVITY_ID = "obsigravity";
const BRAT_URL = "https://github.com/TfTHacker/obsidian42-brat";
const OBSIGRAVITY_REPO = "https://github.com/reallygood83/obsigravity";

interface ObsigravityPluginLike {
  activateView?: () => Promise<void>;
  pinNote?: (path: string) => Promise<void>;
  lastActiveMarkdownFile?: TFile | null;
}

function getObsigravity(app: App): ObsigravityPluginLike | null {
  const plugins = (
    app as unknown as {
      plugins?: {
        getPlugin?: (id: string) => unknown;
        plugins?: Record<string, unknown>;
      };
    }
  ).plugins;
  if (!plugins) return null;
  const p =
    (plugins.getPlugin?.(OBSIGRAVITY_ID) as ObsigravityPluginLike | null) ||
    (plugins.plugins?.[OBSIGRAVITY_ID] as ObsigravityPluginLike | undefined) ||
    null;
  return p ?? null;
}

export function showObsigravityInstallGuide(locale: PulseLocale): void {
  new Notice(t(locale, "obsigravityMissing"), 12000);
  console.info(
    `[Note Sweep] Install Obsigravity via BRAT:\n1) Install BRAT: ${BRAT_URL}\n2) Add plugin: reallygood83/obsigravity\n3) Repo: ${OBSIGRAVITY_REPO}`
  );
}

/**
 * Simple handoff: open the queue note as active, then open Obsigravity.
 * User types the request in Obsigravity chat (no Pulse prompt modal).
 */
export async function openNoteInObsigravity(
  app: App,
  locale: PulseLocale,
  notePath: string
): Promise<void> {
  const file = app.vault.getAbstractFileByPath(notePath);
  if (!(file instanceof TFile)) {
    new Notice(t(locale, "deleteFailed"));
    return;
  }

  // 1) Open exact note in editor (active)
  await app.workspace.getLeaf(false).openFile(file, { active: true });

  const og = getObsigravity(app);
  if (!og) {
    showObsigravityInstallGuide(locale);
    return;
  }

  // 2) Best-effort pin so Obsigravity context chips show this note
  try {
    if (typeof og.pinNote === "function") {
      await og.pinNote(notePath.replace(/\\/g, "/"));
    }
  } catch (e) {
    console.warn("[Note Sweep] pinNote failed", e);
  }

  // 3) Open Obsigravity sidebar
  try {
    if (typeof og.activateView === "function") {
      await og.activateView();
    } else {
      // @ts-expect-error command API
      await app.commands.executeCommandById("obsigravity:open-obsigravity");
    }
    new Notice(t(locale, "obsigravityOpened"), 6000);
  } catch (e) {
    console.error("[Note Sweep] open Obsigravity failed", e);
    new Notice(t(locale, "obsigravityUpdateFailed"), 8000);
  }
}
