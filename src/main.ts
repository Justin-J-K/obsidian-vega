import { MarkdownPostProcessorContext, Plugin } from 'obsidian';
import * as vegaLite from 'vega-lite';
import * as vega from 'vega';
import VegaLoader from './vegaLoader';
import { CompileOptions } from 'vega-lite/build/src/compile/compile';

const cssTextNormal = 'var(--text-normal)';
const cssBackgroundModifierBorder = 'var(--background-modifier-border)';

const compileOptions: CompileOptions = {
    config: {
        background: undefined,
        view: {
            stroke: cssBackgroundModifierBorder
        }
    }
};

export default class VegaVisualizationsPlugin extends Plugin {
    private loaderInstance = new VegaLoader(this);

    public async onload() {
        this.registerMarkdownCodeBlockProcessor('vega', this.vegaCodeBlockProcessor(false));
        this.registerMarkdownCodeBlockProcessor('vega-lite', this.vegaCodeBlockProcessor(true));
    }

    private vegaCodeBlockProcessor(isLite: boolean) {
        return async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
            try {
                const sourceAsJson = JSON.parse(source);
                const spec = isLite ?
                        vegaLite.compile(sourceAsJson, compileOptions).spec :
                        sourceAsJson;
                
                const font = getComputedStyle(document.body).getPropertyValue('--font-text');
                const parseConfig = this.getParseConfig(font);
                const runtime = vega.parse(spec, parseConfig);
    
                const view = new vega.View(runtime, {
                    renderer: 'svg',
                    loader: this.loaderInstance,
                    logLevel: vega.Warn
                });
    
                const vegaWrapper = createDiv();
                view.initialize(vegaWrapper);

                await view.runAsync();

                el.appendChild(vegaWrapper);
                
            } catch(e) {
                const errorText = `Error parsing Vega${isLite ? '-Lite' : ''} diagram!\n\n${e.message}`;
                el.createEl('pre').createEl('code', { 
                    cls: `language-vega${isLite ? '-lite' : ''}`,
                    text: errorText
                });
                console.error(e);
            }
        };
    }

    private getParseConfig(font: string): vega.Config {
        return {
            background: null,
            group: {
                stroke: null
            },
            style: {
                'guide-label': {
                    fill: cssTextNormal
                },
                'guide-title': {
                    fill: cssTextNormal
                }
            },
            axis: {
                labelFont: font,
                titleFont: font,
                domainColor: cssTextNormal,
                gridColor: cssBackgroundModifierBorder,
                tickColor: cssTextNormal
            },
            legend: {
                labelFont: font,
                titleFont: font
            },
            title: {
                font: font,
                subtitleFont: font,
                color: cssTextNormal,
                subtitleColor: cssTextNormal
            },
            text: {
                font: font,
                fill: cssTextNormal
            }
        }
    }
}
