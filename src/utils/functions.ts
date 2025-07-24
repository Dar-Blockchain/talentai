export function validateGithubLink(link: string): boolean {
  const regex = /^(https?:\/\/)?(www\.)?github\.com\/[\w.-]+\/[\w.-]+(\/)?(\.git)?$/i;
  let normalized = link.trim();
  if (normalized.endsWith('/')) normalized = normalized.slice(0, -1);
  if (normalized.endsWith('.git')) normalized = normalized.slice(0, -4);
  const match = /^((https?:\/\/)?(www\.)?github\.com\/[\w.-]+\/[\w.-]+)$/.test(normalized);
  return match;
}