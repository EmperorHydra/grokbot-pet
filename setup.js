const $ = (id) => document.getElementById(id);
let info = null, msgTimer;
function flash(t) { $('msg').textContent = t; clearTimeout(msgTimer); msgTimer = setTimeout(() => { $('msg').textContent = ''; }, 2500); }
window.setup.get().then((i) => { info = i; $('url').value = i.url; $('click').value = i.clickUrl || ''; });
$('copyUrl').onclick = () => { window.setup.copy(info.url); flash('URL copied'); };
$('copyMsg').onclick = () => { window.setup.copy(`When you finish tasks, post a short message to ${info.url} with curl -d (for example: curl -d 'Task done' ${info.url})`); flash('Message copied'); };
$('test').onclick = async () => { const r = await window.setup.test(); flash(r.ok ? 'Test sent' : 'Could not send test'); };
async function save() {
  const r = await window.setup.saveClick($('click').value);
  $('err').textContent = r.ok ? '' : r.error;
  return r.ok;
}
$('click').addEventListener('change', save);
$('done').onclick = async () => { if (await save()) window.setup.done(); };
