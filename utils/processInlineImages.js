// utils/processInlineImages.js
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');

/**
 * description: HTML string possibly containing <img src="data:image/...base64,...">
 * options: {
 *   uploadDir: absolute path to store images (default: ./uploads/blog-images),
 *   baseUrl: public base url to serve images, e.g. "https://example.com" (required ideally)
 * }
 *
 * Returns: processed HTML string with data: images replaced by <img src="BASE_URL/...">
 */
async function processInlineImages(description, options = {}) {
  if (!description || typeof description !== 'string') return description;

  const uploadDir = options.uploadDir || path.join(process.cwd(), 'uploads', 'blog-images');
  const baseUrl = options.baseUrl || (process.env.BASE_URL || 'http://localhost:5000');

  // ensure upload directory exists
  await fsp.mkdir(uploadDir, { recursive: true });

  // regex to capture <img ... src="data:image/xxx;base64,xxxxx" ...>
  // captures:
  // 1 -> full data uri (data:image/xxx;base64,AAAA)
  // 2 -> mime type e.g. image/png
  // 3 -> base64 payload
  const base64ImgRegex = /<img[^>]*\s+src=(["'])(data:(image\/[a-zA-Z0-9.+-]+);base64,([^"']+))\1[^>]*>/g;

  // collect matches (matchAll gives iterator)
  const matches = Array.from(description.matchAll(base64ImgRegex));
  if (matches.length === 0) return description;

  let newDescription = description;

  for (const match of matches) {
    try {
      const fullTag = match[0];           // entire <img ...> tag
      const dataUri = match[2];           // data:image/png;base64,....
      const mimeType = match[3];          // image/png
      let base64Data = match[4];          // base64 content (may contain newlines/spaces)

      // clean base64 (remove whitespace/newlines)
      base64Data = base64Data.replace(/\s+/g, '');

      // determine extension (fallback to png)
      let ext = 'png';
      const mimeParts = mimeType.split('/');
      if (mimeParts.length === 2 && mimeParts[1]) ext = mimeParts[1].split('+')[0]; // handle image/svg+xml

      // generate filename
      const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
      const filepath = path.join(uploadDir, filename);

      // write file
      const buffer = Buffer.from(base64Data, 'base64');
      await fsp.writeFile(filepath, buffer);

      // create public url (trim trailing slash)
      const publicBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      // relative path to use in URL (assuming you serve uploads at /uploads)
      // If uploadDir is process.cwd()/uploads/blog-images -> we want /uploads/blog-images/filename
      // Build urlPath using path.sep -> replace backslashes on Windows
      const uploadsRoot = path.join(process.cwd(), 'uploads');
      let urlPath = '/uploads/' + path.relative(uploadsRoot, filepath).split(path.sep).join('/'); 
      // ensure leading slash
      if (!urlPath.startsWith('/')) urlPath = '/' + urlPath;
      const imageUrl = `${publicBase}${urlPath}`;

      // Build new <img> tag: preserve other attributes if present. Easiest: replace only the src attribute inside the tag.
      // Replace src="data:..." with src="imageUrl"
      const newTag = fullTag.replace(/src=(["'])data:[^"']+\1/, `src="${imageUrl}"`);

      // Replace first occurrence of fullTag in newDescription (safe if identical tags repeated - uses first match)
      newDescription = newDescription.replace(fullTag, newTag);

    } catch (err) {
      // on error, log and continue (keep original base64 image to avoid data loss)
      console.error('processInlineImages error:', err);
      // do not throw — continue processing other images
    }
  }

  return newDescription;
}

module.exports = processInlineImages;
