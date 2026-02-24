/**
 * XML builder — converts parsed object back to XML string.
 * @module lib/builder
 */

/**
 * Builder class to serialize JS objects into XML strings.
 * @class Builder
 * @param {Object} [opts]
 * @param {boolean} [opts.headless=false] omit XML prolog when true
 */
class Builder
{
    constructor(opts = {})
    {
        this.headless = !!opts.headless;
        this.renderOpts = opts;
    }

    /**
     * Escape attribute values.
     * @private
     * @param {any} s
     * @returns {string}
     */
    _escapeAttr(s)
    {
        return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    /**
     * Build an XML string from the root object.
     * @param {Object} obj
     * @returns {string}
     */
    buildObject(obj)
    {
        const parts = [];
        if (!this.headless) parts.push('<?xml version="1.0" encoding="UTF-8"?>');

        for (const k of Object.keys(obj))
        {
            const val = obj[k];
            const items = Array.isArray(val) ? val : [val];
            for (const item of items) parts.push(this.buildElement(k, item));
        }

        return parts.join('\n');
    }

    /**
     * Build a single element by name from the node object.
     * @param {string} name
     * @param {Object} node
     * @returns {string}
     */
    buildElement(name, node)
    {
        const attrs = node.$ || {};
        const attrPairs = Object.keys(attrs).map(a => `${a}="${this._escapeAttr(attrs[a])}"`).join(' ');
        const open = attrPairs ? `<${name} ${attrPairs}>` : `<${name}>`;

        const children = node['#children'];
        if (!children || children.length === 0)
        {
            return open.replace(/>$/, '/>');
        }

        const inner = children.map(ch =>
        {
            if (ch.type === 'text') return String(ch.text);
            if (ch.type === 'cdata') return `<![CDATA[${ch.text}]]>`;
            if (ch.type === 'comment') return `<!--${ch.text}-->`;
            const ename = ch.__name || Object.keys(ch)[0];
            return this.buildElement(ename, ch);
        }).join('');

        return `${open}${inner}</${name}>`;
    }
}

module.exports = { Builder };
