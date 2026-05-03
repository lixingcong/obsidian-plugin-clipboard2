import {App, Editor, MarkdownFileInfo, MarkdownView, Modal, Notice, Plugin} from 'obsidian';
import {DEFAULT_SETTINGS, ClipboardReplaceSettings, ClipboardReplaceSettingTab, ReplaceMode} from "./settings";

// Remember to rename these classes and interfaces!

type CustomJsHook = (srcText: string) => string;

export default class ClipboardReplacePlugin extends Plugin {
	settings: ClipboardReplaceSettings | undefined;

	async onload() {
		await this.loadSettings();

		let noticeText = 'Lxc clipboard reaplce';
		if (ReplaceMode.None == this.settings!.replaceMode)
			noticeText += ': Please setup first';

		new Notice(noticeText);

		// Ensure a function retains its context (the this value)
		// when it is passed as a reference or called in a different scope.
		const boundedPaste = this.paste.bind(this);

		this.addCommand({
			id: 'paste',
			name: 'Paste',
			editorCallback: boundedPaste
		});

		this.addRibbonIcon('presentation', 'Lxc clipboard paste', async () => {
			const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if(markdownView)
				await this.paste(markdownView.editor, markdownView);
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new ClipboardReplaceSettingTab(this.app, this));
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<ClipboardReplaceSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async paste(editor: Editor, ctx: MarkdownView | MarkdownFileInfo) {
		switch(this.settings!.replaceMode){
			case ReplaceMode.Simple:
			case ReplaceMode.Regex: {
				const isRegex = ReplaceMode.Regex == this.settings!.replaceMode;
				await navigator.clipboard.readText().then(clipboard => {
					if(this.settings!.normalReplaceParam.from.length == 0 || clipboard.length == 0){
						new Notice('Paste failed, either the clipboard or search for text is empty');
						return;
					}

					const reFrom = isRegex ? new RegExp(this.settings!.normalReplaceParam.from) : this.settings!.normalReplaceParam.from;
					const reTo = this.settings!.normalReplaceParam.to;
					const newText = clipboard.replace(reFrom, reTo);
					editor.replaceSelection(newText);
				});
				break;
			}

			case ReplaceMode.Custom:{
				// eslint-disable-next-line no-eval
				const f = eval(this.settings!.customReplaceParam.code) as CustomJsHook;
				if(undefined != f){
					await navigator.clipboard.readText().then(clipboard => {
						if(clipboard.length == 0){
							new Notice('Paste failed, the clipboard is empty');
							return;
						}

						const newText = f(clipboard);
						if(typeof newText === 'string')
							editor.replaceSelection(newText);
						else {
							// eslint-disable-next-line obsidianmd/ui/sentence-case
							new Notice('Please return string in your javascript code');
						}
					});
				}else{
					// eslint-disable-next-line obsidianmd/ui/sentence-case
					new Notice('Please check your syntax of javascript code');
				}
				break;
			}

			default:
				new Notice('Paste failed, please setup first!');
				break;
		}
	}
}
