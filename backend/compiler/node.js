'use strict';

class Node {
    constructor(nodeType, sourcepos = null) {
        this.type = nodeType;
        this.parent = null;
        this.firstChild = null;
        this.lastChild = null;
        this.prev = null;
        this.next = null;
        this.sourcepos = sourcepos;
        this.stringContent = '';
        this.literal = null;
        this.destination = null;
        this.title = null;
        this.info = null;
        this.level = null;
        this.isOpen = true;
    }

    appendChild(child) {
        child.unlink();
        child.parent = this;
        if (this.lastChild) {
            this.lastChild.next = child;
            child.prev = this.lastChild;
            this.lastChild = child;
        } else {
            this.firstChild = child;
            this.lastChild = child;
        }
    }

    unlink() {
        if (this.prev) {
            this.prev.next = this.next;
        } else if (this.parent) {
            this.parent.firstChild = this.next;
        }

        if (this.next) {
            this.next.prev = this.prev;
        } else if (this.parent) {
            this.parent.lastChild = this.prev;
        }

        this.parent = null;
        this.next = null;
        this.prev = null;
    }

    insertAfter(sibling) {
        sibling.unlink();
        sibling.next = this.next;
        if (sibling.next) {
            sibling.next.prev = sibling;
        }
        sibling.prev = this;
        this.next = sibling;
        sibling.parent = this.parent;
        if (!sibling.next && sibling.parent) {
            sibling.parent.lastChild = sibling;
        }
    }

    *walker() {
        let current = this;
        let entering = true;
        while (current) {
            yield [current, entering];
            if (entering && current.firstChild) {
                current = current.firstChild;
                entering = true;
            } else if (current === this) {
                break;
            } else if (!current.next) {
                current = current.parent;
                entering = false;
            } else {
                current = current.next;
                entering = true;
            }
        }
    }

    toJSON() {
        const d = { type: this.type };

        if (this.literal !== null) d.literal = this.literal;
        if (this.level !== null) d.level = this.level;
        if (this.destination !== null) d.destination = this.destination;
        if (this.info !== null) d.info = this.info;

        if (this.customId !== undefined && this.customId !== null) d.custom_id = this.customId;
        if (this.label !== undefined && this.label !== null) d.label = this.label;
        if (this.checked !== undefined && this.checked !== null) d.checked = this.checked;

        if (this.listType !== undefined && this.listType !== null) d.list_type = this.listType;
        if (this.listStart !== undefined && this.listStart !== null) d.list_start = this.listStart;

        const children = [];
        let child = this.firstChild;
        while (child) {
            children.push(JSON.parse(child.toJSON()));
            child = child.next;
        }
        if (children.length > 0) d.children = children;

        return JSON.stringify(d, null, 2);
    }
}

module.exports = { Node };
