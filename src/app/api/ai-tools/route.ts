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

      return NextResponse.json({
        source: "gemini-ai",
        text: response.text ?? "Aucune réponse générée.",
      });
    }

    // Graceful local fallback when no Gemini key is configured
    if (mode === "reader") {
      const ctx = (body.context ?? "").trim();
      const lines = ctx
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 30)
        .slice(0, 4);
      const summary =
        lines.length > 0
          ? `Synthèse locale du document (${ctx.length} caractères) :\n• ${lines.join("\n• ")}\n\n(Ajoutez une clé Gemini AI pour des réponses sémantiques complètes.)`
          : "Collez un extrait ou importez un PDF pour l'analyser. Ajoutez une clé Gemini AI pour activer le Smart Reader complet.";
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
