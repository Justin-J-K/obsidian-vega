import { MarkdownPostProcessorContext, Plugin } from 'obsidian';
import * as vegaLite from 'vega-lite';
import * as vega from 'vega';
import VegaLoader from './vegaLoader';

export default class ObsidianVegaPlugin extends Plugin {
    loaderInstance = new VegaLoader(this);

    vegaCodeBlockProcessor = (isLite: boolean) => { return async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        try {
            const spec = isLite ?
                    vegaLite.compile(JSON.parse(source)).spec :
                    JSON.parse(source);
            const runtime = vega.parse(spec);
            const view = new vega.View(runtime, {
                renderer: 'svg',
                loader: this.loaderInstance,
                logLevel: vega.Warn
            });

            view.initialize(el);

            await view.runAsync();
        } catch(e) {
            const errorText = `Error parsing Vega${isLite ? '-Lite' : ''} diagram!\n\n${e.message}`;
            el.createEl('pre').createEl('code', { 
                cls: `language-vega-${isLite ? '-lite' : ''}`,
                text: errorText
            });
            console.error(e);
        }
    }};

    async onload() {
        this.registerMarkdownCodeBlockProcessor('vega', this.vegaCodeBlockProcessor(false));
        this.registerMarkdownCodeBlockProcessor('vega-lite', this.vegaCodeBlockProcessor(true));
    }
}
