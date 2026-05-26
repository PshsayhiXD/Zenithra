export const hashText = (text: string): number => {
  let hash = 0;
  for (const char of text) {
    hash = Math.imul(31, hash) + (char.codePointAt(0) ?? 0);
    hash >>>= 0;
  }
  return hash;
};
