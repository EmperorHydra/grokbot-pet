// Minimal ntfy Server-Sent Events subscriber with auto-reconnect (exponential backoff).
// Usable from Electron main or as a plain node script: node ntfy.js <server> <topic>
function subscribe({ server, topic, onMessage, onStatus = () => {} }) {
  let stopped = false, ctrl = null, lastId = null, delay = 1000;

  async function run() {
    while (!stopped) {
      let idle;
      try {
        ctrl = new AbortController();
        const url = `${server.replace(/\/$/, '')}/${encodeURIComponent(topic)}/sse` + (lastId ? `?since=${encodeURIComponent(lastId)}` : '');
        const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'text/event-stream' } });
        if (!res.ok || !res.body) throw new Error('HTTP ' + res.status);
        onStatus('connected'); delay = 1000;
        const bump = () => { clearTimeout(idle); idle = setTimeout(() => ctrl.abort(), 120000); }; // ntfy keepalive ~45s
        bump();
        const dec = new TextDecoder(); let buf = '';
        for await (const chunk of res.body) {
          bump();
          buf += dec.decode(chunk, { stream: true });
          let i;
          while ((i = buf.search(/\r?\n\r?\n/)) >= 0) {
            const block = buf.slice(0, i); buf = buf.slice(i).replace(/^\r?\n\r?\n/, '');
            const data = block.split(/\r?\n/).filter(l => l.startsWith('data:')).map(l => l.slice(5).trimStart()).join('\n');
            if (!data) continue;
            let m; try { m = JSON.parse(data); } catch (_) { continue; }
            if (m.id) lastId = m.id;
            if (m.event !== 'message') continue; // ignore open / keepalive / poll_request
            onMessage({ id: m.id, title: m.title || '', message: m.message || '', time: m.time });
          }
        }
        throw new Error('stream ended');
      } catch (e) {
        if (stopped) break;
        onStatus('disconnected: ' + (e && e.message));
      } finally { clearTimeout(idle); }
      await new Promise(r => setTimeout(r, delay));
      delay = Math.min(delay * 2, 60000);
    }
  }
  run();
  return { stop() { stopped = true; if (ctrl) ctrl.abort(); } };
}

async function publish(server, topic, body, title) {
  const res = await fetch(`${server.replace(/\/$/, '')}/${encodeURIComponent(topic)}`, {
    method: 'POST', body, headers: title ? { Title: title } : {}
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
}

module.exports = { subscribe, publish };

if (require.main === module) {
  const [server = 'https://ntfy.sh', topic] = process.argv.slice(2);
  subscribe({ server, topic, onStatus: s => console.log('[status]', s), onMessage: m => console.log('[message]', JSON.stringify(m)) });
}
