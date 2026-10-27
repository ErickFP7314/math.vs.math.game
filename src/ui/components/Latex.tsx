import React, { useMemo } from 'react';
import katex from 'katex';

interface LatexProps {
  formula: string;
  className?: string;
}

/** Inline KaTeX rendering for HUD labels. Invalid input falls back to the raw source instead of throwing. */
export const Latex: React.FC<LatexProps> = ({ formula, className = '' }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(formula, { displayMode: false, throwOnError: false });
    } catch {
      return formula;
    }
  }, [formula]);

  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
};
