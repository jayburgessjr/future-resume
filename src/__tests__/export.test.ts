import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getWordCount,
  validateResumeLength,
  toPlainText,
  toMarkdown,
  formatExportContent,
  copyToClipboard,
  downloadFile,
  generateFilename
} from '../lib/export';
import { logger } from '../lib/logger';

describe('Export Utilities', () => {
  describe('getWordCount', () => {
    it('should count words correctly', () => {
      expect(getWordCount('Hello world')).toBe(2);
      expect(getWordCount('  Multiple   spaces   between  words  ')).toBe(4);
      expect(getWordCount('')).toBe(0);
      expect(getWordCount('   ')).toBe(0);
      expect(getWordCount('Single')).toBe(1);
    });

    it('should handle special characters', () => {
      expect(getWordCount('Hello, world!')).toBe(2);
      expect(getWordCount('test@example.com')).toBe(1);
      expect(getWordCount('hyphenated-word')).toBe(1);
    });
  });

  describe('validateResumeLength', () => {
    it('should classify short content as optimal', () => {
      const content = 'Short resume content';
      const result = validateResumeLength(content);
      
      expect(result.wordCount).toBe(3);
      expect(result.isOptimal).toBe(true);
      expect(result.recommendation).toBe('Perfect length for one page');
    });

    it('should classify medium content as good', () => {
      const content = new Array(450).fill('word').join(' ');
      const result = validateResumeLength(content);
      
      expect(result.wordCount).toBe(450);
      expect(result.isOptimal).toBe(true);
      expect(result.recommendation).toBe('Good length, may fit on one page');
    });

    it('should classify long content as needs shortening', () => {
      const content = new Array(600).fill('word').join(' ');
      const result = validateResumeLength(content);
      
      expect(result.wordCount).toBe(600);
      expect(result.isOptimal).toBe(false);
      expect(result.recommendation).toBe('Consider shortening for better print layout');
    });
  });

  describe('toPlainText', () => {
    it('should remove markdown formatting', () => {
      const markdown = '# Header\n**Bold text** and *italic text*\n`code` and [link](url)';
      const expected = 'Header\nBold text and italic text\ncode and link';
      
      expect(toPlainText(markdown)).toBe(expected);
    });

    it('should convert bullet points', () => {
      const markdown = '- First item\n* Second item\n+ Third item';
      const expected = '• First item\n• Second item\n• Third item';
      
      expect(toPlainText(markdown)).toBe(expected);
    });

    it('should remove excessive line breaks', () => {
      const content = 'Line 1\n\n\n\nLine 2';
      const expected = 'Line 1\n\nLine 2';
      
      expect(toPlainText(content)).toBe(expected);
    });
  });

  describe('toMarkdown', () => {
    it('should add header to plain content', () => {
      const content = 'Plain content';
      const result = toMarkdown(content, 'Test Title');
      
      expect(result).toBe('# Test Title\n\nPlain content');
    });

    it('should return markdown content as-is', () => {
      const content = '# Already markdown\n**Bold text**';
      const result = toMarkdown(content, 'Test Title');
      
      expect(result).toBe(content);
    });
  });

  describe('formatExportContent', () => {
    it('should format content with metadata', () => {
      const exportData = {
        title: 'Test Resume',
        content: 'Resume content',
        metadata: {
          generatedAt: new Date(2024, 0, 1), // Year, Month (0-indexed), Day
          wordCount: 2,
          settings: { mode: 'concise' }
        }
      };

      const result = formatExportContent(exportData, 'txt');
      
      expect(result).toContain('TEST RESUME');
      expect(result).toContain('Generated: 1/1/2024');
      expect(result).toContain('Word Count: 2');
      expect(result).toContain('mode: concise');
      expect(result).toContain('Resume content');
    });
  });

    describe('copyToClipboard', () => {
      beforeEach(() => {
        vi.clearAllMocks();
        Object.assign(navigator, {
          clipboard: {
            writeText: vi.fn().mockResolvedValue(undefined)
          }
        });
      });

      it('should copy text successfully', async () => {
        const result = await copyToClipboard('test text');

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
        expect(result).toBe(true);
      });

      it('should handle clipboard API failure with manual copy', async () => {
        vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error('Permission denied'));

        // Mock document methods for manual copy
        const createElement = vi.spyOn(document, 'createElement').mockReturnValue({
          value: '',
          style: {} as CSSStyleDeclaration,
          select: vi.fn(),
        } as HTMLTextAreaElement);

        const appendChild = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
        const removeChild = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
        const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue(null);
        const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});

        const result = await copyToClipboard('test text');

        expect(createElement).toHaveBeenCalledWith('textarea');
        expect(promptSpy).toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalled();
        expect(result).toBe(false);

        createElement.mockRestore();
        appendChild.mockRestore();
        removeChild.mockRestore();
        promptSpy.mockRestore();
        errorSpy.mockRestore();
      });
    });

  describe('downloadFile', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should trigger file download', () => {
      const createElement = vi.spyOn(document, 'createElement').mockReturnValue({
        href: '',
        download: '',
        style: { display: '' } as CSSStyleDeclaration,
        click: vi.fn(),
      } as HTMLAnchorElement);

      const appendChild = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
      const removeChild = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

      downloadFile('content', 'test.txt', 'text/plain');

      expect(createElement).toHaveBeenCalledWith('a');
      expect(appendChild).toHaveBeenCalled();
      expect(removeChild).toHaveBeenCalled();
      expect(window.URL.createObjectURL).toHaveBeenCalled();

      createElement.mockRestore();
      appendChild.mockRestore();
      removeChild.mockRestore();
    });
  });

  describe('generateFilename', () => {
    it('should generate filename with current date', () => {
      const filename = generateFilename('resume', 'txt');
      const today = new Date().toISOString().split('T')[0];
      
      expect(filename).toBe(`resume-${today}.txt`);
    });
  });
});