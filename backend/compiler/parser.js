'use strict';

const { Node } = require('./node');
const {
    reHtmlBlockOpen,
    blockTokenPattern,
    reHeadingID,
    reLineEnding,
    inlineTokenPattern,
    CODE_INDENT,
} = require('./regex_rules');

function htmlUnescape(str) {
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
        .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)));
}

function uriQuote(str, safe = ':/?#[]@!$&\'()*+,;=') {
    let encoded = encodeURIComponent(str);
    for (const ch of safe) {
        encoded = encoded.replace(new RegExp(encodeURIComponent(ch), 'g'), ch);
    }
    return encoded;
}

class InlineParser {
    constructor() {
        this.subject = '';
        this.pos = 0;
        this.refmap = {};
    }

    parse(blockNode) {
        this.subject = blockNode.stringContent.trim();
        this.pos = 0;
        this.parseInlines(blockNode);
        blockNode.stringContent = '';
    }

    peek() {
        if (this.pos < this.subject.length) return this.subject[this.pos];
        return '';
    }

    parseInlines(block) {
        const re = new RegExp(inlineTokenPattern.source, 'g');
        let m;
        while ((m = re.exec(this.subject)) !== null) {
            const token = m[0];
            if (!token) continue;

            // Image: ![alt](url)
            if (token.startsWith('![') && token.includes('](') && token.endsWith(')')) {
                const node = new Node('image');
                const inner = token.slice(2);                    // strip '!['
                const splitIdx = inner.indexOf('](');
                const label = inner.slice(0, splitIdx);
                const dest = inner.slice(splitIdx + 2, -1);      // strip trailing ')'
                node.destination = dest;
                node.title = label;
                const textChild = new Node('text');
                textChild.literal = label;
                node.appendChild(textChild);
                block.appendChild(node);

                // Link: [label](url)
            } else if (token.startsWith('[') && token.includes('](') && token.endsWith(')')) {
                const node = new Node('link');
                const inner = token.slice(1);
                const splitIdx = inner.indexOf('](');
                const label = inner.slice(0, splitIdx);
                const dest = inner.slice(splitIdx + 2, -1);
                node.destination = dest;
                const textChild = new Node('text');
                textChild.literal = label;
                node.appendChild(textChild);
                block.appendChild(node);

                // Strong: **text** or __text__
            } else if (
                (token.startsWith('**') && token.endsWith('**')) ||
                (token.startsWith('__') && token.endsWith('__'))
            ) {
                const node = new Node('strong');
                const textChild = new Node('text');
                textChild.literal = token.slice(2, -2);
                node.appendChild(textChild);
                block.appendChild(node);

                // Emph: *text* or _text_
            } else if (
                (token.startsWith('*') && token.endsWith('*')) ||
                (token.startsWith('_') && token.endsWith('_'))
            ) {
                const node = new Node('emph');
                const textChild = new Node('text');
                textChild.literal = token.slice(1, -1);
                node.appendChild(textChild);
                block.appendChild(node);

                // Highlight: ==text==
            } else if (token.startsWith('==') && token.endsWith('==')) {
                const node = new Node('mark');
                const textChild = new Node('text');
                textChild.literal = token.slice(2, -2);
                node.appendChild(textChild);
                block.appendChild(node);

                // Underline: ++text++
            } else if (token.startsWith('++') && token.endsWith('++')) {
                const node = new Node('u');
                const textChild = new Node('text');
                textChild.literal = token.slice(2, -2);
                node.appendChild(textChild);
                block.appendChild(node);

                // Strikethrough: ~~text~~
            } else if (token.startsWith('~~') && token.endsWith('~~')) {
                const node = new Node('del');
                const textChild = new Node('text');
                textChild.literal = token.slice(2, -2);
                node.appendChild(textChild);
                block.appendChild(node);

                // Subscript: ~text~
            } else if (token.startsWith('~') && token.endsWith('~')) {
                const node = new Node('sub');
                const textChild = new Node('text');
                textChild.literal = token.slice(1, -1);
                node.appendChild(textChild);
                block.appendChild(node);

                // Superscript: ^text^
            } else if (token.startsWith('^') && token.endsWith('^')) {
                const node = new Node('sup');
                const textChild = new Node('text');
                textChild.literal = token.slice(1, -1);
                node.appendChild(textChild);
                block.appendChild(node);

                // Inline Math: $equation$
            } else if (token.startsWith('$') && token.endsWith('$')) {
                const node = new Node('math_inline');
                node.literal = token.slice(1, -1);
                block.appendChild(node);

                // Footnote ref: [^label]
            } else if (token.startsWith('[^') && token.endsWith(']')) {
                const node = new Node('footnote_ref');
                node.label = token.slice(2, -1);
                block.appendChild(node);

                // Emoji shortcode: :emoji:
            } else if (token.startsWith(':') && token.endsWith(':')) {
                const node = new Node('emoji');
                node.literal = token;
                block.appendChild(node);

                // Task checkbox: [ ] / [x] / [X]
            } else if (token === '[ ]' || token === '[x]' || token === '[X]') {
                const node = new Node('task_checkbox');
                node.checked = token.toLowerCase() === '[x]';
                block.appendChild(node);

                // Inline code: `...`
            } else if (token.startsWith('`') && token.endsWith('`')) {
                const node = new Node('code');
                const stripLen = token.length - token.replace(/^`+/, '').length;
                node.literal = token.slice(stripLen, -stripLen).trim();
                block.appendChild(node);

                // Email autolink: <user@host>
            } else if (
                token.startsWith('<') && token.endsWith('>') &&
                !token.startsWith('</') &&
                token.includes('@') && !token.includes(' ')
            ) {
                const dest = token.slice(1, -1);
                const node = new Node('link');
                node.destination = 'mailto:' + dest;
                const textChild = new Node('text');
                textChild.literal = dest;
                node.appendChild(textChild);
                block.appendChild(node);

                // URI autolink: <scheme:...>
            } else if (
                token.startsWith('<') && token.endsWith('>') &&
                token.includes(':') &&
                !token.startsWith('</') && !token.includes(' ')
            ) {
                const dest = token.slice(1, -1);
                const node = new Node('link');
                node.destination = uriQuote(dest, ":/?#[]@!$&'()*+,;=");
                const textChild = new Node('text');
                textChild.literal = dest;
                node.appendChild(textChild);
                block.appendChild(node);

                // Raw HTML inline tag
            } else if (token.startsWith('<') && token.endsWith('>')) {
                const node = new Node('html_inline');
                node.literal = token;
                block.appendChild(node);

                // HTML entity: &amp; &#123; etc.
            } else if (token.startsWith('&') && token.endsWith(';')) {
                const node = new Node('text');
                node.literal = htmlUnescape(token);
                block.appendChild(node);

                // Hard line break: "  \n"
            } else if (token === '  \n') {
                block.appendChild(new Node('hardbreak'));

                // Escaped character: \X
            } else if (token.startsWith('\\') && token.length === 2) {
                const node = new Node('text');
                node.literal = token[1];
                block.appendChild(node);

                // Soft break: bare newline
            } else if (token === '\n') {
                block.appendChild(new Node('softbreak'));

                // Plain text fallback
            } else {
                const node = new Node('text');
                node.literal = token;
                block.appendChild(node);
            }
        }
    }
}

class Parser {
    constructor() {
        this.inlineParser = new InlineParser();
        this.doc = new Node('document');
        this.tip = this.doc;
        this.currentLine = '';
        this.lineNumber = 0;
        this.offset = 0;
        this.indent = 0;
        this.blank = false;
    }

    parse(text) {
        this.doc = new Node('document');
        this.tip = this.doc;

        let lines = text.split(reLineEnding);
        if (text.length && text[text.length - 1] === '\n') {
            lines.pop();
        }

        for (const line of lines) {
            this.lineNumber += 1;
            this.incorporateLine(line);
        }

        // Close all open blocks
        let tip = this.tip;
        while (tip) {
            tip.isOpen = false;
            tip = tip.parent;
        }

        this.processInlines(this.doc);
        return this.doc;
    }

    incorporateLine(line) {
        this.currentLine = line;
        const strippedLine = line.replace(/^[ \t]+/, '');
        this.indent = line.length - strippedLine.length;
        this.blank = strippedLine.length === 0;

        // Match the combined block pattern against the stripped line
        const blockMatch = blockTokenPattern.exec(strippedLine);
        const blockGroup = blockMatch ? blockMatch[0] !== '' ? this._lastGroup(blockMatch) : null : null;

        // 0. Continuation for raw blocks (code / math / mermaid / html)
        if (this.tip && this.tip.isOpen) {
            const tipType = this.tip.type;

            if (tipType === 'code_block' || tipType === 'math_block' || tipType === 'mermaid_block') {
                // Check for closing fence
                if (this.tip.isFenced) {
                    if (
                        blockGroup === 'code_fence' &&
                        blockMatch.groups.code_fence[0] === this.tip.fenceChar &&
                        blockMatch.groups.code_fence.length >= this.tip.fenceLength
                    ) {
                        this.tip.isOpen = false;
                        this.tip = this.tip.parent;
                        return;
                    }
                }

                if (tipType === 'math_block' && blockGroup === 'math_fence') {
                    this.tip.isOpen = false;
                    this.tip = this.tip.parent;
                    return;
                }

                if (
                    tipType === 'mermaid_block' &&
                    blockGroup === 'mermaid_close' &&
                    !this.tip.isFenced
                ) {
                    this.tip.isOpen = false;
                    this.tip = this.tip.parent;
                    return;
                }

                // Content line
                this.tip.stringContent += line + '\n';
                return;

            } else if (tipType === 'html_block') {
                if (this.blank) {
                    this.tip.isOpen = false;
                    this.tip = this.tip.parent;
                } else {
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
            let content = strippedLine.slice(1);
            if (content.startsWith(' ')) content = content.slice(1);
            p.stringContent = content;
            this.tip.appendChild(p);
            this.tip = p;
            return;
        }

        // 2. ATX Heading
        if (blockGroup === 'atx_heading') {
            const heading = new Node('heading');
            heading.level = blockMatch.groups.atx_heading.trim().length;
            let rawContent = strippedLine.slice(heading.level).trim().replace(/#+\s*$/, '').trim();

            // Heading ID {#custom-id}
            const idMatch = reHeadingID.exec(rawContent);
            if (idMatch) {
                heading.customId = idMatch[1];
                rawContent = rawContent.slice(0, idMatch.index).trim();
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
            const fnMatch = /^\[\^([^\]]+)\]:[ \t]*(.*)/.exec(strippedLine);
            if (fnMatch) {
                fn.label = fnMatch[1];
                const content = fnMatch[2];
                this.doc.appendChild(fn);
                this._closeTipIfParagraph();
                this.tip = fn;
                if (content) {
                    const p = new Node('paragraph');
                    p.stringContent = content;
                    fn.appendChild(p);
                    this.tip = p;
                }
            } else {
                fn.label = 'unknown';
                this.doc.appendChild(fn);
                this._closeTipIfParagraph();
                this.tip = fn;
            }
            return;
        }

        // 2b. Definition Lists
        if (blockGroup === 'def_list_marker') {
            const defMatch = /^:[ \t]+(.*)/.exec(strippedLine);
            if (this.tip && this.tip.type === 'paragraph') {
                const termContent = this.tip.stringContent;
                this.tip.isOpen = false;

                let dl;
                if (this.tip.parent && this.tip.parent.type === 'def_list') {
                    dl = this.tip.parent;
                } else {
                    dl = new Node('def_list');
                    this.tip.insertAfter(dl);
                    dl.appendChild(this.tip);
                    this.tip.type = 'def_term';
                }

                const di = new Node('def_item');
                dl.appendChild(di);
                const dp = new Node('paragraph');
                dp.stringContent = defMatch ? defMatch[1] : '';
                di.appendChild(dp);
                this.tip = dp;
                return;

            } else if (this.tip && (this.tip.type === 'def_item' || this.tip.type === 'def_term')) {
                const dl = this.tip.parent;
                const di = new Node('def_item');
                dl.appendChild(di);
                const dp = new Node('paragraph');
                dp.stringContent = defMatch ? defMatch[1] : '';
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

        // 4. Fenced blocks: code / math / mermaid
        if (blockGroup === 'code_fence') {
            const cb = new Node('code_block');
            cb.isFenced = true;
            cb.fenceChar = blockMatch.groups.code_fence[0];
            cb.fenceLength = blockMatch.groups.code_fence.length;
            cb.info = strippedLine.slice(cb.fenceLength).trim();
            if (cb.info.toLowerCase() === 'mermaid') {
                cb.type = 'mermaid_block';
            }
            cb.stringContent = '';
            this.doc.appendChild(cb);
            this._closeTipIfParagraph();
            this.tip = cb;
            return;
        }

        if (blockGroup === 'math_fence') {
            const mb = new Node('math_block');
            mb.stringContent = '';
            this.doc.appendChild(mb);
            this._closeTipIfParagraph();
            this.tip = mb;
            return;
        }

        if (blockGroup === 'mermaid_fence') {
            const mm = new Node('mermaid_block');
            mm.stringContent = '';
            this.doc.appendChild(mm);
            this._closeTipIfParagraph();
            this.tip = mm;
            return;
        }

        // 5. Lists (Bullet and Ordered)
        let isListItem = false;
        let listType = null;
        let listStart = null;
        let listContent = '';

        if (blockGroup === 'bullet_list') {
            isListItem = true;
            listType = 'bullet';
            listContent = strippedLine.slice(blockMatch.groups.bullet_list.length);
        } else if (blockGroup === 'ordered_list') {
            isListItem = true;
            listType = 'ordered';
            const numMatch = /\d+/.exec(blockMatch.groups.ordered_list);
            listStart = numMatch ? parseInt(numMatch[0], 10) : 1;
            listContent = strippedLine.slice(blockMatch.groups.ordered_list.length);
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
                    } else if (this.indent >= listIndent) {
                        targetList = current;
                        break;
                    }
                }
                current = current.parent;
            }

            let lst;
            if (targetList !== null) {
                const targetIndent = targetList.indent || 0;
                if (
                    this.indent > targetIndent &&
                    targetList.lastChild &&
                    targetList.lastChild.type === 'item'
                ) {
                    // Nesting
                    lst = new Node('list');
                    lst.listType = listType;
                    lst.listStart = listStart;
                    lst.isOpen = true;
                    lst.indent = this.indent;
                    targetList.lastChild.appendChild(lst);
                    this.tip = lst;
                } else {
                    if (targetList.listType === listType) {
                        this.tip = targetList;
                        lst = targetList;
                    } else {
                        targetList.isOpen = false;
                        lst = new Node('list');
                        lst.listType = listType;
                        lst.listStart = listStart;
                        lst.isOpen = true;
                        lst.indent = this.indent;
                        if (targetList.parent) {
                            targetList.parent.appendChild(lst);
                        } else {
                            this.doc.appendChild(lst);
                        }
                        this.tip = lst;
                    }
                }
            } else {
                lst = new Node('list');
                lst.listType = listType;
                lst.listStart = listStart;
                lst.isOpen = true;
                lst.indent = this.indent;

                if (
                    this.tip &&
                    this.tip.isOpen &&
                    ['document', 'block_quote', 'item'].includes(this.tip.type)
                ) {
                    this.tip.appendChild(lst);
                } else if (this.tip && this.tip.parent) {
                    this.tip.parent.appendChild(lst);
                } else {
                    this.doc.appendChild(lst);
                }
                this.tip = lst;
            }

            const item = new Node('item');
            this.tip.appendChild(item);
            const p = new Node('paragraph');
            p.stringContent = listContent;
            item.appendChild(p);
            this.tip = p;
            return;
        }

        // 6. Simple Tables
        if (strippedLine.startsWith('|') && strippedLine.endsWith('|')) {
            if (!this.tip || this.tip.type !== 'table' || !this.tip.isOpen) {
                this._closeTipIfParagraph();
                const table = new Node('table');
                table.isOpen = true;
                this.doc.appendChild(table);
                this.tip = table;
            }

            // Separator row: |---|:---:|---| etc.
            if (/^\|[ \t\-:|]+\|[ \t]*$/.test(strippedLine)) {
                this.tip.headersDone = true;
                return;
            }

            const row = new Node('table_row');
            this.tip.appendChild(row);

            const cells = strippedLine.slice(1, -1).split('|').map(c => c.trim());
            for (const cellContent of cells) {
                const isHeader = !this.tip.headersDone;
                const cell = new Node(isHeader ? 'table_header' : 'table_cell');
                row.appendChild(cell);
                cell.stringContent = cellContent;
            }
            return;
        }

        // 7. HTML Blocks
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

        // 8. Paragraphs
        if (this.tip && this.tip.type === 'paragraph' && this.tip.isOpen) {
            this.tip.stringContent += '\n' + strippedLine;
        } else {
            const p = new Node('paragraph');
            p.stringContent = strippedLine;
            if (
                this.tip &&
                ['block_quote', 'item'].includes(this.tip.type) &&
                this.tip.isOpen
            ) {
                this.tip.appendChild(p);
            } else {
                this.doc.appendChild(p);
            }
            this.tip = p;
        }
    }

    _lastGroup(m) {
        if (!m || !m.groups) return null;
        for (const [name, val] of Object.entries(m.groups)) {
            if (val !== undefined) return name;
        }
        return null;
    }

    _closeTipIfParagraph() {
        if (this.tip && this.tip.type === 'paragraph') {
            this.tip.isOpen = false;
            this.tip = this.tip.parent;
        }
    }

    processInlines(doc) {
        for (const [node, entering] of doc.walker()) {
            if (
                entering &&
                ['paragraph', 'heading', 'table_cell', 'table_header', 'def_term'].includes(node.type) &&
                node.stringContent
            ) {
                this.inlineParser.parse(node);
            } else if (
                entering &&
                ['code_block', 'math_block', 'mermaid_block'].includes(node.type)
            ) {
                node.literal = node.stringContent;
                node.stringContent = '';
            }
        }
    }
}

module.exports = { InlineParser, Parser };
