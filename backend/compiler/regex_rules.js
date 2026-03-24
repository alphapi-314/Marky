'use strict';

const reHtmlBlockOpen = [
    /^<(?:script|pre|textarea|style)(?:\s|>|$)/i,
    /^<!--/,
    /^<\?/,
    /^<![A-Za-z]/,
    /^<!\[CDATA\[/,
    /^<\/?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[123456]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|section|search|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|\/?> |$)/i,
    /^(?:<[A-Za-z][A-Za-z0-9-]*|<\/[A-Za-z][A-Za-z0-9-]*\s*>)\s*$/i,
];

const blockTokenPattern = new RegExp(
    '(?<thematic_break>^(?:\\*[ \\t]*){3,}$|^(?:_[ \\t]*){3,}$|^(?:-[ \\t]*){3,}$)|' +
    '(?<bullet_list>^\\s*[*+\\-]\\s+)|' +
    '(?<ordered_list>^\\s*(\\d{1,9})[.)]\\s+)|' +
    '(?<atx_heading>^#{1,6}(?:[ \\t]+|$))|' +
    '(?<code_fence>^`{3,}(?!.*`)|^~{3,})|' +
    '(?<math_fence>^\\$\\$[ \\t]*$)|' +
    '(?<mermaid_fence>^:::[ \\t]+mermaid[ \\t]*$)|' +
    '(?<mermaid_close>^:::[ \\t]*$)|' +
    '(?<footnote_def>^\\[\\^([^\\]]+)\\]:[ \\t]*(.*))|' +
    '(?<def_list_marker>^:[ \\t]+(.*))'
);

const reHeadingID = /\{#([^}]+)\}\s*$/;

const reLineEnding = /\r\n|\n|\r/;

const inlineTokenPattern = new RegExp(
    '(!\\[.*?\\]\\(.*?\\))|' +  // Image: ![alt](url)
    '(\\[.*?\\]\\(.*?\\))|' +  // Link: [label](url)
    '(\\*\\*.*?\\*\\*|__.*?__)|' +  // Strong: **text** or __text__
    '(\\*.*?\\*|_.*?_)|' +  // Emph: *text* or _text_
    '(==.*?==)|' +  // Highlight: ==text==
    '(\\+\\+.*?\\+\\+)|' +  // Underline: ++text++
    '(~~.*?~~)|' +  // Strikethrough: ~~text~~
    '(~.*?~)|' +  // Subscript: ~text~
    '(\\^.*?\\^)|' +  // Superscript: ^text^
    '(`+.*?`+)|' +  // Inline code
    '(\\$.*?\\$)|' +  // Inline Math: $equation$
    '(\\[\\^[^\\]]+\\])|' +  // Footnote Ref: [^label]
    '(:[a-zA-Z0-9_\\-]+:)|' +  // Emoji Shortcode: :emoji:
    '^(\\[[ xX]\\]|\\[ \\])|' +  // Task list checkboxes at start
    '(<[A-Za-z\\/].*?>)|' +  // HTML inline tags
    '(<[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~\\-]+@[a-zA-Z0-9\\-]+(?:\\.[a-zA-Z0-9\\-]+)*>)|' + // Email Autolink
    '(<[a-zA-Z][a-zA-Z0-9+.\\-]{1,31}:[^<>\\s]*>)|' + // URL Autolink
    '(&[#a-zA-Z0-9]+;)|' +  // HTML Entity
    '(  \\n)|' +  // Hard line break
    '(\\\\.|' +                            // Escaped char (combined with next)
    '(\\n)|' +                            // Newlines
    '([^!\\[\\]*_`<&\\n\\\\=+~^$: ]+)|' + // Plain text
    '([!\\[\\]*_`<&\\n\\\\=+~^$: ]))'     // Single special char fallback
    ,
    'g'
);

const CODE_INDENT = 4;

module.exports = {
    reHtmlBlockOpen,
    blockTokenPattern,
    reHeadingID,
    reLineEnding,
    inlineTokenPattern,
    CODE_INDENT,
};
