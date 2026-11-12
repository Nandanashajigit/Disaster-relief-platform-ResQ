const BASE = 'http://127.0.0.1:3001';

async function call(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Database error');
  return res.json();
}

module.exports = {
 
  list: (name, query) => call('GET', `/${name}${query ? '?' + query : ''}`),
  get: (name, id) => call('GET', `/${name}/${id}`),
  add: (name, data) => call('POST', `/${name}`, { ...data, createdAt: new Date().toISOString() }),
  update: (name, id, data) => call('PATCH', `/${name}/${id}`, data),
};
