/**
 * Figma & Penpot Design Token Bridge
 * Converts OpenDesign tokens to/from Figma Tokens Studio JSON format.
 */

export interface FigmaTokenItem {
  value: string;
  type: 'color' | 'typography' | 'spacing' | 'borderRadius' | 'boxShadow';
  description?: string;
}

export interface FigmaTokensDocument {
  global: Record<string, FigmaTokenItem>;
  $metadata?: {
    tokenSetOrder: string[];
  };
}

/**
 * Extracts design tokens from active CSS variables / DESIGN.md
 */
export function exportToFigmaTokens(tokens: Record<string, string>): FigmaTokensDocument {
  const globalTokens: Record<string, FigmaTokenItem> = {};

  for (const [key, rawValue] of Object.entries(tokens)) {
    const cleanKey = key.replace(/^--/, '');
    let type: FigmaTokenItem['type'] = 'color';

    if (cleanKey.includes('radius') || cleanKey.includes('rounded')) {
      type = 'borderRadius';
    } else if (cleanKey.includes('space') || cleanKey.includes('gap') || cleanKey.includes('padding')) {
      type = 'spacing';
    } else if (cleanKey.includes('font') || cleanKey.includes('text-size')) {
      type = 'typography';
    } else if (cleanKey.includes('shadow')) {
      type = 'boxShadow';
    }

    globalTokens[cleanKey] = {
      value: rawValue,
      type,
      description: `Exported from OpenDesign token: ${key}`,
    };
  }

  return {
    global: globalTokens,
    $metadata: {
      tokenSetOrder: ['global'],
    },
  };
}

/**
 * Imports a Figma Tokens JSON structure into key-value CSS tokens.
 */
export function importFromFigmaTokens(jsonStr: string): Record<string, string> {
  const parsed = JSON.parse(jsonStr) as FigmaTokensDocument;
  const result: Record<string, string> = {};

  const sourceSet = parsed.global || (parsed as any);

  for (const [key, item] of Object.entries(sourceSet)) {
    if (typeof item === 'object' && item !== null && 'value' in item) {
      result[`--${key}`] = String((item as FigmaTokenItem).value);
    } else if (typeof item === 'string') {
      result[`--${key}`] = item;
    }
  }

  return result;
}
