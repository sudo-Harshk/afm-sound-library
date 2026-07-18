export const toTitleCase = (str) =>
  str.replace(/\b\w/g, (c) => c.toUpperCase());

export const normalize = (str) =>
  str.toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
