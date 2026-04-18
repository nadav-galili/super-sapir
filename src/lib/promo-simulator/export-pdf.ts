import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface ExportOptions {
  filename?: string
}

/**
 * Captures a DOM element with html2canvas and writes it to a multi-page A4 PDF.
 * Tall content is sliced into page-height chunks so nothing is cropped.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  { filename = 'promo.pdf' }: ExportOptions = {},
): Promise<void> {
  const scale = 2
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    backgroundColor: '#FDF8F6',
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  })

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
    compress: true,
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 24
  const contentWidth = pageWidth - margin * 2
  const contentHeight = pageHeight - margin * 2

  // How many source-canvas pixels fit on one PDF page (keeping width ratio).
  const pxPerPage = Math.floor((contentHeight * canvas.width) / contentWidth)

  let renderedPx = 0
  let pageIndex = 0
  const totalPages = Math.max(1, Math.ceil(canvas.height / pxPerPage))

  while (renderedPx < canvas.height) {
    const sliceHeight = Math.min(pxPerPage, canvas.height - renderedPx)

    const pageCanvas = document.createElement('canvas')
    pageCanvas.width = canvas.width
    pageCanvas.height = sliceHeight
    const ctx = pageCanvas.getContext('2d')
    if (!ctx) break
    ctx.fillStyle = '#FDF8F6'
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
    ctx.drawImage(
      canvas,
      0,
      renderedPx,
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      sliceHeight,
    )

    const imgData = pageCanvas.toDataURL('image/png')
    const imgHeightOnPage = (sliceHeight * contentWidth) / canvas.width

    if (pageIndex > 0) pdf.addPage()
    pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, imgHeightOnPage)

    if (totalPages > 1) {
      pdf.setFontSize(9)
      pdf.setTextColor(160, 174, 192)
      pdf.text(
        `${pageIndex + 1} / ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' },
      )
    }

    renderedPx += sliceHeight
    pageIndex += 1
  }

  pdf.save(filename)
}
