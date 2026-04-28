"use strict";

import { Node } from './node.js';
import { Lexer } from './lexer.js';
import {
    Token,
    BLANK, PARAGRAPH, ATX_HEADING, THEMATIC_BREAK, BLOCKQUOTE, BULLET_LIST, ORDERED_LIST,
    CODE_FENCE, CODE_FENCE_END, MATH_FENCE, MATH_FENCE_END, MERMAID_FENCE, MERMAID_CLOSE,
    DETAILS_FENCE, FOOTNOTE_DEF, DEF_LIST_MARKER, TABLE_ROW, TABLE_SEP, HTML_BLOCK, RAW_CONTENT,
    IL_IMAGE, IL_LINK, IL_STRONG, IL_EMPH, IL_MARK, IL_UNDERLINE, IL_DEL, IL_SUB, IL_SUP, IL_CODE,
    IL_MATH, IL_FOOTNOTE_REF, IL_EMOJI, IL_TASK, IL_HTML, IL_EMAIL_LINK, IL_URI_LINK, IL_ENTITY,
    IL_HARDBREAK, IL_SOFTBREAK, IL_ESCAPED, IL_TEXT, IL_VIDEO, IL_AUDIO
} from './lex_token.js';

function unescapeHtml(safe) {
    return safe.replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#039;/g, "'");
}

class InlineParser {
    constructor() {
        this._lexer = new Lexer();
    }

    parse(block_node) {
        let text = (block_node.string_content || "").trim();
        if (!text) return;
        let tokens = this._lexer.tokenize_inline(text);
        this._build_nodes(block_node, tokens);
        block_node.string_content = "";
    }

    _build_nodes(block, tokens) {
        for (let tok of tokens) {
            let node = this._token_to_node(tok);
            if (node !== null) {
                block.append_child(node);
            }
        }
    }

    _token_to_node(tok) {
        let t = tok.type, v = tok.value, m = tok.meta;
        let node;

        if (t === IL_AUDIO) {
            node = new Node('audio');
            node.destination = m.dest;
            node.title = m.label;
            return node;
        }

        if (t === IL_VIDEO) {
            node = new Node('video');
            node.destination = m.dest;
            node.title = m.label;
            return node;
        }

        if (t === IL_IMAGE) {
            node = new Node('image');
            node.destination = m.dest;
            node.title = m.label;
            let inner = this._lexer.tokenize_inline(m.label);
            this._build_nodes(node, inner);
            return node;
        }

        if (t === IL_LINK) {
            node = new Node('link');
            node.destination = m.dest;
            let inner = this._lexer.tokenize_inline(m.label);
            this._build_nodes(node, inner);
            return node;
        }

        if (t === IL_STRONG) {
            node = new Node('strong');
            let inner = this._lexer.tokenize_inline(m.text);
            this._build_nodes(node, inner);
            return node;
        }

        if (t === IL_EMPH) {
            node = new Node('emph');
            let inner = this._lexer.tokenize_inline(m.text);
            this._build_nodes(node, inner);
            return node;
        }

        if (t === IL_MARK) {
            node = new Node('mark');
            let inner = this._lexer.tokenize_inline(m.text);
            this._build_nodes(node, inner);
            return node;
        }

        if (t === IL_UNDERLINE) {
            node = new Node('u');
            let inner = this._lexer.tokenize_inline(m.text);
            this._build_nodes(node, inner);
            return node;
        }

        if (t === IL_DEL) {
            node = new Node('del');
            let inner = this._lexer.tokenize_inline(m.text);
            this._build_nodes(node, inner);
            return node;
        }

        if (t === IL_SUB) {
            node = new Node('sub');
            let inner = this._lexer.tokenize_inline(m.text);
            this._build_nodes(node, inner);
            return node;
        }

        if (t === IL_SUP) {
            node = new Node('sup');
            let inner = this._lexer.tokenize_inline(m.text);
            this._build_nodes(node, inner);
            return node;
        }

        if (t === IL_MATH) {
            node = new Node('math_inline');
            node.literal = m.text;
            return node;
        }

        if (t === IL_CODE) {
            node = new Node('code');
            node.literal = m.text;
            return node;
        }

        if (t === IL_FOOTNOTE_REF) {
            node = new Node('footnote_ref');
            node.label = m.label;
            return node;
        }

        if (t === IL_EMOJI) {
            node = new Node('emoji');
            node.literal = v;
            return node;
        }

        if (t === IL_TASK) {
            node = new Node('task_checkbox');
            node.checked = m.checked;
            return node;
        }

        if (t === IL_EMAIL_LINK) {
            node = new Node('link');
            node.destination = 'mailto:' + m.dest;
            let child = new Node('text'); child.literal = m.dest;
            node.append_child(child);
            return node;
        }

        if (t === IL_URI_LINK) {
            node = new Node('link');
            node.destination = encodeURI(m.dest);
            let child = new Node('text'); child.literal = m.dest;
            node.append_child(child);
            return node;
        }

        if (t === IL_HTML) {
            node = new Node('html_inline');
            node.literal = v;
            return node;
        }

        if (t === IL_ENTITY) {
            node = new Node('text');
            node.literal = unescapeHtml(v);
            return node;
        }

        if (t === IL_HARDBREAK) {
            return new Node('hardbreak');
        }

        if (t === IL_SOFTBREAK) {
            return new Node('softbreak');
        }

        if (t === IL_ESCAPED) {
            node = new Node('text');
            node.literal = m.char;
            return node;
        }

        node = new Node('text');
        node.literal = v;
        return node;
    }
}

