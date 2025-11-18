export function toTitleCase(str: string): string {
  const minorWords = new Set([
    'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in', 'into',
    'nor', 'of', 'on', 'or', 'over', 'so', 'the', 'to', 'up', 'yet', 'with'
  ]);
  
  const possessiveSuffixes = new Set(['s', 't', 're', 've', 'll', 'd', 'm']);

  return str
    .split(' ')
    .map((word, wordIndex) => {
      if (!word) return word;
      
      // Extract leading/trailing punctuation
      const match = word.match(/^([^A-Za-z0-9]*)([A-Za-z0-9'-]+)([^A-Za-z0-9]*)$/);
      if (!match) return word;
      
      const [, leadPunct, core, trailPunct] = match;
      
      // Split core by hyphens and apostrophes, keeping delimiters
      const segments = core.split(/(-|')/);
      
      // Process each segment
      const processedSegments = segments.map((seg, segIndex) => {
        // Keep delimiters as-is
        if (seg === '-' || seg === "'") return seg;
        if (!seg) return seg;
        
        // Keep possessive/contraction suffixes lowercase after apostrophe
        if (segIndex > 0 && segments[segIndex - 1] === "'") {
          if (possessiveSuffixes.has(seg.toLowerCase())) {
            return seg.toLowerCase();
          }
        }
        
        // Preserve multi-letter all-caps segments (acronyms: NASA, AI, USDC)
        if (seg === seg.toUpperCase() && /[A-Z]{2,}/.test(seg)) {
          return seg;
        }
        
        // Preserve segments with mixed case (brand names: OpenAI, iPhone, eBay, etc.)
        const hasMixedCase = seg !== seg.toLowerCase() && seg !== seg.toUpperCase();
        if (hasMixedCase) {
          return seg;
        }
        
        // Otherwise, apply title casing to lowercase segments
        const lowerSeg = seg.toLowerCase();
        
        // Check if this specific segment is a minor word
        // Minor words are lowercase unless they're the first segment of the first word
        const isFirstSegmentOfFirstWord = wordIndex === 0 && segIndex === 0;
        if (minorWords.has(lowerSeg) && !isFirstSegmentOfFirstWord) {
          return lowerSeg;
        }
        
        // Capitalize first letter
        return lowerSeg.charAt(0).toUpperCase() + lowerSeg.slice(1);
      });
      
      return leadPunct + processedSegments.join('') + trailPunct;
    })
    .join(' ');
}

export function formatCompactNumber(value: number): string {
  const formatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  });
  return formatter.format(value);
}

