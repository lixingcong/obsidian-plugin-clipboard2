import {App, PluginSettingTab, Setting} from "obsidian";
import ClipboardReplacePlugin from "./main";

export enum ReplaceMode {
	None = 'none',
	Simple = 'simple',
	Regex = 'regex',
	Custom = 'custom'
}

export interface NormalReplaceParam {
	from: string,
	to: string
}

export interface CustomReplaceParam {
	code: string
}

export interface ClipboardReplaceSettings {
	replaceMode: ReplaceMode,
	normalReplaceParam: NormalReplaceParam,
	customReplaceParam: CustomReplaceParam
}

export const DEFAULT_SETTINGS: ClipboardReplaceSettings = {
	replaceMode: ReplaceMode.None,
	normalReplaceParam: {
		from: '',
		to: ''
	},
	customReplaceParam: {
		code: '(srcText) => {\n  const newText = srcText + \'aaa\';\n  return newText;\n}'
	}
}

export class ClipboardReplaceSettingTab extends PluginSettingTab {
	plugin: ClipboardReplacePlugin;

	constructor(app: App, plugin: ClipboardReplacePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Mode')
			.addDropdown(dropDown => {
				dropDown
					.addOption(ReplaceMode.None, 'None')
					.addOption(ReplaceMode.Simple, 'Simple replace')
					.addOption(ReplaceMode.Regex, 'Regex replace')
					.addOption(ReplaceMode.Custom, 'Custom script')
					.setValue(this.plugin.settings!.replaceMode)
					.onChange(async (value) => {
						this.plugin.settings!.replaceMode = value as ReplaceMode;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Simple/regex search for')
			.addText(text => {
				text
					.setValue(this.plugin.settings!.normalReplaceParam.from)
					.onChange(async (value) => {
						this.plugin.settings!.normalReplaceParam.from = value;
						await this.plugin.saveSettings();
					})
					.then(cb => {
						cb.inputEl.classList.add('full-width')
					});
			});

		new Setting(containerEl)
			.setName('Simple/regex repalce to')
			.addText(text => {
				text
					.setValue(this.plugin.settings!.normalReplaceParam.to)
					.onChange(async (value) => {
						this.plugin.settings!.normalReplaceParam.to = value;
						await this.plugin.saveSettings();
					})
					.then(cb => {
						cb.inputEl.classList.add('full-width')
					});
			});

		new Setting(containerEl)
			.setName('Custom js')
			.setDesc('Make sure your code is correct')
			.addTextArea(text => {
				text
					.setValue(this.plugin.settings!.customReplaceParam.code)
					.onChange(async (value) => {
						this.plugin.settings!.customReplaceParam.code = value;
						await this.plugin.saveSettings();
					})
					.then(cb => {
						cb.inputEl.classList.add('full-width')
						cb.inputEl.rows = 10;
					});
			});
	}
}
