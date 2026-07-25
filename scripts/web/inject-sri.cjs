#!/usr/bin/env node
/**
 * Post-Vite: add Subresource Integrity (sha384) to hashed assets in index.html.
 * Satisfies OWASP ZAP alert 90003 for same-origin script/link tags.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const distDir = path.resolve(__dirname, '../../apps/web/dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('inject-sri: missing', indexPath);
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

function integrityFor(relUrl) {
  const filePath = path.join(distDir, relUrl.replace(/^\//, ''));
  if (!fs.existsSync(filePath)) {
    throw new Error(`inject-sri: asset not found ${filePath}`);
  }
  const hash = crypto.createHash('sha384').update(fs.readFileSync(filePath)).digest('base64');
  return `sha384-${hash}`;
}

html = html.replace(
  /<(script|link)\b([^>]*?)\b(?:src|href)="(\/assets\/[^"]+)"([^>]*)>/gi,
  (full, tag, pre, assetUrl, post) => {
    if (/\bintegrity=/i.test(full)) return full;
    const integrity = integrityFor(assetUrl);
    const crossorigin = /\bcrossorigin=/i.test(full) ? '' : ' crossorigin="anonymous"';
    if (tag.toLowerCase() === 'script') {
      return `<script${pre}src="${assetUrl}" integrity="${integrity}"${crossorigin}${post}>`;
    }
    return `<link${pre}href="${assetUrl}" integrity="${integrity}"${crossorigin}${post}>`;
  },
);

fs.writeFileSync(indexPath, html);
console.log('inject-sri: updated', indexPath);
