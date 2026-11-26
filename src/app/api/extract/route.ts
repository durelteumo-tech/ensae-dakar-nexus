import { NextResponse } from "next/server";
import { extractText } from "unpdf";

const MAX_EXTRACTED_CHARS = 15000;

function cleanPdfLines(raw: string): string {
  return raw
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => {
      if (line.length < 20) return false;
      // Skip Table of Contents dot leaders ("......" or "…")
      if (/\.{4,}|…{2,}/.test(line)) return false;
      // Skip lines that look like "20Votre première page..." or "Chapter 3 .... 42"
      if (/^\d{1,3}[A-ZÀ-ÖØ-Ý]/.test(line)) return false;
      if (/\s\d{1,4}$/.test(line) && line.length < 75) return false;
      return true;
    })
    .join("\n");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Aucun fichier reçu." },
        { status: 400 }
      );
    }

    const fileName = file.name;
    const lowerName = fileName.toLowerCase();
    let extractedText = "";
    let pageCount: number | undefined;

    if (lowerName.endsWith(".pdf")) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await extractText(new Uint8Array(arrayBuffer), {
        mergePages: false,
      });
      const pages = Array.isArray(result.text)
        ? result.text
        : [String(result.text ?? "")];
      pageCount = result.totalPages ?? pages.length;

      // Clean each page and skip early TOC/cover pages if the PDF is multi-page
      const cleanedPages = pages
        .map((p) => cleanPdfLines(p))
        .filter((p) => p.length > 80);

      // If PDF has many pages (> 8), skip the first 2 pages (usually cover + TOC)
      const bodyPages =
        cleanedPages.length > 8 ? cleanedPages.slice(2) : cleanedPages;

      // Sample evenly across the document so we don't only get the introduction
      if (bodyPages.length > 12) {
        const step = Math.floor(bodyPages.length / 10);
        const sampled: string[] = [];
        for (let i = 0; i < bodyPages.length; i += step) {
          sampled.push(bodyPages[i]);
        }
        extractedText = sampled.join("\n\n").trim();
      } else {
        extractedText = bodyPages.join("\n\n").trim();
      }

      if (!extractedText) {
        return NextResponse.json(
          {
            error:
              "Ce PDF ne contient pas de texte exploitable (PDF scanné en image). Collez un extrait de cours manuellement.",
          },
          { status: 422 }
        );
      }
    } else if (lowerName.endsWith(".ipynb")) {
      const raw = await file.text();
      const nb = JSON.parse(raw) as {
        cells?: Array<{ cell_type?: string; source?: string[] | string }>;
      };
      const cells = nb.cells ?? [];
      extractedText = cells
        .map((cell) => {
          const src = Array.isArray(cell.source)
            ? cell.source.join("")
            : (cell.source ?? "");
          return src.trim();
        })
        .filter(Boolean)
        .join("\n\n");
    } else {
      extractedText = (await file.text()).trim();
    }

    const clipped = extractedText.slice(0, MAX_EXTRACTED_CHARS);

    return NextResponse.json({
      fileName,
      text: clipped,
      charCount: extractedText.length,
      pageCount,
    });
  } catch (err) {
    console.error("File extraction error:", err);
    return NextResponse.json(
      { error: "Impossible de lire le contenu de ce fichier." },
      { status: 500 }
    );
  }
}
