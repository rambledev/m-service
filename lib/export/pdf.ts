import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";

const SCALE = 1.5;
const JPEG_QUALITY = 0.92;

// Renders `node` (a DOM element, expected to use only plain CSS — see ReportPrintable)
// to a raster image and slices it across as many A4 pages as needed. Rasterizing instead of
// drawing vector text sidesteps jsPDF's built-in fonts having no Thai glyphs, at the cost of the
// text not being selectable in the resulting PDF. Pages are encoded as JPEG rather than PNG —
// antialiased text at 1.5x scale compresses far better as JPEG (single-digit MB vs 10+ MB as PNG)
// with no visible quality loss at normal reading zoom.
export async function exportReportToPdf(node: HTMLElement, filenameBase: string): Promise<void> {
  console.log("[pdfExport][exportReportToPdf] START", { filenameBase });

  const canvas = await html2canvas(node, {
    scale: SCALE,
    backgroundColor: "#ffffff",
    useCORS: true,
  });
  console.log("[pdfExport][exportReportToPdf] captured canvas", {
    width: canvas.width,
    height: canvas.height,
  });

  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  // How many canvas pixels correspond to one A4 page at this image width.
  const pageHeightPx = Math.floor((pageHeight * canvas.width) / imgWidth);

  let renderedPx = 0;
  let isFirstPage = true;
  let pageCount = 0;

  while (renderedPx < canvas.height) {
    const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedPx);

    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeightPx;
    const ctx = pageCanvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    // JPEG has no alpha channel — paint a white backdrop before drawing the slice.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    ctx.drawImage(
      canvas,
      0,
      renderedPx,
      canvas.width,
      sliceHeightPx,
      0,
      0,
      canvas.width,
      sliceHeightPx
    );

    const pageImgHeight = (sliceHeightPx * imgWidth) / canvas.width;
    if (!isFirstPage) pdf.addPage();
    pdf.addImage(
      pageCanvas.toDataURL("image/jpeg", JPEG_QUALITY),
      "JPEG",
      0,
      0,
      imgWidth,
      pageImgHeight
    );

    isFirstPage = false;
    pageCount += 1;
    renderedPx += sliceHeightPx;
  }

  pdf.save(`${filenameBase}.pdf`);
  console.log("[pdfExport][exportReportToPdf] END", { filenameBase, pageCount });
}