class Parser {
    constructor() {
        this.inline_parser = new InlineParser();
        this._lexer = new Lexer();
        this.doc = new Node('document');
        this.tip = this.doc;
    }

    parse(text) {
        this.doc = new Node('document');
        this.tip = this.doc;

        let tokens = this._lexer.tokenize(text);
        for (let tok of tokens) {
            this._incorporate_token(tok);
        }

        while (this.tip) {
            this.tip.is_open = false;
            this.tip = this.tip.parent;
        }

        this.process_inlines(this.doc);
        return this.doc;
    }

    _incorporate_token(tok) {
        let t = tok.type;
        let m = tok.meta;
        let indent = tok.indent;

        if (t === RAW_CONTENT) {
            if (this.tip && (this.tip.type === 'code_block' || this.tip.type === 'math_block' || this.tip.type === 'mermaid_block' || this.tip.type === 'details')) {
                this.tip.string_content += tok.value + '\n';
            }
            return;
        }

        if (t === CODE_FENCE_END || t === MATH_FENCE_END || t === MERMAID_CLOSE) {
            if (this.tip) {
                this.tip.is_open = false;
                this.tip = this.tip.parent;
            }
            return;
        }

        if (this.tip && this.tip.type === 'html_block' && this.tip.is_open) {
            if (t === BLANK) {
                this.tip.is_open = false;
                this.tip = this.tip.parent;
            } else {
                this.tip.literal += '\n' + tok.value;
            }
            return;
        }

        if (t === BLANK) {
            if (this.tip && this.tip.is_open) {
                this.tip.is_open = false;
            }
            return;
        }

        if (t === BLOCKQUOTE) {
            if (!this.tip || this.tip.type !== 'block_quote' || !this.tip.is_open) {
                let bq = new Node('block_quote');
                this.doc.append_child(bq);
                this.tip = bq;
            }
            let p = new Node('paragraph');
            p.string_content = m.content;
            this.tip.append_child(p);
            this.tip = p;
            return;
        }

        if (t === ATX_HEADING) {
            let heading = new Node('heading');
            heading.level = m.level;
            heading.string_content = m.content;
            if (m.custom_id) {
                heading.custom_id = m.custom_id;
            }
            this.doc.append_child(heading);
            this._close_tip_if_paragraph();
            heading.is_open = false;
            this.tip = heading;
            return;
        }

        if (t === FOOTNOTE_DEF) {
            let fn = new Node('footnote_def');
            fn.label = m.label;
            this.doc.append_child(fn);
            this._close_tip_if_paragraph();
            this.tip = fn;
            if (m.content) {
                let p = new Node('paragraph');
                p.string_content = m.content;
                fn.append_child(p);
                this.tip = p;
            }
            return;
        }

        if (t === DEF_LIST_MARKER) {
            let content = m.content || '';
            if (this.tip && this.tip.type === 'paragraph') {
                this.tip.is_open = false;
                let dl;
                if (this.tip.parent && this.tip.parent.type === 'def_list') {
                    dl = this.tip.parent;
                } else {
                    dl = new Node('def_list');
                    this.tip.insert_after(dl);
                    dl.append_child(this.tip);
                    this.tip.type = 'def_term';
                }
                let di = new Node('def_item');
                dl.append_child(di);
                let dp = new Node('paragraph');
                dp.string_content = content;
                di.append_child(dp);
                this.tip = dp;
            } else if (this.tip && (this.tip.type === 'def_item' || this.tip.type === 'def_term')) {
                let dl = this.tip.parent;
                let di = new Node('def_item');
                dl.append_child(di);
                let dp = new Node('paragraph');
                dp.string_content = content;
                di.append_child(dp);
                this.tip = dp;
            }
            return;
        }

        if (t === THEMATIC_BREAK) {
            let tbreak = new Node('thematic_break');
            this.doc.append_child(tbreak);
            this._close_tip_if_paragraph();
            tbreak.is_open = false;
            this.tip = tbreak;
            return;
        }

        if (t === CODE_FENCE) {
            let btype = m.block_type || 'code_block';
            let cb = new Node(btype);
            cb.is_fenced = true;
            cb.fence_char = m.fence_char;
            cb.fence_length = m.fence_length;
            cb.info = m.info || '';
            cb.string_content = "";
            this.doc.append_child(cb);
            this._close_tip_if_paragraph();
            this.tip = cb;
            return;
        }

        if (t === MATH_FENCE) {
            let mb = new Node('math_block');
            mb.string_content = "";
            this.doc.append_child(mb);
            this._close_tip_if_paragraph();
            this.tip = mb;
            return;
        }

        if (t === MERMAID_FENCE) {
            let mm = new Node('mermaid_block');
            mm.string_content = "";
            this.doc.append_child(mm);
            this._close_tip_if_paragraph();
            this.tip = mm;
            return;
        }

        if (t === DETAILS_FENCE) {
            let det = new Node('details');
            det.title = m.title || '';
            det.string_content = "";
            this.doc.append_child(det);
            this._close_tip_if_paragraph();
            this.tip = det;
            return;
        }

        if (t === BULLET_LIST || t === ORDERED_LIST) {
            let list_type = m.list_type;
            let list_start = m.list_start;
            let content = m.content || '';
            this._close_tip_if_paragraph();
            this._handle_list_item(indent, list_type, list_start, content);
            return;
        }

        if (t === TABLE_SEP) {
            if (this.tip && this.tip.type === 'table') {
                this.tip.headers_done = true;
            }
            return;
        }

        if (t === TABLE_ROW) {
            if (!this.tip || this.tip.type !== 'table' || !this.tip.is_open) {
                this._close_tip_if_paragraph();
                let table = new Node('table');
                table.is_open = true;
                this.doc.append_child(table);
                this.tip = table;
            }
            let row = new Node('table_row');
            this.tip.append_child(row);
            for (let cell_content of m.cells) {
                let is_header = !this.tip.headers_done;
                let cell = new Node(is_header ? 'table_header' : 'table_cell');
                cell.string_content = cell_content;
                row.append_child(cell);
            }
            return;
        }

        if (t === HTML_BLOCK) {
            let hb = new Node('html_block');
            hb.literal = tok.value;
            hb.is_open = true;
            this.doc.append_child(hb);
            this._close_tip_if_paragraph();
            this.tip = hb;
            return;
        }

        if (t === PARAGRAPH) {
            if (this.tip && this.tip.type === 'paragraph' && this.tip.is_open) {
                this.tip.string_content += '\n' + tok.value;
            } else {
                let p = new Node('paragraph');
                p.string_content = tok.value;
                if (this.tip && (this.tip.type === 'block_quote' || this.tip.type === 'item') && this.tip.is_open) {
                    this.tip.append_child(p);
                } else {
                    this.doc.append_child(p);
                }
                this.tip = p;
            }
        }
    }

