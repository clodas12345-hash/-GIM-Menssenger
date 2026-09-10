import { Contact } from '../types';
import { extractCleanNameComponents, isGenericOrInvalidName, detectGenderFromName } from './gender';

/**
 * Known common tag prefixes for Brazilian driver campaigns and locations
 */
const COMMON_TAG_PREFIXES = [
  'CG', 'TX', 'TX0', 'TXO', 'CORR', 'CORRECAO', 'AJUSTE', 'BONUS', 'PREMIO', 
  'PROM', 'PROMO', 'VOUCHER', 'GUAPO', 'GOIANIA', 'TRINDADE', 'SENADOR', 
  'APARECIDA', 'GKD', 'MOBI', 'UBER', '99', 'INDI'
];

/**
 * Extracts potential group tags from a raw name string.
 * e.g., "CG 05/50 Marcos Silva" -> "CG 05/50"
 * e.g., ".Aline Alves_CG 10/100" -> "CG 10/100"
 */
export function extractGroupTags(rawName: string): string | null {
  if (!rawName) return null;

  // Pattern 1: Look for strings like "CG 05/50", "CG 10/100", "TX0 14/08", "CG 05-50"
  // Usually starts with 2-4 letters followed by numbers and optionally a slash/dash/dot
  // We use lookarounds or broader matching to avoid \b issues with underscores
  const groupPattern = /(?:^|[\s\.\-_\|])([A-Z]{2,4}\s*\d+[\/\-\.\d]*\d*)(?:$|[\s\.\-_\|])/i;
  const match = rawName.match(groupPattern);
  if (match) {
    const tag = match[1].trim().toUpperCase();
    // Validate if it looks like a tag (has numbers or is in prefix list)
    if (/\d/.test(tag) || COMMON_TAG_PREFIXES.includes(tag)) {
      return tag;
    }
  }

  // Pattern 2: Look for strings between separators like _ or -
  const parts = rawName.split(/[\_\-\|]+/).map(p => p.trim());
  for (const part of parts) {
    if (isTagLike(part)) {
      return part.toUpperCase();
    }
  }

  // Pattern 3: Look for isolated known words like "GUAPO"
  for (const prefix of COMMON_TAG_PREFIXES) {
    const reg = new RegExp(`(?:^|[\\s\\.\\-_\\|])${prefix}(?:$|[\\s\\.\\-_\\|])`, 'i');
    const m = rawName.match(reg);
    if (m) {
      return prefix;
    }
  }

  return null;
}

function isTagLike(str: string): boolean {
  const s = str.toUpperCase();
  if (s.length < 2) return false;
  // If it starts with a known prefix
  if (COMMON_TAG_PREFIXES.some(pre => s.startsWith(pre))) return true;
  // If it's short and has digits
  if (s.length <= 15 && /\d/.test(s)) return true;
  return false;
}

/**
 * Processes a raw name to separate the actual human name from group tags.
 */
export function processContactName(rawName: string): { cleanName: string; detectedGroup: string | null } {
  if (!rawName) return { cleanName: 'Contato Sem Nome', detectedGroup: null };

  const detectedGroup = extractGroupTags(rawName);
  
  // 1. Try a surgical removal of the detected group from the raw name
  let cleanName = rawName;
  if (detectedGroup) {
    // Create a regex that handles potential spacing/separator variations of the detected group
    // We escape special characters for regex
    const escaped = detectedGroup.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Try to remove it with surrounding whitespace or common separators (_, -, .)
    // We use [\s\.\-_\\|]* around it to catch things like ".Aline_CG 05/50"
    const removalRegex = new RegExp(`[\\s\\.\\-_\\|]*${escaped}[\\s\\.\\-_\\|]*`, 'gi');
    cleanName = cleanName.replace(removalRegex, ' ').trim();
  }

  // 2. Remove other common "noise" symbols at the beginning/end
  // Specifically leading dots, underscores, dashes
  cleanName = cleanName.replace(/^[\s\.\-_#@*+~!?\d\/\\:=|]+|[\s\.\-_#@*+~!?\d\/\\:=|]+$/g, '').trim();

  // 3. Fallback: if the name is still empty or looks like just noise, use original raw name (stripped of leading noise)
  if (!cleanName || cleanName.length < 2) {
    cleanName = rawName.replace(/^[\s\.\-_]+/, '').trim() || 'Contato Sem Nome';
  }

  // 4. Proper capitalization for the name (at least the first letter)
  if (cleanName !== 'Contato Sem Nome') {
    cleanName = cleanName.split(' ').map(word => {
      if (word.length <= 1) return word.toLowerCase();
      // Only capitalize if it's all lower or all upper
      if (word === word.toLowerCase() || word === word.toUpperCase()) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word;
    }).join(' ');
  }

  return {
    cleanName,
    detectedGroup
  };
}

/**
 * Enriches a list of contacts with better names and groups based on their raw input.
 */
export function enrichContacts(contacts: Contact[]): Contact[] {
  return contacts.map(contact => {
    // Process all contacts from imports or those that look like they have tags
    const hasTagMarkers = contact.name.includes('CG') || 
                         contact.name.includes('_') || 
                         contact.name.includes('/') || 
                         contact.name.includes('|') ||
                         /\d{2,}/.test(contact.name);

    if (hasTagMarkers || contact.source === 'vcf' || contact.source === 'manual') {
      const { cleanName, detectedGroup } = processContactName(contact.name);
      
      return {
        ...contact,
        name: cleanName,
        group: detectedGroup || contact.group || 'Geral',
        gender: detectGenderFromName(cleanName),
        // Preserve original name in notes if it changed significantly
        notes: (cleanName !== contact.name && !contact.notes?.includes(contact.name))
          ? `[Nome original: ${contact.name}] ${contact.notes || ''}`.trim()
          : contact.notes
      };
    }
    return contact;
  });
}
