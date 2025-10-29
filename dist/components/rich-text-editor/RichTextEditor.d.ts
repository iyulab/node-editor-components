import { LitElement } from 'lit';
export declare class RichTextEditor extends LitElement {
    static styles: import('lit').CSSResult[];
    private container;
    private quill;
    private observer;
    /** Specifies whether the header should be displayed or not. @default false */
    noHeader: boolean;
    /** The label text displayed in the header of the rich text editor. @default "Rich Text Editor" */
    label: string;
    /** The visual theme of the editor. Can be "light" or "dark". @default "light" */
    theme: "light" | "dark";
    /** Whether the editor should be in read-only mode, preventing user input. @default false */
    readOnly: boolean;
    /** The placeholder text shown when the editor is empty. @default "Start writing..." */
    placeholder: string;
    /** The current HTML content of the rich text editor. @default "" */
    value: string;
    /** The height of the editor in pixels. @default 300 */
    height: number;
    /** Custom toolbar configuration. If not provided, uses default toolbar. */
    toolbar?: string[][];
    connectedCallback(): void;
    disconnectedCallback(): void;
    firstUpdated(changedProperties: any): Promise<void>;
    updated(changedProperties: any): Promise<void>;
    private updateEditorHeight;
    /**
     * Get the current content as HTML
     */
    getHTML(): string;
    /**
     * Get the current content as plain text
     */
    getText(): string;
    /**
     * Get the current content as Quill Delta
     */
    getDelta(): any;
    /**
     * Set content from HTML
     */
    setHTML(html: string): void;
    /**
     * Set content from Quill Delta
     */
    setDelta(delta: any): void;
    /**
     * Clear all content
     */
    clear(): void;
    /**
     * Focus the editor
     */
    focus(): void;
    render(): import('lit-html').TemplateResult<1>;
    private renderHeader;
    private handleCopy;
}
