/**
 * XML parser (zero-deps) — converts XML string into JS object with preserved order.
 * @module lib/parser
 */

const { isWhitespace, typeCast } = require('./utils');

/**
 * Synchronously parse XML string into JS object.
 * @function parse
 * @param {string} xml
 * @param {Object} [opts]
 * @param {boolean} [opts.explicitArray=true]
 * @param {boolean} [opts.mergeAttrs=true]
 * @param {boolean} [opts.typeCast=true]
 * @returns {Object}
 */
function parse(xml, opts = {})
{
    const explicitArray = opts.explicitArray !== undefined ? !!opts.explicitArray : true;
    const mergeAttrs = opts.mergeAttrs !== undefined ? !!opts.mergeAttrs : true;
    const doTypeCast = opts.typeCast !== undefined ? opts.typeCast : true;

    let i = 0;
    const len = xml.length;
    const stack = [];
    const root = { name: '__root__', children: [] };
    stack.push(root);

    while (i < len)
    {
        if (xml.startsWith('<!--', i))
        {
            const end = xml.indexOf('-->', i + 4);
            const comment = xml.substring(i + 4, end === -1 ? len : end);
            stack[stack.length - 1].children.push({ type: 'comment', text: comment });
            i = end === -1 ? len : end + 3;
            continue;
        }
        if (xml.startsWith('<![CDATA[', i))
        {
            const end = xml.indexOf(']]>', i + 9);
            const cdata = xml.substring(i + 9, end === -1 ? len : end);
            stack[stack.length - 1].children.push({ type: 'cdata', text: cdata });
            i = end === -1 ? len : end + 3;
            continue;
        }
        if (xml.startsWith('<?', i))
        {
            const end = xml.indexOf('?>', i + 2);
            i = end === -1 ? len : end + 2;
            continue;
        }

        if (xml[i] === '<')
        {
            if (xml[i + 1] === '/')
            {
                const closePos = xml.indexOf('>', i + 2);
                const tagName = xml.substring(i + 2, closePos).trim().split(/\s+/)[0];
                let popped = stack.pop();
                while (popped && popped.name !== tagName && stack.length) popped = stack.pop();
                i = closePos + 1;
                continue;
            }

            const gt = xml.indexOf('>', i + 1);
            if (gt === -1) break;
            const rawTag = xml.substring(i + 1, gt);
            const selfClosing = rawTag.endsWith('/');
            const tagContent = selfClosing ? rawTag.slice(0, -1) : rawTag;
            const parts = tagContent.trim().split(/\s+/);
            const tagName = parts.shift();

            const attrs = {};
            const attrStr = tagContent.slice(tagName.length);
            const attrRegex = /([\w:\-\.]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
            let m;
            while ((m = attrRegex.exec(attrStr)))
            {
                const key = m[1];
                const val = m[2] !== undefined ? m[2] : (m[3] !== undefined ? m[3] : m[4]);
                attrs[key] = doTypeCast ? typeCast(val, typeof doTypeCast === 'object' ? doTypeCast : {}) : val;
            }

            const node = { name: tagName, attrs: attrs, children: [] };
            stack[stack.length - 1].children.push(node);

            if (!selfClosing) stack.push(node);

            i = gt + 1;
            continue;
        }

        const nextTag = xml.indexOf('<', i);
        const text = xml.substring(i, nextTag === -1 ? len : nextTag);
        if (!isWhitespace(text))
        {
            const txt = text.trim();
            stack[stack.length - 1].children.push({ type: 'text', text: doTypeCast ? typeCast(txt, typeof doTypeCast === 'object' ? doTypeCast : {}) : txt });
        }
        i = nextTag === -1 ? len : nextTag;
    }

    function nodeToObject(node)
    {
        const result = {};
        if (mergeAttrs && Object.keys(node.attrs).length) result.$ = node.attrs;

        const childrenArray = [];
        for (const ch of node.children)
        {
            if (ch.type === 'text') childrenArray.push({ type: 'text', text: ch.text });
            else if (ch.type === 'cdata') childrenArray.push({ type: 'cdata', text: ch.text });
            else if (ch.type === 'comment') childrenArray.push({ type: 'comment', text: ch.text });
            else
            {
                const obj = nodeToObject(ch);
                obj.__name = ch.name;
                childrenArray.push(obj);
                if (!result[ch.name]) result[ch.name] = [];
                result[ch.name].push(obj);
            }
        }

        if (childrenArray.length) result['#children'] = childrenArray;
        return result;
    }

    const out = {};
    for (const child of root.children)
    {
        if (child.name)
        {
            const obj = nodeToObject(child);
            if (!out[child.name]) out[child.name] = [];
            out[child.name].push(obj);
        }
    }

    if (!explicitArray)
    {
        for (const k of Object.keys(out))
        {
            if (Array.isArray(out[k]) && out[k].length === 1) out[k] = out[k][0];
        }
    }

    return out;
}

/**
 * Callback-style parseString(xml, [opts], cb)
 * @function parseString
 * @param {string} xml
 * @param {Object|Function} [opts]
 * @param {Function} [cb]
 */
function parseString(xml, opts, cb)
{
    if (typeof opts === 'function') { cb = opts; opts = {}; }
    try
    {
        const res = parse(xml, opts || {});
        if (cb) return cb(null, res);
        return res;
    } catch (err)
    {
        if (cb) return cb(err);
        throw err;
    }
}

module.exports = { parse, parseString };
