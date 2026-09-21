import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface DetailField {
  label: string;
  value: string | number;
  highlight?: boolean;
}

export interface DetailSection {
  title: string;
  fields?: DetailField[];
  table?: {
    headers: string[];
    rows: (string | number)[][];
  };
  customHtml?: string;
}

export interface ExportDetailData {
  title: string;
  subtitle?: string;
  tags?: string[];
  metaInfo?: { label: string; value: string }[];
  sections: DetailSection[];
  exportTime?: string;
}

/**
 * 导出 DOM 节点为 PDF 文档 (支持多页智能分页与高清渲染)
 */
export async function exportElementToPdf(
  elementId: string | HTMLElement,
  filename: string,
  title?: string
): Promise<void> {
  const targetElement =
    typeof elementId === 'string' ? document.getElementById(elementId) : elementId;

  if (!targetElement) {
    console.error(`Export PDF failed: element not found (${elementId})`);
    return;
  }

  // 高清截取 DOM
  const canvas = await html2canvas(targetElement, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: targetElement.scrollWidth,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height * contentWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = margin;

  // 第一页
  pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeight);
  heightLeft -= (pageHeight - margin * 2);

  // 如果内容高度超过一页，分页渲染
  while (heightLeft > 0) {
    position = position - (pageHeight - margin * 2);
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeight);
    heightLeft -= (pageHeight - margin * 2);
  }

  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  pdf.save(cleanFilename);
}

/**
 * 将结构化表单数据导出为标准 Word 文档 (.doc)
 * 采用 Microsoft Word HTML/XML 命名空间，支持本地 Word/WPS 原生解析排版与表格
 */
