import { MarkdownPostProcessorContext, Plugin } from 'obsidian';
import * as vegaLite from 'vega-lite';
import * as vega from 'vega';

export default class ObsidianVega extends Plugin {
	vegaCodeBlockProcessor = async (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
		const spec = JSON.parse(source);
		this.renderVegaSpec(spec, el);
	}

	vegaLiteCodeBlockProcessor = async (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
		const spec = vegaLite.compile(JSON.parse(source)).spec;
		this.renderVegaSpec(spec, el);
	}

	async onload() {
		this.registerMarkdownCodeBlockProcessor('vega', this.vegaCodeBlockProcessor);
		this.registerMarkdownCodeBlockProcessor('vega-lite', this.vegaLiteCodeBlockProcessor);
	}

	async renderVegaSpec(spec: vega.Spec, el: HTMLElement) {
		const runtime = vega.parse(spec);
		const view = new vega.View(runtime, { renderer: 'svg' });
		await view.initialize(el).runAsync();
	}
}
