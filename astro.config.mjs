// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import preact from '@astrojs/preact';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const fixtures = new Map(
  ['_server.parquet', 'one-commit.parquet', 'incompatible.parquet'].map(name =>
    [`/data/${name}`, fileURLToPath(new URL(`./.benchmark-fixtures/${name}`, import.meta.url))]),
);

/** @returns {import('vite').Plugin} */
function fixtureRanges() {
  return {
    name: 'benchmark-fixture-ranges',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = fixtures.get(new URL(req.url ?? '/', 'http://localhost').pathname);
        if (!path || !['HEAD', 'GET'].includes(req.method ?? '')) return next();
        let data;
        try {
          data = await readFile(path);
        } catch (error) {
          if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return next();
          return next(error);
        }
        const etag = `"${createHash('sha256').update(data).digest('hex')}"`;
        res.setHeader('ETag', etag);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Type', 'application/octet-stream');
        if (req.headers['if-match'] && req.headers['if-match'] !== etag) {
          res.statusCode = 412;
          return res.end();
        }
        const range = req.headers.range?.match(/^bytes=(\d+)-(\d+)$/);
        if (req.headers.range && (!range || Number(range[1]) > Number(range[2]) || Number(range[2]) >= data.length)) {
          res.statusCode = 416;
          res.setHeader('Content-Range', `bytes */${data.length}`);
          return res.end();
        }
        const start = range ? Number(range[1]) : 0;
        const end = range ? Number(range[2]) + 1 : data.length;
        if (range) {
          res.statusCode = 206;
          res.setHeader('Content-Range', `bytes ${start}-${end - 1}/${data.length}`);
        }
        res.setHeader('Content-Length', end - start);
        return res.end(req.method === 'HEAD' ? undefined : data.subarray(start, end));
      });
    },
  };
}

export default defineConfig({
  site: 'https://openivm.org',
  output: 'static',
  integrations: [sitemap(), preact()],
  vite: { plugins: [fixtureRanges()] },
});
