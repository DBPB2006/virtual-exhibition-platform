/**
 * Shared media URL resolver for Cloudinary-based assets.
 *
 * Cloudinary URLs are always absolute (https://res.cloudinary.com/...).
 * This utility simply passes them through, replacing the old pattern of
 * prepending a local server base URL to relative paths.
 *
 * @param {string} url - The URL stored in MongoDB (always a Cloudinary URL after migration).
 * @returns {string} The URL to use in src attributes, or '' if falsy.
 */
export const getMediaUrl = (url) => {
    if (!url) return '';
    return url;
};
