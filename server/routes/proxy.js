const express = require('express');
const https = require('https');
const { URL } = require('url');

const router = express.Router();

const ALLOWED_HOSTS = new Set([
  'images.unsplash.com',
  'plus.unsplash.com'
]);

function fetchAndPipe(url, res, redirectCount = 0) {
  if (redirectCount > 5) {
    return res.status(502).json({ error: 'Too many redirects' });
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  if (parsed.protocol !== 'https:' || !ALLOWED_HOSTS.has(parsed.hostname)) {
    return res.status(400).json({ error: 'URL not allowed' });
  }

  const options = {
    headers: {
      'User-Agent': 'HomesHub/1.0 (+https://localhost)',
      'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      'Referer': 'https://images.unsplash.com/'
    }
  };

  https.get(parsed.toString(), options, (upstream) => {
    const status = upstream.statusCode || 0;
    if (status >= 300 && status < 400 && upstream.headers.location) {
      upstream.resume();
      const nextUrl = upstream.headers.location.startsWith('http')
        ? upstream.headers.location
        : new URL(upstream.headers.location, parsed).toString();
      return fetchAndPipe(nextUrl, res, redirectCount + 1);
    }

    if (status !== 200) {
      upstream.resume();
      return res.status(502).json({ error: 'Upstream error', status });
    }

    const contentType = upstream.headers['content-type'] || '';
    const isImage = contentType.startsWith('image/') || contentType === 'binary/octet-stream';
    if (!isImage) {
      res.status(502).json({ error: 'Upstream did not return an image' });
      upstream.resume();
      return;
    }

    res.setHeader('Content-Type', contentType || 'image/jpeg');
    if (upstream.headers['cache-control']) {
      res.setHeader('Cache-Control', upstream.headers['cache-control']);
    }
    if (upstream.headers['etag']) {
      res.setHeader('ETag', upstream.headers['etag']);
    }

    upstream.pipe(res);
  }).on('error', (err) => {
    res.status(500).json({ error: 'Proxy error', details: err.message });
  });
}

router.get('/image', (req, res) => {
  const target = req.query.url;
  if (!target) {
    return res.status(400).json({ error: 'Missing url query parameter' });
  }
  return fetchAndPipe(target, res);
});

module.exports = router;
