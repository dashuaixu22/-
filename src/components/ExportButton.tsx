import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, ChevronDown, Check, Loader2 } from 'lucide-react';

interface ExportButtonProps {
  onExportWord: () => void | Promise<void>;
  onExportPdf: () => void | Promise<void>;
  className?: string;
  size?: 'sm' | 'md';
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  onExportWord,
  onExportPdf,
  className = '',
  size = 'sm',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingType, setLoadingType] = useState<'word' | 'pdf' | null>(null);
  const [successType, setSuccessType] = useState<'word' | 'pdf' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleWordClick = async () => {
    try {
      setLoadingType('word');
      await onExportWord();
      setSuccessType('word');
      setTimeout(() => setSuccessType(null), 2000);
    } catch (e) {
      console.error('Word export error:', e);
    } finally {
      setLoadingType(null);
      setIsOpen(false);
    }
  };

  const handlePdfClick = async () => {
    try {
      setLoadingType('pdf');
      await onExportPdf();
      setSuccessType('pdf');
      setTimeout(() => setSuccessType(null), 2000);
    } catch (e) {
      console.error('PDF export error:', e);
    } finally {
      setLoadingType(null);
      setIsOpen(false);
    }
  };

  const isSm = size === 'sm';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        id="btn-export-dropdown"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 rounded-md font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all cursor-pointer ${
          isSm ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm'
        }`}
      >
        {loadingType ? (
          <Loader2 className={`${isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} animate-spin text-blue-600`} />
        ) : successType ? (
          <Check className={`${isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-emerald-600`} />
        ) : (
          <Download className={`${isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-slate-600`} />
        )}
        <span>
          {loadingType === 'pdf'
            ? '正在生成PDF...'
            : loadingType === 'word'
            ? '正在导出Word...'
            : successType
            ? '导出成功'
            : '导出文档'}
        </span>
        <ChevronDown className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-md bg-white shadow-lg border border-slate-200 py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[11px] font-medium text-slate-400 border-b border-slate-100">
            选择导出格式
          </div>

          {/* 导出 Word */}
          <button
            type="button"
            onClick={handleWordClick}
            disabled={loadingType !== null}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <div className="w-5 h-5 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0">
              W
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-slate-800">Word 文档</div>
              <div className="text-[10px] text-slate-400">.doc 格式 (含表格及排版)</div>
            </div>
          </button>

          {/* 导出 PDF */}
          <button
            type="button"
            onClick={handlePdfClick}
            disabled={loadingType !== null}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <div className="w-5 h-5 rounded bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px] shrink-0">
              P
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-slate-800">PDF 文档</div>
              <div className="text-[10px] text-slate-400">.pdf 高清排版打印件</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