    _handle_list_item(indent, list_type, list_start, content) {
        let current = this.tip;
        let target_list = null;

        while (current) {
            if (current.type === 'list' && current.is_open) {
                let list_indent = current.indent || 0;
                if (indent < list_indent) {
                    current.is_open = false;
                } else {
                    target_list = current;
                    break;
                }
            }
            current = current.parent;
        }

        if (target_list !== null) {
            let target_indent = target_list.indent || 0;
            if (indent > target_indent && target_list.last_child && target_list.last_child.type === 'item') {
                let lst = Parser._make_list(list_type, list_start, indent);
                target_list.last_child.append_child(lst);
                this.tip = lst;
            } else if (target_list.list_type === list_type) {
                this.tip = target_list;
            } else {
                target_list.is_open = false;
                let lst = Parser._make_list(list_type, list_start, indent);
                if (target_list.parent) {
                    target_list.parent.append_child(lst);
                } else {
                    this.doc.append_child(lst);
                }
                this.tip = lst;
            }
        } else {
            let lst = Parser._make_list(list_type, list_start, indent);
            if (this.tip && this.tip.is_open && (this.tip.type === 'document' || this.tip.type === 'block_quote' || this.tip.type === 'item')) {
                this.tip.append_child(lst);
            } else if (this.tip && this.tip.parent) {
                this.tip.parent.append_child(lst);
            } else {
                this.doc.append_child(lst);
            }
            this.tip = lst;
        }

        let item = new Node('item');
        this.tip.append_child(item);
        let p = new Node('paragraph');
        p.string_content = content;
        item.append_child(p);
        this.tip = p;
    }

    static _make_list(list_type, list_start, indent) {
        let lst = new Node('list');
        lst.list_type = list_type;
        lst.list_start = list_start;
        lst.is_open = true;
        lst.indent = indent;
        return lst;
    }

    _close_tip_if_paragraph() {
        if (this.tip && this.tip.type === 'paragraph') {
            this.tip.is_open = false;
            this.tip = this.tip.parent;
        }
    }

    process_inlines(doc) {
        for (let [node, entering] of doc.walker()) {
            if (entering && ['paragraph', 'heading', 'table_cell', 'table_header', 'def_term', 'details'].includes(node.type) && node.string_content) {
                this.inline_parser.parse(node);
            } else if (entering && ['code_block', 'math_block', 'mermaid_block'].includes(node.type)) {
                node.literal = node.string_content;
                node.string_content = "";
            }
        }
    }
}

export { Parser, InlineParser };
