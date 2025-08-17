import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  copyToClipboard, 
  downloadFile, 
  printContent, 
  formatExportContent, 
  generateFilename,
  validateResumeLength,
  type ExportContent 
} from '@/lib/export';
import { Copy, Download, Printer, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ExportBarProps {
  content: string;
  title?: string;
  metadata?: {
    generatedAt?: Date;
    settings?: any;
    wordCount?: number;
  };
  showPrint?: boolean;
  showWordCount?: boolean;
  className?: string;
}

export function ExportBar({ 
  content, 
  title = 'Resume', 
  metadata,
  showPrint = true,
  showWordCount = true,
  className = '' 
}: ExportBarProps) {
  const { toast } = useToast();

  const exportData: ExportContent = {
    title,
    content,
    metadata
  };

  const validation = validateResumeLength(content);

  const handleCopy = async () => {
    const plainText = formatExportContent(exportData, 'txt');
    const success = await copyToClipboard(plainText);
    
    if (success) {
      toast({
        title: 'Copied!',
        description: `${title} copied to clipboard`,
      });
    } else {
      toast({
        title: 'Copy Failed',
        description: 'Unable to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadTxt = () => {
    const plainText = formatExportContent(exportData, 'txt');
    const filename = generateFilename(title.toLowerCase().replace(/\s+/g, '-'), 'txt');
    downloadFile(plainText, filename);
    
    toast({
      title: 'Downloaded!',
      description: `${title} saved as ${filename}`,
    });
  };

  const handleDownloadMd = () => {
    const markdown = formatExportContent(exportData, 'md');
    const filename = generateFilename(title.toLowerCase().replace(/\s+/g, '-'), 'md');
    downloadFile(markdown, filename, 'text/markdown');
    
    toast({
      title: 'Downloaded!',
      description: `${title} saved as ${filename}`,
    });
  };

  const handlePrint = () => {
    // Add print-specific content to the page temporarily
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <style>
              @page {
                margin: 0.75in;
                size: letter;
              }
              
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 11pt;
                line-height: 1.4;
                color: #000;
                background: #fff;
                margin: 0;
                padding: 0;
              }
              
              h1 { 
                font-size: 16pt; 
                margin: 0 0 8pt 0; 
                font-weight: 600;
              }
              
              h2 { 
                font-size: 13pt; 
                margin: 12pt 0 4pt 0; 
                font-weight: 600;
              }
              
              h3 { 
                font-size: 11pt; 
                margin: 8pt 0 2pt 0; 
                font-weight: 600;
              }
              
              p { 
                margin: 0 0 6pt 0; 
              }
              
              ul { 
                margin: 4pt 0 8pt 0; 
                padding-left: 16pt;
              }
              
              li { 
                margin: 2pt 0; 
              }
              
              .print-header {
                text-align: center;
                border-bottom: 1pt solid #000;
                padding-bottom: 8pt;
                margin-bottom: 12pt;
              }
              
              .print-content {
                white-space: pre-wrap;
              }
              
              @media print {
                body { 
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
            </style>
          </head>
          <body>
            <div class="print-header">
              <h1>${title}</h1>
              ${metadata?.generatedAt ? `<p>Generated: ${metadata.generatedAt.toLocaleDateString()}</p>` : ''}
            </div>
            <div class="print-content">${content.replace(/\n/g, '<br>')}</div>
          </body>
        </html>
      `;
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    } else {
      // Fallback to regular print
      printContent();
    }
    
    toast({
      title: 'Print Dialog Opened',
      description: 'Choose your printer and settings',
    });
  };

  if (!content.trim()) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border ${className}`}>
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Export:</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleCopy} variant="outline" size="sm">
          <Copy className="w-4 h-4 mr-1" />
          Copy
        </Button>
        
        <Button onClick={handleDownloadTxt} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-1" />
          .txt
        </Button>
        
        <Button onClick={handleDownloadMd} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-1" />
          .md
        </Button>
        
        {showPrint && (
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-1" />
            Print PDF
          </Button>
        )}
      </div>
      
      {showWordCount && (
        <div className="flex items-center gap-2 ml-auto">
          <Badge 
            variant={validation.isOptimal ? "secondary" : "outline"}
            className="text-xs"
          >
            {validation.wordCount} words
          </Badge>
          {!validation.isOptimal && (
            <span className="text-xs text-muted-foreground">
              {validation.recommendation}
            </span>
          )}
        </div>
      )}
    </div>
  );
}