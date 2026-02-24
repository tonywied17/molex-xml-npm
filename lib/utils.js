/**
 * Utilities for molex-xml
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

module.exports = { isWhitespace, typeCast };
