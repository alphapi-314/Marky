'use strict';

import {
    Token,
    BLANK, PARAGRAPH, ATX_HEADING, THEMATIC_BREAK, BLOCKQUOTE, BULLET_LIST, ORDERED_LIST,
    CODE_FENCE, CODE_FENCE_END, MATH_FENCE, MATH_FENCE_END, MERMAID_FENCE, MERMAID_CLOSE,
    DETAILS_FENCE, FOOTNOTE_DEF, DEF_LIST_MARKER, TABLE_ROW, TABLE_SEP, HTML_BLOCK, RAW_CONTENT,
    IL_IMAGE, IL_LINK, IL_STRONG, IL_EMPH, IL_MARK, IL_UNDERLINE, IL_DEL, IL_SUB, IL_SUP, IL_CODE,
    IL_MATH, IL_FOOTNOTE_REF, IL_EMOJI, IL_TASK, IL_HTML, IL_EMAIL_LINK, IL_URI_LINK, IL_ENTITY,
    IL_HARDBREAK, IL_SOFTBREAK, IL_ESCAPED, IL_TEXT, IL_VIDEO, IL_AUDIO,
    reHtmlBlockOpen, block_token_pattern, re_heading_id, re_line_ending, re_table_sep,
    re_footnote, re_deflist, re_ol_num, inline_token_pattern, CODE_INDENT
} from './lex_token.js';

