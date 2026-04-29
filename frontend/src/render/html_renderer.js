// export class HtmlRenderer {
//     buffer;
//     constructor() {
//         this.buffer = [];
//     }
//     escape(text) {
//         if (text === null || text === undefined)
//             return "";
//         let s = String(text);
//         s = s.replace(/&/g, "&amp;");
//         s = s.replace(/</g, "&lt;");
//         s = s.replace(/>/g, "&gt;");
//         s = s.replace(/"/g, "&quot;");
//         s = s.replace(/'/g, "&#x27;");
//         return s;
//     }
//     render(irJSON) {
//         this.buffer = [];
//         this._renderNode(irJSON, false);
//         return this.buffer.join("");
//     }
//     _renderNode(node, tight = false) {
//         if (!node)
//             return;
//         const nodeType = node.type;
//         const children = node.children || [];
//         if (nodeType === "document") {
//             for (const child of children) {
//                 this._renderNode(child);
//             }
//         }
//         else if (nodeType === "heading") {
//             const level = node.level || 1;
//             const customId = node.custom_id;
//             const idAttr = customId ? ` id="${this.escape(customId)}"` : "";
//             this.buffer.push(`<h${level}${idAttr}>`);
//             for (const child of children) {
//                 this._renderNode(child);
//             }
//             this.buffer.push(`</h${level}>\n`);
//         }
//         else if (nodeType === "paragraph") {
//             if (tight) {
//                 for (const child of children) {
//                     this._renderNode(child);
//                 }
//             }
//             else {
//                 this.buffer.push("<p>");
//                 for (const child of children) {
//                     this._renderNode(child);
//                 }
//                 this.buffer.push("</p>\n");
//             }
//         }
//         else if (nodeType === "block_quote") {
//             this.buffer.push("<blockquote>\n");
//             for (const child of children) {
//                 this._renderNode(child);
//             }
//             this.buffer.push("</blockquote>\n");
//         }
//         else if (nodeType === "text") {
//             this.buffer.push(this.escape(node.literal || ""));
//         }
//         else if (nodeType === "strong") {
//             this.buffer.push("<strong>");
//             for (const child of children) {
//                 this._renderNode(child);
//             }
//             this.buffer.push("</strong>");
//         }
//         else if (nodeType === "emph") {
//             this.buffer.push("<em>");
//             for (const child of children) {
//                 this._renderNode(child);
//             }
//             this.buffer.push("</em>");
//         }
//         else if (nodeType === "code_block") {
//             const info = node.info || "";
//             const classAttr = info ? ` class="language-${this.escape(info)}"` : "";
//             this.buffer.push(`<pre><code${classAttr}>\n`);
//             this.buffer.push(this.escape(node.literal || ""));
//             this.buffer.push("</code></pre>\n");
//         }
//         else if (nodeType === "code") {
//             this.buffer.push("<code>");
//             this.buffer.push(this.escape(node.literal || ""));
//             this.buffer.push("</code>");
//         }
//         else if (nodeType === "link") {
//             let dest = this.escape(node.destination || "");
//             if (dest.startsWith("javascript:")) {
//                 dest = "";
//             }
//             this.buffer.push(`<a href="${dest}">`);
//             for (const child of children) {
//                 this._renderNode(child);
//             }
//             this.buffer.push("</a>");
//         }
//         else if (nodeType === "list") {
//             const tag = node.list_type === "bullet" ? "ul" : "ol";
//             this.buffer.push(`<${tag}>\n`);
//             for (const child of children) {
//                 this._renderNode(child);
//             }
//             this.buffer.push(`</${tag}>\n`);
//         }
//         else if (nodeType === "item") {
//             this.buffer.push("<li>");
//             for (const child of children) {
//                 this._renderNode(child, true);
//             }
//             this.buffer.push("</li>\n");
//         }
//         else if (nodeType === "mark") {
//             this.buffer.push("<mark>");
//             for (const child of children) {
//                 this._renderNode(child);
//             }
//             this.buffer.push("</mark>");
//         }
//         else if (nodeType === "u") {
//             this.buffer.push("<u>");
//             for (const child of children) {
//                 this._renderNode(child);
//             }
//             this.buffer.push("</u>");
//         }
//         else if (nodeType === "del") {
//             this.buffer.push("<del>");
//             for (const child of children) {
//                 this._renderNode(child);
//             }
//             this.buffer.push("</del>");
//         }
//         else if (nodeType === "table") {
//             this.buffer.push("<table border=\"1\">\n");
//             for (const child of children) {
//                 this._renderNode(child);
//             }
//             this.buffer.push("</table>\n");
//         }
//         else if (nodeType === "table_row") {
//             this.buffer.push("<tr>\n");
//             for (const child of children) {
//                 this._renderNode(child);
//             }
//             this.buffer.push("</tr>\n");
//         }
//         else if (nodeType === "table_header") {
//             this.buffer.push("<th>");
//             for (const child of children) {
//                 this._renderNode(child, true);
//             }
//             this.buffer.push("</th>\n");
//         }
//         else if (nodeType === "table_cell") {
//             this.buffer.push("<td>");
//             for (const child of children) {
//                 this._renderNode(child, true);
//             }
//             this.buffer.push("</td>\n");
//         }
//         else if (nodeType === "math_block") {
//             this.buffer.push("<div class=\"math math-display\">\n");
//             this.buffer.push(this.escape(node.literal || ""));
//             this.buffer.push("</div>\n");
//         }
//         else if (nodeType === "mermaid_block") {
//             this.buffer.push("<div class=\"mermaid\">\n");
//             this.buffer.push(this.escape(node.literal || ""));
//             this.buffer.push("</div>\n");
//         }
//         else if (nodeType === "footnote_def") {
//             const label = this.escape(node.label || "");
//             this.buffer.push(`<div class="footnote" id="fn:${label}">\n`);
//             if (children.length > 0 && children[0].type === "paragraph") {
//                 this.buffer.push("<p>");
//                 this.buffer.push(`<strong>[${label}]:</strong> `);
//                 for (const inlineChild of (children[0].children || [])) {
//                     this._renderNode(inlineChild);
//                 }
//                 this.buffer.push("</p>\n");
//                 for (let i = 1; i < children.length; i++) {
//                     this._renderNode(children[i]);
//                 }
//             }
//             else {
//                 this.buffer.push(`<strong>[${label}]:</strong> `);
//                 for (const child of children) {
//                     this._renderNode(child);
//                 }
//             }
//             this.buffer.push("</div>\n");
//         }
//         else if (nodeType === "def_list") {
//             this.buffer.push("<dl>\n");
//             for (const child of children) {
//                 this._renderNode(child);
//             }
//             this.buffer.push("</dl>\n");
//         }
//         else if (nodeType === "def_term") {
//             this.buffer.push("<dt>");
//             for (const child of children) {
//                 this._renderNode(child);
//             }
//             this.buffer.push("</dt>\n");
//         }
//         else if (nodeType === "def_item") {
//             this.buffer.push("<dd>");
//             for (const child of children) {
//                 this._renderNode(child);
//             }
//             this.buffer.push("</dd>\n");
//         }
//         else if (nodeType === "sub") {
//             this.buffer.push("<sub>");
//             for (const child of children) {
//                 this._renderNode(child);
//             }
//             this.buffer.push("</sub>");
//         }
//         else if (nodeType === "sup") {
//             this.buffer.push("<sup>");
//             for (const child of children) {
//                 this._renderNode(child);
//             }
//             this.buffer.push("</sup>");
//         }
//         else if (nodeType === "math_inline") {
//             this.buffer.push("<span class=\"math math-inline\">");
//             this.buffer.push(this.escape(node.literal || ""));
//             this.buffer.push("</span>");
//         }
//         else if (nodeType === "footnote_ref") {
//             const label = this.escape(node.label || "");
//             this.buffer.push(`<sup><a href="#fn:${label}">^${label}</a></sup>`);
//         }
//         else if (nodeType === "emoji") {
//             this.buffer.push(this.escape(node.literal || ""));
//         }
//         else if (nodeType === "task_checkbox") {
//             const checked = node.checked ? " checked" : "";
//             this.buffer.push(`<input type="checkbox" disabled${checked}>`);
//         }
//         else if (nodeType === "hardbreak") {
//             this.buffer.push("<br />\n");
//         }
//         else if (nodeType === "softbreak") {
//             this.buffer.push("<br />\n");
//         }
//         else if (nodeType === "html_block") {
//             this.buffer.push(node.literal || "");
//         }
//         else if (nodeType === "html_inline") {
//             this.buffer.push(node.literal || "");
//         }
//     }
// }

