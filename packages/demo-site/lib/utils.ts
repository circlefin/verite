export const jsonFetch = (url: string): Promise<Record<string, unknown>> =>
  fetch(url).then((res) => res.json())
