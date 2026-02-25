/**
 * Utilities for molex-xml-npm
 * @module lib/utils
 */

/**
 * Check if a string is only whitespace characters.
 * @function isWhitespace
 * @param {string} s
 * @returns {boolean}
 */
function isWhitespace(s)
{
    return /^[\s\n\r\t]*$/.test(s);
}

/**
 * Basic type casting for text and attribute values.
 * Converts "true"/"false" to booleans and numeric strings to numbers.
 * @function typeCast
 * @param {string} value
 * @returns {string|number|boolean}
 */
function typeCast(value, opts = {})
{
    const { parseJSON = true, parseDates = true, coerceNull = true } = opts;

    if (value === null || value === undefined) return value;
    if (typeof value !== 'string') return value;

    const raw = value.trim();
    if (raw === '') return '';

    const lower = raw.toLowerCase();
    if (lower === 'true') return true;
    if (lower === 'false') return false;
    if (coerceNull && lower === 'null') return null;

    // JSON objects/arrays
    if (parseJSON && (raw[0] === '{' || raw[0] === '[')) {
        try {
            return JSON.parse(raw);
        } catch (e) {
            // fall through to other parsing rules
        }
    }

    // Hexadecimal
    if (/^0x[0-9a-f]+$/i.test(raw)) return parseInt(raw, 16);

    // Scientific notation
    if (/^[-+]?\d+(?:\.\d+)?[eE][-+]?\d+$/.test(raw)) return Number(raw);

    // Integer
    if (/^[-+]?\d+$/.test(raw)) {
        const n = parseInt(raw, 10);
        if (String(n) === raw || String(n) === raw.replace(/^\+/, '')) return n;
    }

    // Float
    if (/^[-+]?\d*\.\d+$/.test(raw)) return parseFloat(raw);

    // ISO 8601 date-ish detection
    if (parseDates && /^\d{4}-\d{2}-\d{2}(?:[Tt ]\d{2}:\d{2}:?\d{0,2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?$/.test(raw)) {
        const d = new Date(raw);
        if (!Number.isNaN(d.getTime())) return d;
    }

    return value;
}

// Helper: extract first string from various XML-parsed value shapes
function extractString(val)
{
    if (val == null) return null;
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    if (Array.isArray(val))
    {
        for (const it of val)
        {
            // prefer children that carry a .text field (text/cdata nodes)
            if (it && typeof it === 'object' && typeof it.text === 'string') return it.text;
            const s = extractString(it); if (s) return s;
        }
        return null;
    }
    if (typeof val === 'object')
    {
        // prefer explicit text fields (from parser's text/cdata nodes)
        if (typeof val.text === 'string') return val.text;
        if (val._ && typeof val._ === 'string') return val._;
        if (val['#text'] && typeof val['#text'] === 'string') return val['#text'];
        // handle parser's #children array specially
        if (Array.isArray(val['#children']))
        {
            for (const ch of val['#children'])
            {
                if (ch && typeof ch === 'object' && typeof ch.text === 'string') return ch.text;
                const s = extractString(ch); if (s) return s;
            }
        }
        // try shallow properties but skip generic 'type' keys to avoid returning 'cdata'
        for (const k of Object.keys(val))
        {
            if (k === 'type') continue;
            const s = extractString(val[k]); if (s) return s;
        }
        return null;
    }
    return null;
}

module.exports = { isWhitespace, typeCast, extractString };
