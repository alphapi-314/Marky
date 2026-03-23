import { Node } from "./node";
import { inlineTokenPattern } from "./regex_rules";

export function unescapeHtml(text) {
    return text.replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&');
}

export class InlineParser {
    subject = "";
    pos = 0;
    parse(blockNode) {
        this.subject = (blockNode.stringContent || "").trim();
        this.pos = 0;
        this.parseInlines(blockNode);
        blockNode.stringContent = "";
    }
    parseInlines(block) {
        inlineTokenPattern.lastIndex = 0;
        let m;
        while ((m = inlineTokenPattern.exec(this.subject)) !== null) {
            const token = m[0];
            if (!token)
                continue;
            if (token.startsWith('![') && token.includes('](') && token.endsWith(')')) {
                const node = new Node('image');
                const parts = token.substring(2).split('](');
                const label = parts[0];
                const dest = parts[1].substring(0, parts[1].length - 1);
                node.destination = dest;
                node.title = label;
                const textChild = new Node('text');
                textChild.literal = label;
                node.appendChild(textChild);
                block.appendChild(node);
            }
            else if (token.startsWith('[') && token.includes('](') && token.endsWith(')')) {
                const node = new Node('link');
                const parts = token.substring(1).split('](');
                const label = parts[0];
                const dest = parts[1].substring(0, parts[1].length - 1);
                node.destination = dest;
                const textChild = new Node('text');
                textChild.literal = label;
                node.appendChild(textChild);
                block.appendChild(node);
            }
            else if ((token.startsWith('**') && token.endsWith('**')) || (token.startsWith('__') && token.endsWith('__'))) {
                const node = new Node('strong');
                const textChild = new Node('text');
                textChild.literal = token.substring(2, token.length - 2);
                node.appendChild(textChild);
                block.appendChild(node);
            }
            else if ((token.startsWith('*') && token.endsWith('*')) || (token.startsWith('_') && token.endsWith('_'))) {
                const node = new Node('emph');
                const textChild = new Node('text');
                textChild.literal = token.substring(1, token.length - 1);
                node.appendChild(textChild);
                block.appendChild(node);
            }
            else if (token.startsWith('==') && token.endsWith('==')) {
                const node = new Node('mark');
                const textChild = new Node('text');
                textChild.literal = token.substring(2, token.length - 2);
                node.appendChild(textChild);
                block.appendChild(node);
            }
            else if (token.startsWith('++') && token.endsWith('++')) {
                const node = new Node('u');
                const textChild = new Node('text');
                textChild.literal = token.substring(2, token.length - 2);
                node.appendChild(textChild);
                block.appendChild(node);
            }
            else if (token.startsWith('~~') && token.endsWith('~~')) {
                const node = new Node('del');
                const textChild = new Node('text');
                textChild.literal = token.substring(2, token.length - 2);
                node.appendChild(textChild);
                block.appendChild(node);
            }
            else if (token.startsWith('~') && token.endsWith('~')) {
                const node = new Node('sub');
                const textChild = new Node('text');
                textChild.literal = token.substring(1, token.length - 1);
                node.appendChild(textChild);
                block.appendChild(node);
            }
            else if (token.startsWith('^') && token.endsWith('^')) {
                const node = new Node('sup');
                const textChild = new Node('text');
                textChild.literal = token.substring(1, token.length - 1);
                node.appendChild(textChild);
                block.appendChild(node);
            }
            else if (token.startsWith('$') && token.endsWith('$')) {
                const node = new Node('math_inline');
                node.literal = token.substring(1, token.length - 1);
                block.appendChild(node);
            }
            else if (token.startsWith('[^') && token.endsWith(']')) {
                const node = new Node('footnote_ref');
                node.label = token.substring(2, token.length - 1);
                block.appendChild(node);
            }
            else if (token.startsWith(':') && token.endsWith(':')) {
                const node = new Node('emoji');
                node.literal = token;
                block.appendChild(node);
            }
            else if (['[ ]', '[x]', '[X]'].includes(token)) {
                const node = new Node('task_checkbox');
                node.checked = token.toLowerCase() === '[x]';
                block.appendChild(node);
            }
            else if (token.startsWith('`') && token.endsWith('`')) {
                const node = new Node('code');
                const matchLen = token.match(/^`+/)?.[0].length || 1;
                node.literal = token.substring(matchLen, token.length - matchLen).trim();
                block.appendChild(node);
            }
            else if (token.startsWith('<') && token.endsWith('>') && !token.startsWith('</') && token.includes('@') && !token.includes(' ')) {
                const dest = token.substring(1, token.length - 1);
                const node = new Node('link');
                node.destination = 'mailto:' + dest;
                const textChild = new Node('text');
                textChild.literal = dest;
                node.appendChild(textChild);
                block.appendChild(node);
            }
            else if (token.startsWith('<') && token.endsWith('>') && token.includes(':') && !token.startsWith('</') && !token.includes(' ')) {
                const dest = token.substring(1, token.length - 1);
                const node = new Node('link');
                node.destination = encodeURI(dest);
                const textChild = new Node('text');
                textChild.literal = dest;
                node.appendChild(textChild);
                block.appendChild(node);
            }
            else if (token.startsWith('<') && token.endsWith('>')) {
                const node = new Node('html_inline');
                node.literal = token;
                block.appendChild(node);
            }
            else if (token.startsWith('&') && token.endsWith(';')) {
                const node = new Node('text');
                node.literal = unescapeHtml(token);
                block.appendChild(node);
            }
            else if (token === '  \n') {
                const node = new Node('hardbreak');
                block.appendChild(node);
            }
            else if (token.startsWith('\\') && token.length === 2) {
                const node = new Node('text');
                node.literal = token[1];
                block.appendChild(node);
            }
            else if (token === '\n') {
                const node = new Node('softbreak');
                block.appendChild(node);
            }
            else {
                const node = new Node('text');
                node.literal = token;
                block.appendChild(node);
            }
        }
    }
}
