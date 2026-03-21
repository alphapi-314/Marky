export class Node {
    type;
    parent = null;
    firstChild = null;
    lastChild = null;
    prev = null;
    next = null;
    sourcepos;
    stringContent = "";
    literal = null;
    destination = null;
    title = null;
    info = null;
    level = null;
    isOpen = true;
    customId;
    label;
    checked;
    listType;
    listStart;
    isFenced;
    fenceChar;
    fenceLength;
    headersDone;
    indent;
    constructor(nodeType, sourcepos = null) {
        this.type = nodeType;
        this.sourcepos = sourcepos;
    }
    appendChild(child) {
        child.unlink();
        child.parent = this;
        if (this.lastChild) {
            this.lastChild.next = child;
            child.prev = this.lastChild;
            this.lastChild = child;
        }
        else {
            this.firstChild = child;
            this.lastChild = child;
        }
    }
    unlink() {
        if (this.prev) {
            this.prev.next = this.next;
        }
        else if (this.parent) {
            this.parent.firstChild = this.next;
        }
        if (this.next) {
            this.next.prev = this.prev;
        }
        else if (this.parent) {
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
            }
            else if (current === this) {
                break;
            }
            else if (!current.next) {
                current = current.parent;
                entering = false;
            }
            else {
                current = current.next;
                entering = true;
            }
        }
    }
    toJSON() {
        const obj = { type: this.type };
        if (this.literal !== null)
            obj["literal"] = this.literal;
        if (this.level !== null)
            obj["level"] = this.level;
        if (this.destination !== null)
            obj["destination"] = this.destination;
        if (this.info !== null)
            obj["info"] = this.info;
        if (this.customId !== undefined)
            obj["custom_id"] = this.customId;
        if (this.label !== undefined)
            obj["label"] = this.label;
        if (this.checked !== undefined)
            obj["checked"] = this.checked;
        if (this.listType !== undefined)
            obj["list_type"] = this.listType;
        if (this.listStart !== undefined)
            obj["list_start"] = this.listStart;
        const children = [];
        let child = this.firstChild;
        while (child) {
            children.push(child.toJSON());
            child = child.next;
        }
        if (children.length > 0) {
            obj["children"] = children;
        }
        return obj;
    }
}
