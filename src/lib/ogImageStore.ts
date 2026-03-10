const OG_BG_STORE_MAX = 30;

type OgBackgroundEntry = {
  dataUrl: string;
  createdAt: number;
};

const store = new Map<string, OgBackgroundEntry>();

function cleanup() {
  if (store.size <= OG_BG_STORE_MAX) {
    return;
  }

  const entries = [...store.entries()].sort(
    (a, b) => a[1].createdAt - b[1].createdAt,
  );
  const removeCount = store.size - OG_BG_STORE_MAX;
  for (let i = 0; i < removeCount; i += 1) {
    store.delete(entries[i][0]);
  }
}

export function saveOgBackgroundImage(dataUrl: string) {
  const id = crypto.randomUUID();
  store.set(id, { dataUrl, createdAt: Date.now() });
  cleanup();
  return id;
}

export function getOgBackgroundImage(id: string) {
  return store.get(id)?.dataUrl || "";
}
