
async function call(method, path, body) {
  const token = localStorage.getItem('resq_token');
  let res;
  try {
    res = await fetch('/api' + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Is it running?');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) {
      localStorage.removeItem('resq_token');
      localStorage.removeItem('resq_user');
      window.location.href = '/login';
    }
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
}

export const api = {
  get: (path) => call('GET', path),
  post: (path, body) => call('POST', path, body || {}),
  patch: (path, body) => call('PATCH', path, body || {}),
};
