export const parseBytes = (bytes: string): bigint => {
  const units = "bkmgtpezy";
  const regex = /(\d+(?:\.\d+)?)([begkmptyz])/gi;
  let total = 0n;
  let match;
  while ((match = regex.exec(bytes)) !== null) {
    const rawValue = match.at(1);
    const rawUnit = match.at(2);
    if (rawValue === undefined || rawUnit === undefined) continue;
    const value = BigInt(rawValue);
    const pow = units.indexOf(rawUnit.toLowerCase());
    if (pow === -1) continue;
    total += value * (1024n ** BigInt(pow));
  }
  return total;
};

export const base64ToImage = (base64: string, type = "png"): Base64URLString =>
  `data:image/${type};base64,${base64}`;
