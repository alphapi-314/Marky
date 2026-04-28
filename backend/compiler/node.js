'use strict';
class Node {
    constructor(node_type, sourcepos = null) {
        this.type = node_type;
        this.parent = null;
        this.first_child = null;
        this.last_child = null;
        this.prev = null;
        this.next = null;
        this.sourcepos = sourcepos;
        this.string_content = "";
        this.literal = null;
        this.destination = null;
        this.title = null;
        this.info = null;
        this.level = null;
        this.is_open = true;
    }

    append_child(child) {
        child.unlink();
        child.parent = this;
        if (this.last_child) {
            this.last_child.next = child;
            child.prev = this.last_child;
            this.last_child = child;
        } else {
            this.first_child = child;
            this.last_child = child;
        }
    }

    unlink() {
        if (this.prev) {
            this.prev.next = this.next;
        } else if (this.parent) {
            this.parent.first_child = this.next;
        }

        if (this.next) {
            this.next.prev = this.prev;
        } else if (this.parent) {
            this.parent.last_child = this.prev;
        }

        this.parent = null;
        this.next = null;
        this.prev = null;
    }

    insert_after(sibling) {
        sibling.unlink();
        sibling.next = this.next;
        if (sibling.next) {
            sibling.next.prev = sibling;
        }
        sibling.prev = this;
        this.next = sibling;
        sibling.parent = this.parent;
        if (!sibling.next && sibling.parent) {
            sibling.parent.last_child = sibling;
        }
    }

    *walker() {
        let current = this;
        let entering = true;
        while (current) {
            yield [current, entering];
            if (entering && current.first_child) {
                current = current.first_child;
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

    toObject() {
        let d = { type: this.type };

        if (this.literal !== null) d.literal = this.literal;
        if (this.level !== null) d.level = this.level;
        if (this.destination !== null) d.destination = this.destination;
        if (this.info !== null) d.info = this.info;
        if (this.title !== null) d.title = this.title;

        if (this.custom_id !== undefined && this.custom_id !== null) d.custom_id = this.custom_id;
        if (this.label !== undefined && this.label !== null) d.label = this.label;
        if (this.checked !== undefined && this.checked !== null) d.checked = this.checked;
        if (this.list_type !== undefined && this.list_type !== null) d.list_type = this.list_type;

        let children = [];
        let child = this.first_child;
        while (child) {
            children.push(child.toObject());
            child = child.next;
        }

        if (children.length > 0) {
            d.children = children;
        }

        return d;
    }

    toJSON() {
        return JSON.stringify(this.toObject(), null, 4);
    }
}

export { Node };
