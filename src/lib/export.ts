/**
 * Export utilities for resume content
 * Handles text formatting, file downloads, and clipboard operations
 */

import { logger } from './logger';

export interface ExportContent {
  title: string;
  content: string;
  metadata?: {
    generatedAt?: Date;
    settings?: Record<string, unknown>;
    wordCount?: number;
  };
}

/**
 * Convert markdown content to plain text
 */
export function toPlainText(content: string): string {
  return content
    // Remove headers
    .replace(/#{1,6}\s*/g, '')
    // Remove bold/italic
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    // Remove code blocks
    .replace(/`(.*?)`/g, '$1')
    // Remove links but keep text
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    // Convert bullets
    .replace(/^\s*[-*+]\s+/gm, '• ')
    // Remove extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Format content as markdown with proper headers
 */
export function toMarkdown(content: string, title: string = 'Resume'): string {
  // If content already has markdown formatting, return as-is
  if (content.includes('#') || content.includes('**')) {
    return content;
  }
  
  // Otherwise, add basic markdown structure
  return `# ${title}\n\n${content}`;
}

/**
 * Generate formatted content with metadata header
 */
export function formatExportContent(exportData: ExportContent, format: 'txt' | 'md'): string {
  const { title, content, metadata } = exportData;
  
  const header = [
    `${title.toUpperCase()}`,
    '',
    ...(metadata?.generatedAt ? [`Generated: ${metadata.generatedAt.toLocaleDateString()}`] : []),
    ...(metadata?.settings ? [`Settings: ${Object.entries(metadata.settings).map(([k, v]) => `${k}: ${v}`).join(' • ')}`] : []),
    ...(metadata?.wordCount ? [`Word Count: ${metadata.wordCount}`] : []),
    '',
    '─'.repeat(50),
    '',
  ].join('\n');

  const formattedContent = format === 'md' ? toMarkdown(content, title) : toPlainText(content);
  
  return header + formattedContent;
}


/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  const manualCopy = () => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    window.prompt('Copy to clipboard: Ctrl+C, Enter', text);
    document.body.removeChild(textArea);
  };

  if (!navigator?.clipboard) {
    logger.warn('Clipboard API not supported');
    try {
      manualCopy();
    } catch (fallbackError) {
      logger.error('Manual copy failed:', fallbackError);
    }
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NotAllowedError') {
      logger.error('Clipboard permission denied:', error);
    } else {
      logger.error('Failed to copy to clipboard:', error);
    }

    try {
      manualCopy();
    } catch (fallbackError) {
      logger.error('Manual copy failed:', fallbackError);
    }
    return false;
  }
}

/**
 * Download content as file
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(baseName: string, extension: string): string {
  const date = new Date();
  const timestamp = date.toISOString().split('T')[0]; // YYYY-MM-DD
  return `${baseName}-${timestamp}.${extension}`;
}

/**
 * Prepare content for printing by cleaning up formatting
 */
export function preparePrintContent(content: string): string {
  return content
    // Ensure proper line breaks
    .replace(/\n/g, '\n')
    // Clean up excessive spacing
    .replace(/\n{3,}/g, '\n\n')
    // Ensure bullet points are clean
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .trim();
}

/**
 * Trigger browser print dialog
 */
export function printContent(): void {
  window.print();
}

/**
 * Get word count for content
 */
export function getWordCount(content: string): number {
  return content.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Validate content length for resume (should fit on one page)
 */
export function validateResumeLength(content: string): {
  wordCount: number;
  isOptimal: boolean;
  recommendation: string;
} {
  const wordCount = getWordCount(content);
  
  if (wordCount <= 400) {
    return {
      wordCount,
      isOptimal: true,
      recommendation: 'Perfect length for one page'
    };
  } else if (wordCount <= 550) {
    return {
      wordCount,
      isOptimal: true,
      recommendation: 'Good length, may fit on one page'
    };
  } else {
    return {
      wordCount,
      isOptimal: false,
      recommendation: 'Consider shortening for better print layout'
    };
  }
}