export function exportDetailToWord(data: ExportDetailData, filename: string): void {
  const now = data.exportTime || new Date().toLocaleString('zh-CN', { hour12: false });
  const docTitle = data.title;

  let sectionsHtml = '';

  data.sections.forEach((section) => {
    sectionsHtml += `
      <div style="margin-top: 16pt; margin-bottom: 6pt;">
        <h2 style="font-size: 12pt; font-weight: bold; color: #1e3a8a; border-left: 3.5pt solid #2563eb; padding-left: 6pt; margin: 0 0 8pt 0;">
          ${escapeHtml(section.title)}
        </h2>
    `;

    // 键值网格 (转化为双列或四列表格)
    if (section.fields && section.fields.length > 0) {
      sectionsHtml += `<table style="width: 100%; border-collapse: collapse; margin-bottom: 10pt; font-size: 9.5pt;">`;
      for (let i = 0; i < section.fields.length; i += 2) {
        const f1 = section.fields[i];
        const f2 = section.fields[i + 1];

        sectionsHtml += `<tr>`;
        sectionsHtml += `
          <td style="width: 18%; background-color: #f8fafc; color: #475569; font-weight: bold; border: 1pt solid #cbd5e1; padding: 5pt 7pt;">
            ${escapeHtml(f1.label)}
          </td>
          <td style="width: ${f2 ? '32%' : '82%'}" colspan="${f2 ? '1' : '3'}" style="color: ${f1.highlight ? '#2563eb' : '#0f172a'}; font-weight: ${f1.highlight ? 'bold' : 'normal'}; border: 1pt solid #cbd5e1; padding: 5pt 7pt;">
            ${escapeHtml(String(f1.value ?? '-'))}
          </td>
        `;

        if (f2) {
          sectionsHtml += `
            <td style="width: 18%; background-color: #f8fafc; color: #475569; font-weight: bold; border: 1pt solid #cbd5e1; padding: 5pt 7pt;">
              ${escapeHtml(f2.label)}
            </td>
            <td style="width: 32%; color: ${f2.highlight ? '#2563eb' : '#0f172a'}; font-weight: ${f2.highlight ? 'bold' : 'normal'}; border: 1pt solid #cbd5e1; padding: 5pt 7pt;">
              ${escapeHtml(String(f2.value ?? '-'))}
            </td>
          `;
        }
        sectionsHtml += `</tr>`;
      }
      sectionsHtml += `</table>`;
    }

    // 数据明细表格
    if (section.table && section.table.headers.length > 0) {
      sectionsHtml += `
        <table style="width: 100%; border-collapse: collapse; margin-top: 6pt; margin-bottom: 10pt; font-size: 9pt;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              ${section.table.headers
                .map(
                  (h) => `
                <th style="border: 1pt solid #cbd5e1; padding: 6pt 6pt; color: #334155; font-weight: bold; text-align: left;">
                  ${escapeHtml(h)}
                </th>
              `
                )
                .join('')}
            </tr>
          </thead>
          <tbody>
            ${section.table.rows
              .map(
                (row, rIdx) => `
              <tr style="background-color: ${rIdx % 2 === 1 ? '#f8fafc' : '#ffffff'};">
                ${row
                  .map(
                    (cell) => `
                  <td style="border: 1pt solid #cbd5e1; padding: 5pt 6pt; color: #1e293b;">
                    ${escapeHtml(String(cell ?? '-'))}
                  </td>
                `
                  )
                  .join('')}
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `;
    }

    if (section.customHtml) {
      sectionsHtml += section.customHtml;
    }

    sectionsHtml += `</div>`;
  });

  const tagsHtml =
    data.tags && data.tags.length > 0
      ? data.tags
          .map(
            (t) => `
        <span style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; border: 1pt solid #bfdbfe; padding: 2pt 6pt; font-size: 8.5pt; border-radius: 3pt; margin-right: 4pt;">
          ${escapeHtml(t)}
        </span>
      `
          )
          .join('')
      : '';

  const metaHtml =
    data.metaInfo && data.metaInfo.length > 0
      ? `
      <div style="margin-top: 6pt; font-size: 9pt; color: #64748b;">
        ${data.metaInfo
          .map((m) => `<span>${escapeHtml(m.label)}: <strong style="color: #334155;">${escapeHtml(m.value)}</strong></span>`)
          .join(' &nbsp;•&nbsp; ')}
      </div>
    `
      : '';

  const wordTemplate = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${escapeHtml(docTitle)}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page {
          size: A4 portrait;
          margin: 2cm 2cm 2cm 2cm;
          mso-header-margin: 1cm;
          mso-footer-margin: 1cm;
        }
        body {
          font-family: 'PingFang SC', 'Microsoft YaHei', 'SimSun', sans-serif;
          font-size: 10pt;
          color: #0f172a;
          line-height: 1.5;
        }
        table {
          mso-displayed-decimal-separator: ".";
          mso-displayed-thousand-separator: ",";
        }
      </style>
    </head>
    <body>
      <div style="border-bottom: 2pt solid #2563eb; padding-bottom: 8pt; margin-bottom: 12pt;">
        <div style="font-size: 9pt; color: #64748b; margin-bottom: 3pt;">算力与增值运营平台 • 业务单据详情</div>
        <h1 style="font-size: 17pt; font-weight: bold; color: #0f172a; margin: 0 0 6pt 0;">
          ${escapeHtml(docTitle)}
        </h1>
        ${data.subtitle ? `<div style="font-size: 11pt; color: #334155; margin-bottom: 6pt;">${escapeHtml(data.subtitle)}</div>` : ''}
        ${tagsHtml}
        ${metaHtml}
      </div>

      ${sectionsHtml}

      <div style="margin-top: 24pt; padding-top: 10pt; border-top: 1pt dashed #cbd5e1; font-size: 8.5pt; color: #94a3b8; display: flex; justify-content: space-between;">
        <span>导出生成时间: ${escapeHtml(now)}</span>
        <span style="text-align: right; float: right;">平台O管理系统 • 内部业务归档件</span>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', wordTemplate], {
    type: 'application/msword;charset=utf-8',
  });

  const cleanFilename = filename.endsWith('.doc') ? filename : `${filename}.doc`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = cleanFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
