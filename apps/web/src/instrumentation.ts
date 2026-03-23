/**
 * Node pode expor `globalThis.localStorage` inválido (ex.: flag `--localstorage-file`
 * sem caminho). O overlay de dev do Next chama `localStorage.getItem` no SSR e quebra.
 * Substituímos por um stub só no runtime Node do servidor.
 */
export async function register() {
  if (typeof globalThis.localStorage === "undefined") return;

  const ls = globalThis.localStorage as Storage;
  if (typeof ls.getItem === "function") return;

  const noopStorage: Storage = {
    get length() {
      return 0;
    },
    clear() {},
    getItem() {
      return null;
    },
    key() {
      return null;
    },
    removeItem() {},
    setItem() {},
  };

  try {
    Object.defineProperty(globalThis, "localStorage", {
      value: noopStorage,
      configurable: true,
      enumerable: true,
      writable: true,
    });
  } catch {
    // noop
  }
}
