import { App, Modal, Setting, TextAreaComponent } from "obsidian";
import { t, type PulseLocale } from "../i18n";

export class UpdateInfoModal extends Modal {
  private locale: PulseLocale;
  private noteTitle: string;
  private notePath: string;
  private onSubmit: (prompt: string) => void;
  private input = "";

  constructor(
    app: App,
    opts: {
      locale: PulseLocale;
      noteTitle: string;
      notePath: string;
      onSubmit: (prompt: string) => void;
    }
  ) {
    super(app);
    this.locale = opts.locale;
    this.noteTitle = opts.noteTitle;
    this.notePath = opts.notePath;
    this.onSubmit = opts.onSubmit;
  }

  onOpen(): void {
    const { contentEl } = this;
    const L = this.locale;
    contentEl.empty();
    contentEl.addClass("pulse-update-modal");

    contentEl.createEl("h2", { text: t(L, "updateInfoTitle") });
    contentEl.createEl("p", {
      cls: "pulse-muted",
      text: t(L, "updateInfoNote", { title: this.noteTitle }),
    });
    contentEl.createEl("p", {
      cls: "pulse-path",
      text: this.notePath,
    });
    contentEl.createEl("p", {
      cls: "pulse-muted",
      text: t(L, "updateInfoHint"),
    });

    let area: TextAreaComponent | null = null;
    new Setting(contentEl)
      .setName(t(L, "updateInfoPrompt"))
      .setDesc(t(L, "updateInfoPromptDesc"))
      .addTextArea((ta) => {
        area = ta;
        ta.setPlaceholder(t(L, "updateInfoPlaceholder"));
        ta.inputEl.rows = 6;
        ta.inputEl.style.width = "100%";
        ta.onChange((v) => {
          this.input = v;
        });
      });

    new Setting(contentEl)
      .addButton((b) =>
        b.setButtonText(t(L, "cancel")).onClick(() => this.close())
      )
      .addButton((b) =>
        b
          .setButtonText(t(L, "updateInfoRun"))
          .setCta()
          .onClick(() => {
            const text = this.input.trim() || area?.getValue().trim() || "";
            if (!text) {
              return;
            }
            this.close();
            this.onSubmit(text);
          })
      );
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
