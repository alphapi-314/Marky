'use strict';

class Token {
    constructor(type_, value, meta = null, indent = 0) {
        this.type = type_;
        this.value = value;
        this.meta = meta || {};
        this.indent = indent;
    }

    toString() {
        return `Token('${this.type}', '${this.value}', meta=${JSON.stringify(this.meta)})`;
    }
}

const BLANK = "BLANK";
const PARAGRAPH = "PARAGRAPH";
const ATX_HEADING = "ATX_HEADING";
const THEMATIC_BREAK = "THEMATIC_BREAK";
const BLOCKQUOTE = "BLOCKQUOTE";
const BULLET_LIST = "BULLET_LIST";
const ORDERED_LIST = "ORDERED_LIST";
const CODE_FENCE = "CODE_FENCE";
const CODE_FENCE_END = "CODE_FENCE_END";
const MATH_FENCE = "MATH_FENCE";
const MATH_FENCE_END = "MATH_FENCE_END";
const MERMAID_FENCE = "MERMAID_FENCE";
const MERMAID_CLOSE = "MERMAID_CLOSE";
const DETAILS_FENCE = "DETAILS_FENCE";
const FOOTNOTE_DEF = "FOOTNOTE_DEF";
const DEF_LIST_MARKER = "DEF_LIST_MARKER";
const TABLE_ROW = "TABLE_ROW";
const TABLE_SEP = "TABLE_SEP";
const HTML_BLOCK = "HTML_BLOCK";
const RAW_CONTENT = "RAW_CONTENT";

const IL_IMAGE = "IL_IMAGE";
const IL_LINK = "IL_LINK";
const IL_STRONG = "IL_STRONG";
const IL_EMPH = "IL_EMPH";
const IL_MARK = "IL_MARK";
const IL_UNDERLINE = "IL_UNDERLINE";
const IL_DEL = "IL_DEL";
const IL_SUB = "IL_SUB";
const IL_SUP = "IL_SUP";
const IL_CODE = "IL_CODE";
const IL_MATH = "IL_MATH";
const IL_FOOTNOTE_REF = "IL_FOOTNOTE_REF";
const IL_EMOJI = "IL_EMOJI";
const IL_TASK = "IL_TASK";
const IL_HTML = "IL_HTML";
const IL_EMAIL_LINK = "IL_EMAIL_LINK";
const IL_URI_LINK = "IL_URI_LINK";
const IL_ENTITY = "IL_ENTITY";
const IL_HARDBREAK = "IL_HARDBREAK";
const IL_SOFTBREAK = "IL_SOFTBREAK";
const IL_ESCAPED = "IL_ESCAPED";
const IL_TEXT = "IL_TEXT";
const IL_VIDEO = "IL_VIDEO";
const IL_AUDIO = "IL_AUDIO";

const reHtmlBlockOpen = [
    /^<(?:script|pre|textarea|style)(?:\s|>|$)/i,
    /^<!--/,
    /^<\?/,
    /^<![A-Za-z]/,
    /^<!\[CDATA\[/,
    /^<\/?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[123456]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|section|search|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|\/?>|$)/i,
    /^(?:<[A-Za-z][A-Za-z0-9-]*|<\/[A-Za-z][A-Za-z0-9-]*\s*>)\s*$/i
];

const block_token_pattern = new RegExp(
    '(?<thematic_break>^(?:\\*[ \\t]*){3,}$|^(?:_[ \\t]*){3,}$|^(?:-[ \\t]*){3,}$)|' +
    '(?<bullet_list>^\\s*[*+-]\\s+)|' +
    '(?<ordered_list>^\\s*(\\d{1,9})[.)]\\s+)|' +
    '(?<atx_heading>^#{1,6}(?:[ \\t]+|$))|' +
    '(?<code_fence>^`{3,}(?!.*`)|^~{3,})|' +
    '(?<math_fence>^\\$\\$[ \\t]*$)|' +
    '(?<mermaid_fence>^:::[ \\t]*mermaid[ \\t]*$)|' +
    '(?<details_fence>^:::[ \\t]*details(?:[ \\t]+(.*))?[ \\t]*$)|' +
    '(?<mermaid_close>^:::[ \\t]*$)|' +
    '(?<footnote_def>^\\[\\^([^\\]]+)\\]:[ \\t]*(.*))|' +
    '(?<def_list_marker>^:[ \\t]+(.*))'
);

const re_heading_id = /{#([^}]+)}\s*$/;
const re_line_ending = /\r\n|\n|\r/g;
const re_table_sep = /^\|[ \t\-:|]+\|[ \t]*$/;
const re_footnote = /^\[\^([^\]]+)\]:[ \t]*(.*)/;
const re_deflist = /^:[ \t]+(.*)/;
const re_ol_num = /\d+/;

const inline_token_pattern = new RegExp(
    '(&\\[.*?\\]\\(.*?\\))|' +
    '(@\\[.*?\\]\\(.*?\\))|' +
    '(!\\[.*?\\]\\(.*?\\))|' +
    '(\\[.*?\\]\\(.*?\\))|' +
    '(\\*\\*.*?\\*\\*|__.*?__)|' +
    '(\\*.*?\\*|_.*?_)|' +
    '(==.*?==)|' +
    '(\\+\\+.*?\\+\\+)|' +
    '(~~.*?~~)|' +
    '(~.*?~)|' +
    '(\\^.*?\\^)|' +
    '(`+.*?`+)|' +
    '(\\$.*?\\$)|' +
    '(\\[\\^[^\\]]+\\])|' +
    '(:[a-zA-Z0-9_\\-]+:)|' +
    '^(\\[[ xX]\\]|\\[ \\])|' +
    '(<[A-Za-z/].*?>)|' +
    '(<[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*>)|' +
    '(<[a-zA-Z][a-zA-Z0-9+.-]{1,31}:[^<>\\s]*>)|' +
    '(&[#a-zA-Z0-9]+;)|' +
    '(  \\n)|' +
    '(\\\\.)|' +
    '(\\n)|' +
    '([^!\\[\\]*_`<&\\n\\\\=+\\~^$: ]+)|' +
    '([!\\[\\]*_`<&\\n\\\\=+\\~^$: ])'
);

const CODE_INDENT = 4;

export {
    Token,
    BLANK, PARAGRAPH, ATX_HEADING, THEMATIC_BREAK, BLOCKQUOTE, BULLET_LIST, ORDERED_LIST,
    CODE_FENCE, CODE_FENCE_END, MATH_FENCE, MATH_FENCE_END, MERMAID_FENCE, MERMAID_CLOSE,
    DETAILS_FENCE, FOOTNOTE_DEF, DEF_LIST_MARKER, TABLE_ROW, TABLE_SEP, HTML_BLOCK, RAW_CONTENT,
    IL_IMAGE, IL_LINK, IL_STRONG, IL_EMPH, IL_MARK, IL_UNDERLINE, IL_DEL, IL_SUB, IL_SUP, IL_CODE,
    IL_MATH, IL_FOOTNOTE_REF, IL_EMOJI, IL_TASK, IL_HTML, IL_EMAIL_LINK, IL_URI_LINK, IL_ENTITY,
    IL_HARDBREAK, IL_SOFTBREAK, IL_ESCAPED, IL_TEXT, IL_VIDEO, IL_AUDIO,
    reHtmlBlockOpen, block_token_pattern, re_heading_id, re_line_ending, re_table_sep,
    re_footnote, re_deflist, re_ol_num, inline_token_pattern, CODE_INDENT
};
