import { LitElement } from 'lit';
/**
 * code editor component used by monaco-editor
 */
export declare class CodeEditor extends LitElement {
    static styles: import('lit').CSSResult[];
    private container;
    private editor;
    private observer;
    /** Specifies whether the header should be displayed or not. @default false */
    noHeader: boolean;
    /** The label text displayed in the header of the code editor. @default "Editor" */
    label: string;
    /** The visual theme of the code editor. Can be "light" or "dark". @default "light" */
    theme: "light" | "dark";
    /** Whether the editor should be in read-only mode, preventing user input. @default false */
    readOnly: boolean;
    /** The programming language for syntax highlighting (e.g., "json", "javascript", "typescript"). @default "json" */
    language: string;
    /** The font size in pixels for the text in the editor. @default 14 */
    fontSize: number;
    /** The current text content of the code editor. @default "" */
    value: string;
    connectedCallback(): void;
    disconnectedCallback(): void;
    firstUpdated(changedProperties: any): Promise<void>;
    updated(changedProperties: any): Promise<void>;
    render(): import('lit-html').TemplateResult<1>;
    private renderHeader;
}
