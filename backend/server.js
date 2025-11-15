import express from 'express';
import fetch from 'node-fetch';
import cheerio from 'cheerio';
import { Buffer } from 'buffer';

const app = express();
const PORT = process.env.PORT || 3001;
const b64 = (s) => Buffer.from(s, 'utf8').toString('base64url');
const unb64 = (s) => Buffer.from(s, 'base64url').toString('utf8');
const wait = (ms) => new Promise((res) => setTimeout(res, ms || 0));

app.get('/r/:b64', async (req, res) => {
  try {
    const target = unb64(req.params.b64);
    const delay = parseInt(req.query.delay || '0', 10) || 0;
    const enableAudio = req.query.audio === '1';

    if (!/^https?:\/\//i.test(target)) {
      return res.status(400).send('Only http(s) URLs are supported');
    }

    if (delay > 0) await wait(delay);

    const upstreamRes = await fetch(target, {
      headers: {'User-Agent': req.headers['user-agent'] || 'BlueProxy/1.0'}
    });

    const contentType = upstreamRes.headers.get('content-type') || '';

    if (contentType.includes('text/html')) {
      const text = await upstreamRes.text();
      const $ = cheerio.load(text);

      $('a[href]').each((i, el) => {
        try {
          const href = $(el).attr('href');
          const resolved = new URL(href, target).toString();
          $(el).attr('href', `/r/${b64(resolved)}?delay=${delay}&audio=${enableAudio?'1':'0'}`);
        } catch {}
      });

      $('[src]').each((i, el) => {
        try {
          const src = $(el).attr('src');
          const resolved = new URL(src, target).toString();
          $(el).attr('src', `/r/${b64(resolved)}?delay=${delay}&audio=${enableAudio?'1':'0'}`);
        } catch {}
      });

      $('form[action]').each((i, el) => {
        try {
          const act = $(el).attr('action');
          const resolved = new URL(act, target).toString();
          $(el).attr('action', `/r/${b64(resolved)}?delay=${delay}&audio=${enableAudio?'1':'0'}`);
        } catch {}
      });

      if (!enableAudio) {
        $('body').append(`
<script>
try {
  function muteAll(){document.querySelectorAll('audio,video').forEach(e=>{e.muted=true;e.pause&&e.pause();});}
  muteAll();
  const obs=new MutationObserver(muteAll);
  obs.observe(document.documentElement||document.body,{childList:true,subtree:true});
}catch(e){}
</script>`);
      }

      res.set('Content-Type','text/html');
      return res.send($.html());
    }

    const buffer = await upstreamRes.arrayBuffer();
    if (delay > 0) await wait(delay);
    res.set('Content-Type', contentType);
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error(err);
    res.status(500).send('Proxy error: ' + String(err.message));
  }
});

app.get('/api/encode', (req, res) => {
  const url = req.query.url || '';
  if (!url) return res.status(400).json({ error: 'url required' });
  try {
    const encoded = b64(url);
    res.json({ route: `/r/${encoded}` });
  } catch {
    res.status(400).json({ error: 'invalid url' });
  }
});

app.listen(PORT, () => console.log(`BlueProxy backend running on http://localhost:${PORT}`));
