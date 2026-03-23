import { Node } from "./node";
import { blockTokenPattern, reHeadingID, reLineEndingSplit, reHtmlBlockOpen } from "./regex_rules";
import { InlineParser } from "./inline_parser";

export class Parser {
    inlineParser;
    doc;
    tip;
    currentLine = "";
    lineNumber = 0;
    offset = 0;
    indent = 0;
    blank = false;
    constructor() {
        this.inlineParser = new InlineParser();
        this.doc = new Node('document');
        this.tip = this.doc;
    }
    parse(text) {
        this.doc = new Node('document');
        this.tip = this.doc;
        this.lineNumber = 0;
        const lines = text.split(reLineEndingSplit);
        if (text && text.endsWith('\n')) {
            lines.pop();
        }
        for (const line of lines) {
            this.lineNumber++;
            this.incorporateLine(line);
        }
        while (this.tip) {
            this.tip.isOpen = false;
            this.tip = this.tip.parent;
        }
        this.processInlines(this.doc);
        return this.doc;
    }
    incorporateLine(line) {
        this.currentLine = line;
        const strippedLine = line.trimStart();
        this.indent = line.length - strippedLine.length;
        this.blank = strippedLine.length === 0;
        const blockMatch = blockTokenPattern.exec(strippedLine);
        let blockGroup = null;
        if (blockMatch && blockMatch.groups) {
            for (const key in blockMatch.groups) {
                if (blockMatch.groups[key] !== undefined) {
                    blockGroup = key;
                    break;
                }
            }
        }
        // 0. Raw Blocks
        if (this.tip && this.tip.isOpen) {
            if (['code_block', 'math_block', 'mermaid_block'].includes(this.tip.type)) {
                if (this.tip.isFenced) {
                    if (blockGroup === 'code_fence' && blockMatch?.groups?.code_fence[0] === this.tip.fenceChar && (blockMatch?.groups?.code_fence.length || 0) >= (this.tip.fenceLength || 0)) {
                        this.tip.isOpen = false;
                        this.tip = this.tip.parent;
                        return;
                    }
                }
                if (this.tip.type === 'math_block' && blockGroup === 'math_fence') {
                    this.tip.isOpen = false;
                    this.tip = this.tip.parent;
                    return;
                }
                else if (this.tip.type === 'mermaid_block' && blockGroup === 'mermaid_close' && !this.tip.isFenced) {
                    this.tip.isOpen = false;
                    this.tip = this.tip.parent;
                    return;
                }
                this.tip.stringContent += line + '\n';
                return;
            }
            else if (this.tip.type === 'html_block') {
                if (this.blank) {
                    this.tip.isOpen = false;
                    this.tip = this.tip.parent;
                }
                else {
                    this.tip.literal += '\n' + line;
                }
                return;
            }
        }
        // 1. Blockquote
        if (strippedLine.startsWith('>')) {
            if (!this.tip || this.tip.type !== 'block_quote' || !this.tip.isOpen) {
                const bq = new Node('block_quote');
                this.doc.appendChild(bq);
                this.tip = bq;
            }
            const p = new Node('paragraph');
            let content = strippedLine.substring(1);
            if (content.startsWith(' '))
                content = content.substring(1);
            p.stringContent = content;
            this.tip.appendChild(p);
            this.tip = p;
            return;
        }
        // 2. ATX Heading
        if (blockGroup === 'atx_heading') {
            const heading = new Node('heading');
            heading.level = blockMatch.groups.atx_heading.trim().length;
            let rawContent = strippedLine.substring(heading.level).trim().replace(/#+$/, '').trim();
            const idMatch = reHeadingID.exec(rawContent);
            if (idMatch) {
                heading.customId = idMatch[1];
                rawContent = rawContent.substring(0, idMatch.index).trim();
            }
            heading.stringContent = rawContent;
            this.doc.appendChild(heading);
            this._closeTipIfParagraph();
            heading.isOpen = false;
            this.tip = heading;
            return;
        }
        // 2a. Footnote Definitions
        if (blockGroup === 'footnote_def') {
            const fn = new Node('footnote_def');
            const fnMatch = strippedLine.match(/^\[\^([^\]]+)\]:[ \t]*(.*)/);
            let content = "";
            if (fnMatch) {
                fn.label = fnMatch[1];
                content = fnMatch[2];
            }
            else {
                fn.label = "unknown";
            }
            this.doc.appendChild(fn);
            this._closeTipIfParagraph();
            this.tip = fn;
            if (content) {
                const p = new Node('paragraph');
                p.stringContent = content;
                fn.appendChild(p);
                this.tip = p;
            }
            return;
        }
        // 2b. Definition Lists
        if (blockGroup === 'def_list_marker') {
            const defMatch = strippedLine.match(/^:[ \t]+(.*)/);
            if (this.tip && this.tip.type === 'paragraph') {
                this.tip.isOpen = false;
                let dl;
                if (this.tip.parent && this.tip.parent.type === 'def_list') {
                    dl = this.tip.parent;
                }
                else {
                    dl = new Node('def_list');
                    this.tip.insertAfter(dl);
                    dl.appendChild(this.tip);
                    this.tip.type = 'def_term';
                }
                const di = new Node('def_item');
                dl.appendChild(di);
                const dp = new Node('paragraph');
                if (defMatch)
                    dp.stringContent = defMatch[1];
                di.appendChild(dp);
                this.tip = dp;
                return;
            }
            else if (this.tip && (this.tip.type === 'def_item' || this.tip.type === 'def_term')) {
                const dl = this.tip.parent;
                const di = new Node('def_item');
                dl.appendChild(di);
                const dp = new Node('paragraph');
                if (defMatch)
                    dp.stringContent = defMatch[1];
                di.appendChild(dp);
                this.tip = dp;
                return;
            }
        }
        // 3. Thematic Break
        if (blockGroup === 'thematic_break') {
            const tbreak = new Node('thematic_break');
            this.doc.appendChild(tbreak);
            this._closeTipIfParagraph();
            tbreak.isOpen = false;
            this.tip = tbreak;
            return;
        }
        // Fences
        if (blockGroup === 'code_fence') {
            const cb = new Node('code_block');
            cb.isFenced = true;
            cb.fenceChar = blockMatch.groups.code_fence[0];
            cb.fenceLength = blockMatch.groups.code_fence.length;
            cb.info = strippedLine.substring(cb.fenceLength).trim();
            if (cb.info.toLowerCase() === 'mermaid') {
                cb.type = 'mermaid_block';
            }
            cb.stringContent = "";
            this.doc.appendChild(cb);
            this._closeTipIfParagraph();
            this.tip = cb;
            return;
        }
        if (blockGroup === 'math_fence') {
            const mb = new Node('math_block');
            mb.stringContent = "";
            this.doc.appendChild(mb);
            this._closeTipIfParagraph();
            this.tip = mb;
            return;
        }
        if (blockGroup === 'mermaid_fence') {
            const mm = new Node('mermaid_block');
            mm.stringContent = "";
            this.doc.appendChild(mm);
            this._closeTipIfParagraph();
            this.tip = mm;
            return;
        }
        // Lists
        let isListItem = false;
        let listType = null;
        let listStart = null;
        let content = "";
        if (blockGroup === 'bullet_list') {
            isListItem = true;
            listType = 'bullet';
            content = strippedLine.substring(blockMatch.groups.bullet_list.length);
        }
        else if (blockGroup === 'ordered_list') {
            isListItem = true;
            listType = 'ordered';
            const startMatch = blockMatch.groups.ordered_list.match(/\d+/);
            listStart = startMatch ? parseInt(startMatch[0], 10) : 1;
            content = strippedLine.substring(blockMatch.groups.ordered_list.length);
        }
        if (isListItem) {
            this._closeTipIfParagraph();
            let current = this.tip;
            let targetList = null;
            while (current) {
                if (current.type === 'list' && current.isOpen) {
                    const listIndent = current.indent || 0;
                    if (this.indent < listIndent) {
                        current.isOpen = false;
                    }
                    else if (this.indent >= listIndent) {
                        targetList = current;
                        break;
                    }
                }
                current = current.parent;
            }
            if (targetList) {
                const targetIndent = targetList.indent || 0;
                if (this.indent > targetIndent && targetList.lastChild && targetList.lastChild.type === 'item') {
                    const lst = new Node('list');
                    lst.listType = listType;
                    if (listStart !== null)
                        lst.listStart = listStart;
                    lst.isOpen = true;
                    lst.indent = this.indent;
                    targetList.lastChild.appendChild(lst);
                    this.tip = lst;
                }
                else {
                    if (targetList.listType === listType) {
                        this.tip = targetList;
                    }
                    else {
                        targetList.isOpen = false;
                        const lst = new Node('list');
                        lst.listType = listType;
                        if (listStart !== null)
                            lst.listStart = listStart;
                        lst.isOpen = true;
                        lst.indent = this.indent;
                        if (targetList.parent) {
                            targetList.parent.appendChild(lst);
                        }
                        else {
                            this.doc.appendChild(lst);
                        }
                        this.tip = lst;
                    }
                }
            }
            else {
                const lst = new Node('list');
                lst.listType = listType;
                if (listStart !== null)
                    lst.listStart = listStart;
                lst.isOpen = true;
                lst.indent = this.indent;
                if (this.tip && this.tip.isOpen && ['document', 'block_quote', 'item'].includes(this.tip.type)) {
                    this.tip.appendChild(lst);
                }
                else if (this.tip && this.tip.parent) {
                    this.tip.parent.appendChild(lst);
                }
                else {
                    this.doc.appendChild(lst);
                }
                this.tip = lst;
            }
            const item = new Node('item');
            this.tip.appendChild(item);
            const p = new Node('paragraph');
            p.stringContent = content;
            item.appendChild(p);
            this.tip = p;
            return;
        }
        // Tables
        if (strippedLine.startsWith('|') && strippedLine.endsWith('|')) {
            if (!this.tip || this.tip.type !== 'table' || !this.tip.isOpen) {
                this._closeTipIfParagraph();
                const table = new Node('table');
                table.isOpen = true;
                this.doc.appendChild(table);
                this.tip = table;
            }
            if (/^\|[ \t-:|]+\|[ \t]*$/.test(strippedLine)) {
                this.tip.headersDone = true;
                return;
            }
            const row = new Node('table_row');
            this.tip.appendChild(row);
            const cells = strippedLine.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
            for (const cellContent of cells) {
                const isHeader = !this.tip.headersDone;
                const cell = new Node(isHeader ? 'table_header' : 'table_cell');
                row.appendChild(cell);
                cell.stringContent = cellContent;
            }
            return;
        }
        // HTML Blocks
        let htmlMatch = false;
        for (const pattern of reHtmlBlockOpen) {
            if (pattern.test(strippedLine)) {
                htmlMatch = true;
                break;
            }
        }
        if (htmlMatch) {
            const hb = new Node('html_block');
            hb.literal = line;
            hb.isOpen = true;
            this.doc.appendChild(hb);
            this._closeTipIfParagraph();
            this.tip = hb;
            return;
        }
        // Blank lines
        if (this.blank) {
            if (this.tip && this.tip.isOpen) {
                this.tip.isOpen = false;
            }
            return;
        }
        // Paragraphs
        if (this.tip && this.tip.type === 'paragraph' && this.tip.isOpen) {
            this.tip.stringContent += '\n' + strippedLine;
        }
        else {
            const p = new Node('paragraph');
            p.stringContent = strippedLine;
            if (this.tip && ['block_quote', 'item'].includes(this.tip.type) && this.tip.isOpen) {
                this.tip.appendChild(p);
            }
            else {
                this.doc.appendChild(p);
            }
            this.tip = p;
        }
    }
    _closeTipIfParagraph() {
        if (this.tip && this.tip.type === 'paragraph') {
            this.tip.isOpen = false;
            this.tip = this.tip.parent;
        }
    }
    processInlines(doc) {
        const walker = doc.walker();
        for (const [node, entering] of walker) {
            if (entering && ['paragraph', 'heading', 'table_cell', 'table_header', 'def_term'].includes(node.type) && node.stringContent) {
                this.inlineParser.parse(node);
            }
            else if (entering && ['code_block', 'math_block', 'mermaid_block'].includes(node.type)) {
                node.literal = node.stringContent;
                node.stringContent = "";
            }
        }
    }
}