'use strict';

class HtmlRenderer {
    constructor() {
        this.buffer = [];
    }

    escape(text) {
        if (text === null || text === undefined) return "";
        text = String(text);
        text = text.replace(/&/g, "&amp;");
        text = text.replace(/</g, "&lt;");
        text = text.replace(/>/g, "&gt;");
        text = text.replace(/"/g, "&quot;");
        text = text.replace(/'/g, "&#x27;");
        return text;
    }

    _text_content(node) {
        if (node.literal !== undefined && node.literal !== null) {
            return String(node.literal);
        }
        let children = node.children || [];
        return children.map(c => this._text_content(c)).join("");
    }

    render(ir_dict) {
        this.buffer = [];
        this._render_node(ir_dict);
        return this.buffer.join("");
    }

    _render_node(node, tight = false) {
        let node_type = node.type;

        if (node_type === "document") {
            let children = node.children || [];
            for (let child of children) {
                this._render_node(child);
            }
        } else if (node_type === "heading") {
            let level = node.level || 1;
            let custom_id = node.custom_id;
            let id_attr = custom_id ? ` id="${this.escape(custom_id)}"` : "";
            this.buffer.push(`<h${level}${id_attr}>`);
            let children = node.children || [];
            for (let child of children) {
                this._render_node(child);
            }
            this.buffer.push(`</h${level}>\n`);
        } else if (node_type === "paragraph") {
            let children = node.children || [];
            if (tight) {
                for (let child of children) {
                    this._render_node(child);
                }
            } else {
                this.buffer.push("<p>");
                for (let child of children) {
                    this._render_node(child);
                }
                this.buffer.push("</p>\n");
            }
        } else if (node_type === "block_quote") {
            this.buffer.push("<blockquote>\n");
            let children = node.children || [];
            for (let child of children) {
                this._render_node(child);
            }
            this.buffer.push("</blockquote>\n");
        } else if (node_type === "text") {
            this.buffer.push(this.escape(node.literal || ""));
        } else if (node_type === "strong") {
            this.buffer.push("<strong>");
            let children = node.children || [];
            for (let child of children) {
                this._render_node(child);
            }
            this.buffer.push("</strong>");
        } else if (node_type === "emph") {
            this.buffer.push("<em>");
            let children = node.children || [];
            for (let child of children) {
                this._render_node(child);
            }
            this.buffer.push("</em>");
        } else if (node_type === "code_block") {
            let info = node.info || "";
            let class_attr = info ? ` class="language-${this.escape(info)}"` : "";
            this.buffer.push(`<pre><code${class_attr}>\n`);
            this.buffer.push(this.escape(node.literal || ""));
            this.buffer.push("</code></pre>\n");
        } else if (node_type === "code") {
            this.buffer.push("<code>");
            this.buffer.push(this.escape(node.literal || ""));
            this.buffer.push("</code>");
        } else if (node_type === "link") {
            let dest = this.escape(node.destination || "");
            if (dest.startsWith("javascript:")) {
                dest = "";
            }
            this.buffer.push(`<a href="${dest}">`);
            let children = node.children || [];
            for (let child of children) {
                this._render_node(child);
            }
            this.buffer.push("</a>");
        } else if (node_type === "image") {
            let dest = this.escape(node.destination || "");
            let alt = this.escape(this._text_content(node));
            this.buffer.push(`<img src="${dest}" alt="${alt}" />`);
        } else if (node_type === "video") {
            let dest = this.escape(node.destination || "");
            let caption = this.escape(node.title || "");
            this.buffer.push('<video controls>\n');
            this.buffer.push(`  <source src="${dest}" />\n`);
            if (caption) {
                this.buffer.push(`  ${caption}\n`);
            }
            this.buffer.push('</video>\n');
        } else if (node_type === "list") {
            let tag = node.list_type === "bullet" ? "ul" : "ol";
            this.buffer.push(`<${tag}>\n`);
            let children = node.children || [];
            for (let child of children) {
                this._render_node(child);
            }
            this.buffer.push(`</${tag}>\n`);
        } else if (node_type === "item") {
            this.buffer.push("<li>");
            let children = node.children || [];
            for (let child of children) {
                this._render_node(child, true);
            }
            this.buffer.push("</li>\n");
        } else if (node_type === "mark") {
            this.buffer.push("<mark>");
            let children = node.children || [];
            for (let child of children) {
                this._render_node(child);
            }
            this.buffer.push("</mark>");
        } else if (node_type === "u") {
            this.buffer.push("<u>");
            let children = node.children || [];
            for (let child of children) {
                this._render_node(child);
            }
            this.buffer.push("</u>");
        } else if (node_type === "del") {
            this.buffer.push("<s>");
            let children = node.children || [];
            for (let child of children) {
                this._render_node(child);
            }
            this.buffer.push("</s>");
        } else if (node_type === "table") {
            let children = node.children || [];
            let header_rows = children.filter(r => {
                let r_children = r.children || [];
                return r_children.some(c => c.type === "table_header");
            });
            let body_rows = children.filter(r => !header_rows.includes(r));

            this.buffer.push('<div class="table-wrapper">\n<table>\n');
            if (header_rows.length > 0) {
                this.buffer.push("<thead>\n");
                for (let row of header_rows) {
                    this._render_node(row);
                }
                this.buffer.push("</thead>\n");
            }
            if (body_rows.length > 0) {
                this.buffer.push("<tbody>\n");
                for (let row of body_rows) {
                    this._render_node(row);
                }
                this.buffer.push("</tbody>\n");
            }
            this.buffer.push("</table>\n</div>\n");
        } else if (node_type === "table_row") {
            this.buffer.push("<tr>\n");
            let children = node.children || [];
            for (let child of children) {
                this._render_node(child);
            }
            this.buffer.push("</tr>\n");
        } else if (node_type === "table_header") {
            this.buffer.push("<th>");
            let children = node.children || [];
            for (let child of children) {
                this._render_node(child, true);
            }
            this.buffer.push("</th>\n");
        } else if (node_type === "table_cell") {
            this.buffer.push("<td>");
            let children = node.children || [];
            for (let child of children) {
                this._render_node(child, true);
            }
            this.buffer.push("</td>\n");
        } else if (node_type === "math_block") {
            this.buffer.push("<div class=\"math math-display\">\n");
            this.buffer.push(this.escape(node.literal || ""));
            this.buffer.push("</div>\n");
        } else if (node_type === "thematic_break") {
            this.buffer.push("<hr />\n");
        } else if (node_type === "details") {
            let title = this.escape(node.title || "Details");
            this.buffer.push(`<details>\n<summary>${title}</summary>\n`);
            let inner = (node.string_content || "").trim();
            let children = node.children || [];

            if (inner || children.length > 0) {
                this.buffer.push("<p>\n");
                if (inner) {
                    this.buffer.push(this.escape(inner));
                }
                for (let child of children) {
                    this._render_node(child);
                }
                this.buffer.push("</p>\n");
            }
            this.buffer.push("</details>\n");
        } else if (node_type === "audio") {
            let dest = this.escape(node.destination || "");
            let caption = this.escape(node.title || "");
            this.buffer.push('<audio controls>\n');
            this.buffer.push(`  <source src="${dest}" />\n`);
            if (caption) {
                this.buffer.push(`  ${caption}\n`);
            }
            this.buffer.push('</audio>\n');
        } else if (node_type === "mermaid_block") {
            this.buffer.push('<div class="mermaid">\n');
            this.buffer.push(node.literal || "");
            this.buffer.push("</div>\n");
        } else if (node_type === "footnote_def") {
            let label = this.escape(node.label || "");
            this.buffer.push(`<div class="footnote" id="fn:${label}">\n`);

            let children = node.children || [];
            if (children.length > 0 && children[0].type === "paragraph") {
                this.buffer.push("<p>");
                this.buffer.push(`<strong>[${label}]:</strong> `);
                let inline_children = children[0].children || [];
                for (let inline_child of inline_children) {
                    this._render_node(inline_child);
                }
                this.buffer.push("</p>\n");
                for (let i = 1; i < children.length; i++) {
                    this._render_node(children[i]);
                }
            } else {
                this.buffer.push(`<strong>[${label}]:</strong> `);
                for (let child of children) {
                    this._render_node(child);
                }
            }
            this.buffer.push("</div>\n");
        } else if (node_type === "def_list") {
            this.buffer.push("<dl>\n");
            let children = node.children || [];
            for (let child of children) {
                this._render_node(child);
            }
            this.buffer.push("</dl>\n");
        } else if (node_type === "def_term") {
            this.buffer.push("<dt>");
            let children = node.children || [];
            for (let child of children) {
                this._render_node(child);
            }
            this.buffer.push("</dt>\n");
        } else if (node_type === "def_item") {
            this.buffer.push("<dd>");
            let children = node.children || [];
            for (let child of children) {
                this._render_node(child);
            }
            this.buffer.push("</dd>\n");
        } else if (node_type === "sub") {
            this.buffer.push("<sub>");
            let children = node.children || [];
            for (let child of children) {
                this._render_node(child);
            }
            this.buffer.push("</sub>");
        } else if (node_type === "sup") {
            this.buffer.push("<sup>");
            let children = node.children || [];
            for (let child of children) {
                this._render_node(child);
            }
            this.buffer.push("</sup>");
        } else if (node_type === "math_inline") {
            this.buffer.push("<span class=\"math math-inline\">");
            this.buffer.push(this.escape(node.literal || ""));
            this.buffer.push("</span>");
        } else if (node_type === "footnote_ref") {
            let label = this.escape(node.label || "");
            this.buffer.push(`<sup><a href="#fn:${label}">^${label}</a></sup>`);
        } else if (node_type === "emoji") {
            this.buffer.push(this.escape(node.literal || ""));
        } else if (node_type === "task_checkbox") {
            let checked = node.checked ? " checked" : "";
            this.buffer.push(`<input type="checkbox" disabled${checked}>`);
        } else if (node_type === "hardbreak") {
            this.buffer.push("<br />\n");
        } else if (node_type === "softbreak") {
            this.buffer.push("<br />\n");
        } else if (node_type === "html_block") {
            this.buffer.push(node.literal || "");
        } else if (node_type === "html_inline") {
            this.buffer.push(node.literal || "");
        }
    }
}

export { HtmlRenderer };