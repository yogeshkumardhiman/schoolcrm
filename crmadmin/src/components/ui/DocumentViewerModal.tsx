"use client";

import React from "react";
import { X, ExternalLink, Download, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentViewerModalProps {
  title: string;
  url: string;
  isPdf?: boolean;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  title,
  url,
  isPdf,
  onClose
}) => {
  const [loadError, setLoadError] = React.useState(false);
  const isActualPdf = Boolean(isPdf || (url && url.toLowerCase().includes(".pdf")));

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              {isActualPdf ? <FileText size={18} /> : <ImageIcon size={18} />}
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-heading">
                {title}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Document Preview</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-colors"
              >
                <ExternalLink size={13} /> Open
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 bg-slate-950 p-4 sm:p-6 overflow-auto flex items-center justify-center min-h-[400px]">
          {!url || loadError ? (
            <div className="text-center p-8 space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
                <FileText size={24} />
              </div>
              <p className="text-sm font-bold text-slate-300">Unable to load document preview</p>
              <p className="text-xs text-slate-500">Please re-select or re-crop the document image</p>
            </div>
          ) : isActualPdf ? (
            <iframe
              src={url}
              title={title}
              className="w-full h-[65vh] rounded-2xl border border-slate-800 bg-white"
            />
          ) : (
            <img
              src={url}
              alt={title}
              onError={() => setLoadError(true)}
              className="max-h-[70vh] max-w-full rounded-2xl object-contain shadow-2xl border border-slate-800/80 bg-slate-900"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerModal;
