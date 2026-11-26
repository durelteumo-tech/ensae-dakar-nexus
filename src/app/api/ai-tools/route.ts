import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      mode?: "reader" | "plan";
      context?: string;
      question?: string;
      brief?: string;
      members?: string[];
      apiKey?: string;
    };

    const apiKey = body.apiKey?.trim() || process.env.GEMINI_API_KEY?.trim();
    const mode = body.mode ?? "reader";

    if (apiKey && apiKey.length > 10) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        let prompt = "";

        if (mode === "reader") {
          const ctx = (body.context ?? "").slice(0, 14000);
          const q = body.question?.trim() || "Résume les points clés du document.";
          prompt = `Tu es un tuteur académique à l'ENSAE Dakar. Réponds précisément en français en t'appuyant uniquement sur le document fourni.\n\nDocument :\n"""\n${ctx}\n"""\n\nQuestion de l'étudiant : ${q}`;
        } else {
          const brief = (body.brief ?? "").slice(0, 8000);
          const members = (body.members ?? []).join(", ") || "Équipe projet ENSAE";
          prompt = `Tu es chef de projet académique à l'ENSAE Dakar. Découpe ce sujet en 5 à 7 sous-tâches concrètes, ordonnées chronologiquement, avec un livrable clair et une suggestion d'attribution parmi : ${members}.\n\nÉnoncé :\n"""\n${brief}\n"""`;
        }

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        if (response.text) {
          return NextResponse.json({
            source: "gemini-ai",
            text: response.text,
          });
        }
      } catch (aiError) {
        console.error("Gemini AI tools fallback triggered:", aiError);
      }
    }

    // Graceful local fallback when no Gemini key is configured or API fails
    if (mode === "reader") {
      const ctx = (body.context ?? "").trim();
      const q = (body.question ?? "").trim();
      const keywords = q
        .toLowerCase()
        .split(/[^a-zà-öø-ÿ0-9]+/i)
        .filter((w) => w.length >= 4);

      const sentences = ctx
        .replace(/\r?\n+/g, " ")
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 30);

      const scored = sentences
        .map((s) => {
          const lower = s.toLowerCase();
          const score = keywords.reduce(
            (acc, kw) => (lower.includes(kw) ? acc + 1 : acc),
            0
          );
          return { s, score };
        })
        .sort((a, b) => b.score - a.score);

      const bestMatches = scored
        .filter((item) => item.score > 0)
        .slice(0, 4)
        .map((item) => item.s);

      const fallbackLines =
        bestMatches.length > 0
          ? bestMatches
          : sentences.slice(0, 4);

      const summary =
        fallbackLines.length > 0
          ? `Extraits pertinents du document (${ctx.length} caractères) :\n• ${fallbackLines.join("\n• ")}`
          : "Collez un extrait ou importez un PDF pour l'analyser.";
      return NextResponse.json({ source: "local", text: summary });
    }

    const members = body.members?.length ? body.members : ["Membre 1", "Membre 2"];
    const planText = [
      `Plan d'action suggéré (${members.join(", ")}) :`,
      `1. Cadrage & revue bibliographique — ${members[0]}`,
      `2. Collecte et nettoyage des données (R / Python) — ${members[members.length > 1 ? 1 : 0]}`,
      `3. Modélisation statistique / économétrique & tests d'hypothèses — ${members[0]}`,
      `4. Rédaction du rapport LaTeX / Quarto & visualisations — ${members[members.length > 1 ? 1 : 0]}`,
      `5. Préparation des slides et soutenance blanche — Toute l'équipe`,
    ].join("\n");

    return NextResponse.json({ source: "local", text: planText });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors du traitement par l'assistant IA." },
      { status: 500 }
    );
  }
}
