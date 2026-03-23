export class HtmlRenderer {
    buffer;
    constructor() {
        this.buffer = [];
    }
    escape(text) {
        if (text === null || text === undefined)
            return "";
        let s = String(text);
        s = s.replace(/&/g, "&amp;");
        s = s.replace(/</g, "&lt;");
        s = s.replace(/>/g, "&gt;");
        s = s.replace(/"/g, "&quot;");
        s = s.replace(/'/g, "&#x27;");
        return s;
    }
    render(irJSON) {
        this.buffer = [];
        this._renderNode(irJSON, false);
        return this.buffer.join("");
    }
    _renderNode(node, tight = false) {
        if (!node)
            return;
        const nodeType = node.type;
        const children = node.children || [];
        if (nodeType === "document") {
            for (const child of children) {
                this._renderNode(child);
            }
        }
        else if (nodeType === "heading") {
            const level = node.level || 1;
            const customId = node.custom_id;
            const idAttr = customId ? ` id="${this.escape(customId)}"` : "";
            this.buffer.push(`<h${level}${idAttr}>`);
            for (const child of children) {
                this._renderNode(child);
            }
            this.buffer.push(`</h${level}>\n`);
        }
        else if (nodeType === "paragraph") {
            if (tight) {
                for (const child of children) {
                    this._renderNode(child);
                }
            }
            else {
                this.buffer.push("<p>");
                for (const child of children) {
                    this._renderNode(child);
                }
                this.buffer.push("</p>\n");
            }
        }
        else if (nodeType === "block_quote") {
            this.buffer.push("<blockquote>\n");
            for (const child of children) {
                this._renderNode(child);
            }
            this.buffer.push("</blockquote>\n");
        }
        else if (nodeType === "text") {
            this.buffer.push(this.escape(node.literal || ""));
        }
        else if (nodeType === "strong") {
            this.buffer.push("<strong>");
            for (const child of children) {
                this._renderNode(child);
            }
            this.buffer.push("</strong>");
        }
        else if (nodeType === "emph") {
            this.buffer.push("<em>");
            for (const child of children) {
                this._renderNode(child);
            }
            this.buffer.push("</em>");
        }
        else if (nodeType === "code_block") {
            const info = node.info || "";
            const classAttr = info ? ` class="language-${this.escape(info)}"` : "";
            this.buffer.push(`<pre><code${classAttr}>\n`);
            this.buffer.push(this.escape(node.literal || ""));
            this.buffer.push("</code></pre>\n");
        }
        else if (nodeType === "code") {
            this.buffer.push("<code>");
            this.buffer.push(this.escape(node.literal || ""));
            this.buffer.push("</code>");
        }
        else if (nodeType === "link") {
            let dest = this.escape(node.destination || "");
            if (dest.startsWith("javascript:")) {
                dest = "";
            }
            this.buffer.push(`<a href="${dest}">`);
            for (const child of children) {
                this._renderNode(child);
            }
            this.buffer.push("</a>");
        }
        else if (nodeType === "list") {
            const tag = node.list_type === "bullet" ? "ul" : "ol";
            this.buffer.push(`<${tag}>\n`);
            for (const child of children) {
                this._renderNode(child);
            }
            this.buffer.push(`</${tag}>\n`);
        }
        else if (nodeType === "item") {
            this.buffer.push("<li>");
            for (const child of children) {
                this._renderNode(child, true);
            }
            this.buffer.push("</li>\n");
        }
        else if (nodeType === "mark") {
            this.buffer.push("<mark>");
            for (const child of children) {
                this._renderNode(child);
            }
            this.buffer.push("</mark>");
        }
        else if (nodeType === "u") {
            this.buffer.push("<u>");
            for (const child of children) {
                this._renderNode(child);
            }
            this.buffer.push("</u>");
        }
        else if (nodeType === "del") {
            this.buffer.push("<del>");
            for (const child of children) {
                this._renderNode(child);
            }
            this.buffer.push("</del>");
        }
        else if (nodeType === "table") {
            this.buffer.push("<table border=\"1\">\n");
            for (const child of children) {
                this._renderNode(child);
            }
            this.buffer.push("</table>\n");
        }
        else if (nodeType === "table_row") {
            this.buffer.push("<tr>\n");
            for (const child of children) {
                this._renderNode(child);
            }
            this.buffer.push("</tr>\n");
        }
        else if (nodeType === "table_header") {
            this.buffer.push("<th>");
            for (const child of children) {
                this._renderNode(child, true);
            }
            this.buffer.push("</th>\n");
        }
        else if (nodeType === "table_cell") {
            this.buffer.push("<td>");
            for (const child of children) {
                this._renderNode(child, true);
            }
            this.buffer.push("</td>\n");
        }
        else if (nodeType === "math_block") {
            this.buffer.push("<div class=\"math math-display\">\n");
            this.buffer.push(this.escape(node.literal || ""));
            this.buffer.push("</div>\n");
        }
        else if (nodeType === "mermaid_block") {
            this.buffer.push("<div class=\"mermaid\">\n");
            this.buffer.push(this.escape(node.literal || ""));
            this.buffer.push("</div>\n");
        }
        else if (nodeType === "footnote_def") {
            const label = this.escape(node.label || "");
            this.buffer.push(`<div class="footnote" id="fn:${label}">\n`);
            if (children.length > 0 && children[0].type === "paragraph") {
                this.buffer.push("<p>");
                this.buffer.push(`<strong>[${label}]:</strong> `);
                for (const inlineChild of (children[0].children || [])) {
                    this._renderNode(inlineChild);
                }
                this.buffer.push("</p>\n");
                for (let i = 1; i < children.length; i++) {
                    this._renderNode(children[i]);
                }
            }
            else {
                this.buffer.push(`<strong>[${label}]:</strong> `);
                for (const child of children) {
                    this._renderNode(child);
                }
            }
            this.buffer.push("</div>\n");
        }
        else if (nodeType === "def_list") {
            this.buffer.push("<dl>\n");
            for (const child of children) {
                this._renderNode(child);
            }
            this.buffer.push("</dl>\n");
        }
        else if (nodeType === "def_term") {
            this.buffer.push("<dt>");
            for (const child of children) {
                this._renderNode(child);
            }
            this.buffer.push("</dt>\n");
        }
        else if (nodeType === "def_item") {
            this.buffer.push("<dd>");
            for (const child of children) {
                this._renderNode(child);
            }
            this.buffer.push("</dd>\n");
        }
        else if (nodeType === "sub") {
            this.buffer.push("<sub>");
            for (const child of children) {
                this._renderNode(child);
            }
            this.buffer.push("</sub>");
        }
        else if (nodeType === "sup") {
            this.buffer.push("<sup>");
            for (const child of children) {
                this._renderNode(child);
            }
            this.buffer.push("</sup>");
        }
        else if (nodeType === "math_inline") {
            this.buffer.push("<span class=\"math math-inline\">");
            this.buffer.push(this.escape(node.literal || ""));
            this.buffer.push("</span>");
        }
        else if (nodeType === "footnote_ref") {
            const label = this.escape(node.label || "");
            this.buffer.push(`<sup><a href="#fn:${label}">^${label}</a></sup>`);
        }
        else if (nodeType === "emoji") {
            this.buffer.push(this.escape(node.literal || ""));
        }
        else if (nodeType === "task_checkbox") {
            const checked = node.checked ? " checked" : "";
            this.buffer.push(`<input type="checkbox" disabled${checked}>`);
        }
        else if (nodeType === "hardbreak") {
            this.buffer.push("<br />\n");
        }
        else if (nodeType === "softbreak") {
            this.buffer.push("<br />\n");
        }
        else if (nodeType === "html_block") {
            this.buffer.push(node.literal || "");
        }
        else if (nodeType === "html_inline") {
            this.buffer.push(node.literal || "");
        }
    }
}