class Lexer {
    tokenize(text) {
        let lines = text.split(re_line_ending);
        if (text && text[text.length - 1] === '\n') {
            lines.pop();
        }

        let tokens = [];
        let in_fence = false;
        let fence_block_type = null;
        let fence_char = null;
        let fence_length = 0;

        for (let line of lines) {
            let stripped = line.trimStart();
            let indent = line.length - stripped.length;
            let blank = stripped.length === 0;

            let block_match = stripped.match(block_token_pattern);
            let bg = null;
            if (block_match && block_match.groups) {
                for (let key in block_match.groups) {
                    if (block_match.groups[key] !== undefined) {
                        bg = key;
                        break;
                    }
                }
            }

            if (in_fence) {
                if (fence_block_type === 'code_block') {
                    if (bg === 'code_fence' && block_match.groups['code_fence'][0] === fence_char &&
                        block_match.groups['code_fence'].length >= fence_length) {
                        tokens.push(new Token(CODE_FENCE_END, stripped, null, indent));
                        in_fence = false;
                        continue;
                    }
                } else if (fence_block_type === 'math_block') {
                    if (bg === 'math_fence') {
                        tokens.push(new Token(MATH_FENCE_END, stripped, null, indent));
                        in_fence = false;
                        continue;
                    }
                } else if (fence_block_type === 'mermaid_block' || fence_block_type === 'details') {
                    if (fence_char === null && bg === 'mermaid_close') {
                        tokens.push(new Token(MERMAID_CLOSE, stripped, null, indent));
                        in_fence = false;
                        continue;
                    } else if (fence_char !== null && bg === 'code_fence' &&
                        block_match.groups['code_fence'][0] === fence_char &&
                        block_match.groups['code_fence'].length >= fence_length) {
                        tokens.push(new Token(CODE_FENCE_END, stripped, null, indent));
                        in_fence = false;
                        continue;
                    }
                }

                tokens.push(new Token(RAW_CONTENT, line, null, indent));
                continue;
            }

            if (blank) {
                tokens.push(new Token(BLANK, line, null, indent));
                continue;
            }

            if (stripped.startsWith('>')) {
                let content = stripped.substring(1);
                if (content.startsWith(' ')) {
                    content = content.substring(1);
                }
                tokens.push(new Token(BLOCKQUOTE, stripped, { content: content }, indent));
                continue;
            }

            if (bg === 'atx_heading') {
                let heading_text = block_match.groups['atx_heading'].trim();
                let level = heading_text.length;
                let raw_content = stripped.substring(level).trim().replace(/#+$/, '').trim();
                let custom_id = null;
                let id_match = raw_content.match(re_heading_id);
                if (id_match) {
                    custom_id = id_match[1];
                    raw_content = raw_content.substring(0, id_match.index).trim();
                }
                tokens.push(new Token(ATX_HEADING, stripped, { level: level, content: raw_content, custom_id: custom_id }, indent));
                continue;
            }

            if (bg === 'thematic_break') {
                tokens.push(new Token(THEMATIC_BREAK, stripped, null, indent));
                continue;
            }

            if (bg === 'footnote_def') {
                let m = stripped.match(re_footnote);
                let label = m ? m[1] : "unknown";
                let content = m ? m[2] : "";
                tokens.push(new Token(FOOTNOTE_DEF, stripped, { label: label, content: content }, indent));
                continue;
            }

            if (bg === 'def_list_marker') {
                let m = stripped.match(re_deflist);
                let content = m ? m[1] : "";
                tokens.push(new Token(DEF_LIST_MARKER, stripped, { content: content }, indent));
                continue;
            }

            if (bg === 'code_fence') {
                let fc = block_match.groups['code_fence'][0];
                let fl = block_match.groups['code_fence'].length;
                let info = stripped.substring(fl).trim();
                let btype = info.toLowerCase() === 'mermaid' ? 'mermaid_block' : 'code_block';
                in_fence = true;
                fence_block_type = btype;
                fence_char = fc;
                fence_length = fl;
                tokens.push(new Token(CODE_FENCE, stripped, { fence_char: fc, fence_length: fl, info: info, block_type: btype }, indent));
                continue;
            }

            if (bg === 'math_fence') {
                in_fence = true;
                fence_block_type = 'math_block';
                tokens.push(new Token(MATH_FENCE, stripped, null, indent));
                continue;
            }

            if (bg === 'mermaid_fence') {
                in_fence = true;
                fence_block_type = 'mermaid_block';
                fence_char = null;
                tokens.push(new Token(MERMAID_FENCE, stripped, null, indent));
                continue;
            }

            if (bg === 'details_fence') {
                let title = stripped.substring(':::details'.length).trim();
                in_fence = true;
                fence_block_type = 'details';
                fence_char = null;
                tokens.push(new Token(DETAILS_FENCE, stripped, { title: title }, indent));
                continue;
            }

            if (bg === 'bullet_list') {
                let marker = block_match.groups['bullet_list'];
                let content = stripped.substring(marker.length);
                tokens.push(new Token(BULLET_LIST, stripped, { list_type: 'bullet', content: content }, indent));
                continue;
            }

            if (bg === 'ordered_list') {
                let marker = block_match.groups['ordered_list'];
                let start_num = parseInt(marker.match(re_ol_num)[0], 10);
                let content = stripped.substring(marker.length);
                tokens.push(new Token(ORDERED_LIST, stripped, { list_type: 'ordered', list_start: start_num, content: content }, indent));
                continue;
            }

            if (stripped.startsWith('|') && stripped.endsWith('|')) {
                if (re_table_sep.test(stripped)) {
                    tokens.push(new Token(TABLE_SEP, stripped, null, indent));
                } else {
                    let parts = stripped.split(/(?<!\\)\|/);
                    let cells = [];
                    for (let p of parts) {
                        let c = p.trim();
                        if (c) {
                            cells.push(c.replace(/\\\|/g, '|'));
                        }
                    }
                    tokens.push(new Token(TABLE_ROW, stripped, { cells: cells }, indent));
                }
                continue;
            }

            let matched_html = false;
            for (let pattern of reHtmlBlockOpen) {
                if (pattern.test(stripped)) {
                    tokens.push(new Token(HTML_BLOCK, line, null, indent));
                    matched_html = true;
                    break;
                }
            }
            if (!matched_html) {
                tokens.push(new Token(PARAGRAPH, stripped, null, indent));
            }
        }

        return tokens;
    }

    tokenize_inline(text) {
        let tokens = [];
        let local_inline_pattern = new RegExp(inline_token_pattern, 'g');
        let matches = [...text.matchAll(local_inline_pattern)];

        for (let m of matches) {
            let raw = m[0];
            if (!raw) continue;

            let tok_type = this._classify_inline(raw);
            let meta = this._inline_meta(raw, tok_type);
            tokens.push(new Token(tok_type, raw, meta));
        }

        return tokens;
    }

    _classify_inline(token) {
        if (token.startsWith('&[') && token.includes('](') && token.endsWith(')')) return IL_AUDIO;
        if (token.startsWith('@[') && token.includes('](') && token.endsWith(')')) return IL_VIDEO;
        if (token.startsWith('![') && token.includes('](') && token.endsWith(')')) return IL_IMAGE;
        if (token.startsWith('[') && token.includes('](') && token.endsWith(')')) return IL_LINK;
        if (token.length >= 4 && ((token.startsWith('**') && token.endsWith('**')) || (token.startsWith('__') && token.endsWith('__')))) return IL_STRONG;
        if (token.length >= 2 && ((token.startsWith('*') && token.endsWith('*')) || (token.startsWith('_') && token.endsWith('_')))) return IL_EMPH;
        if (token.length >= 4 && token.startsWith('==') && token.endsWith('==')) return IL_MARK;
        if (token.length >= 4 && token.startsWith('++') && token.endsWith('++')) return IL_UNDERLINE;
        if (token.length >= 4 && token.startsWith('~~') && token.endsWith('~~')) return IL_DEL;
        if (token.length >= 2 && token.startsWith('~') && token.endsWith('~')) return IL_SUB;
        if (token.length >= 2 && token.startsWith('^') && token.endsWith('^')) return IL_SUP;
        if (token.startsWith('`') && token.endsWith('`')) return IL_CODE;
        if (token.startsWith('$') && token.endsWith('$')) return IL_MATH;
        if (token.startsWith('[^') && token.endsWith(']')) return IL_FOOTNOTE_REF;
        if (token.startsWith(':') && token.endsWith(':')) return IL_EMOJI;
        if (token === '[ ]' || token === '[x]' || token === '[X]') return IL_TASK;
        if (token.startsWith('<') && token.endsWith('>')) {
            let inner = token.substring(1, token.length - 1);
            if (!token.startsWith('</') && inner.includes('@') && !inner.includes(' ')) return IL_EMAIL_LINK;
            if (!token.startsWith('</') && inner.includes(':') && !inner.includes(' ')) return IL_URI_LINK;
            return IL_HTML;
        }
        if (token.startsWith('&') && token.endsWith(';')) return IL_ENTITY;
        if (token === '  \n') return IL_HARDBREAK;
        if (token === '\n') return IL_SOFTBREAK;
        if (token.startsWith('\\') && token.length === 2) return IL_ESCAPED;
        return IL_TEXT;
    }

    _inline_meta(token, type_) {
        if (type_ === IL_AUDIO) {
            let split_idx = token.substring(2).indexOf('](');
            let label = token.substring(2, 2 + split_idx);
            let dest = token.substring(2 + split_idx + 2, token.length - 1);
            return { label: label, dest: dest };
        }
        if (type_ === IL_VIDEO) {
            let split_idx = token.substring(2).indexOf('](');
            let label = token.substring(2, 2 + split_idx);
            let dest = token.substring(2 + split_idx + 2, token.length - 1);
            return { label: label, dest: dest };
        }
        if (type_ === IL_IMAGE) {
            let split_idx = token.substring(2).indexOf('](');
            let label = token.substring(2, 2 + split_idx);
            let dest = token.substring(2 + split_idx + 2, token.length - 1);
            return { label: label, dest: dest };
        }
        if (type_ === IL_LINK) {
            let split_idx = token.substring(1).indexOf('](');
            let label = token.substring(1, 1 + split_idx);
            let dest = token.substring(1 + split_idx + 2, token.length - 1);
            return { label: label, dest: dest };
        }
        if ([IL_STRONG, IL_MARK, IL_UNDERLINE, IL_DEL].includes(type_)) {
            return { text: token.substring(2, token.length - 2) };
        }
        if ([IL_EMPH, IL_SUB, IL_SUP, IL_MATH].includes(type_)) {
            return { text: token.substring(1, token.length - 1) };
        }
        if (type_ === IL_CODE) {
            let m = token.match(/^`+/);
            let strip_len = m ? m[0].length : 0;
            return { text: token.substring(strip_len, token.length - strip_len).trim() };
        }
        if (type_ === IL_FOOTNOTE_REF) {
            return { label: token.substring(2, token.length - 1) };
        }
        if (type_ === IL_EMAIL_LINK || type_ === IL_URI_LINK) {
            return { dest: token.substring(1, token.length - 1) };
        }
        if (type_ === IL_TASK) {
            return { checked: token.toLowerCase() === '[x]' };
        }
        if (type_ === IL_ESCAPED) {
            return { char: token[1] };
        }
        return {};
    }
}

export { Lexer };
