import React, { useState } from 'react';
import { ExternalLink, Download, FileText, AlertCircle, Maximize2 } from 'lucide-react';
import { Button } from './Button';

export const PDFViewer = ({
  previewUrl,
  downloadUrl,
  fileName = 'document.pdf',
  fileType = 'application/pdf',
}) => {
  const [loadError, setLoadError] = useState(false);
  const isPdf = fileType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf');

  if (!isPdf) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-50 border border-slate-200 rounded-xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h4 className="text-base font-semibold text-slate-800 mb-1">{fileName}</h4>
        <p className="text-sm text-slate-500 max-w-md mb-5">
          In-browser preview is available for PDF files. For Microsoft Word (.docx) and PowerPoint (.pptx) documents, please download the file to view on your device.
        </p>
        <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
          <Button icon={Download} variant="primary">
            Download {fileName.split('.').pop()?.toUpperCase()}
          </Button>
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
      {/* Top Bar Controls */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 border-b border-slate-200 text-xs text-slate-700">
        <div className="flex items-center gap-2 truncate">
          <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span className="font-medium truncate max-w-xs">{fileName}</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            title="Open preview in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>New Tab</span>
          </a>
          <a
            href={downloadUrl}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>
        </div>
      </div>

      {/* PDF View Container */}
      <div className="relative w-full h-[650px] bg-slate-800">
        {loadError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-200">
            <AlertCircle className="w-10 h-10 text-amber-400 mb-3" />
            <h5 className="font-semibold text-base mb-1">Preview Unavailable in this frame</h5>
            <p className="text-sm text-slate-400 mb-4 max-w-sm">
              Your browser may block embedded PDF rendering. You can open it in a new tab or download it directly.
            </p>
            <div className="flex gap-3">
              <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="sm" icon={ExternalLink}>
                  Open in New Tab
                </Button>
              </a>
              <a href={downloadUrl}>
                <Button variant="primary" size="sm" icon={Download}>
                  Download PDF
                </Button>
              </a>
            </div>
          </div>
        ) : (
          <iframe
            src={`${previewUrl}#toolbar=1&navpanes=0`}
            title={fileName}
            className="w-full h-full border-0"
            onError={() => setLoadError(true)}
          />
        )}
      </div>
    </div>
  );
};
