import { normalizePath, TFile } from "obsidian";
import { Loader } from "vega";
import ObsidianVegaPlugin from "./main";

const httpRegex = /^https?:\/\//;
const fileRegex = /^file:\/\//

export default class VegaLoader implements Loader {
    plugin: ObsidianVegaPlugin;

    constructor(plugin: ObsidianVegaPlugin) {
        this.plugin = plugin;
    }

    async load(uri: string, _?: any): Promise<string> {
        const result = await this.sanitize(uri);

        return result.isHttp ?
                this.http(result.href) :
                this.file(result.href);
    }
    
    async sanitize(uri: string, _?: any): Promise<{ href: string, isHttp: boolean }> {
        const isHttp = httpRegex.test(uri);

        if (isHttp) {
            return { href: uri, isHttp: isHttp };
        }

        const isFileScheme = fileRegex.test(uri);

        if (isFileScheme) {
            throw Error('File URI scheme is not supported');
        }

        return { href: normalizePath(uri), isHttp: isHttp };
    }

    async http(uri: string, _?: any): Promise<string> {
        const response = await fetch(uri);

        if (response.ok) {
            return response.text();
        }

        throw Error(`Error ${response.status}: ${response.statusText}`);
    }

    async file(filename: string, _?: any): Promise<string> {
        const vault = this.plugin.app.vault;
        const file = vault.getAbstractFileByPath(filename);

        if (file instanceof TFile) {
            const result = await vault.cachedRead(file);
            return result;
        }

        throw Error(`URL "${filename}" is not a file or does not exist`);
    }
}