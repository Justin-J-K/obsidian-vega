import { normalizePath, TFile } from "obsidian";
import { Loader } from "vega";
import VegaVisualizationsPlugin from "./main";

export default class VegaLoader implements Loader {
    private plugin: VegaVisualizationsPlugin;

    constructor(plugin: VegaVisualizationsPlugin) {
        this.plugin = plugin;
    }

    public async load(uri: string, _?: any): Promise<string> {
        const result = await this.sanitize(uri);

        return result.isHttp ?
                this.http(result.href) :
                this.file(result.href);
    }
    
    public async sanitize(uri: string, _?: any): Promise<{ href: string, isHttp: boolean }> {
        const schemeRegex = /^([a-z.+\-])(?::\/\/)/i;
        const schemeMatch = uri.match(schemeRegex);

        if (schemeMatch) {
            const scheme = schemeMatch[1].toLowerCase();
            const httpRegex = /^https?/;

            if (!httpRegex.test(scheme)) {
                throw Error(`URI scheme '${scheme[1].toLowerCase()}' is not supported`);
            }
            
            return { href: uri, isHttp: true };
        }

        return { href: normalizePath(uri), isHttp: false };
    }

    public async http(uri: string, _?: any): Promise<string> {
        const response = await fetch(uri);

        if (response.ok) {
            return response.text();
        }

        throw Error(`Error ${response.status}: ${response.statusText}`);
    }

    public async file(filename: string, _?: any): Promise<string> {
        const vault = this.plugin.app.vault;
        const file = vault.getAbstractFileByPath(filename);

        if (file instanceof TFile) {
            const result = await vault.cachedRead(file);
            return result;
        }

        throw Error(`URL "${filename}" is not a file or does not exist`);
    }
}