const input = document.getElementById("pdfinput");
const pdfFrame = document.getElementById("pdfFrame");
const rangeselector = document.getElementById("rangeselector");
const extractBtn = document.getElementById("extractBtn");

let pdfArrayBuffer;

// Read our file in async/await fashion
function readAsyncFile(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// Reander the pdf in an Iframe
function renderPdf(arrayBuff) {
  const tempblob = new Blob([new Uint8Array(arrayBuff)], {
    type: "application/pdf",
  });
  const docUrl = URL.createObjectURL(tempblob);
  pdfFrame.src = docUrl;
}

// Select page range
function range(start, end) {
  let length = end - start + 1;
  return Array.from({ length }, (_, i) => start + i - 1);
}

// Get the files from filepicker
input.addEventListener("change", async (e) => {
  const files = e.target.files;
  console.log(files);
  if (files.length > 0) {
    pdfArrayBuffer = await readAsyncFile(files[0]);
    renderPdf(pdfArrayBuffer);
  }
});

// Start extraction
extractBtn.addEventListener("click", async () => {
  const rawRange = rangeselector.value;
  const rangelist = rawRange.split("-");
  const pdfSrcDoc = await PDFLib.PDFDocument.load(pdfArrayBuffer);

  const pdfNewDoc = await PDFLib.PDFDocument.create();

  const pages = await pdfNewDoc.copyPages(
    pdfSrcDoc,
    range(Number(rangelist[0]), Number(rangelist[1]))
  );

  pages.forEach((page) => pdfNewDoc.addPage(page));
  const newpdf = await pdfNewDoc.save();
  saveAs(new Blob([newpdf], { type: "application/pdf" }), `extracted.pdf`);
});
