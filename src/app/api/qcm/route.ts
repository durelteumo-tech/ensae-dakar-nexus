import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { generateDynamicFallbackQcm } from "@/lib/qcm-engine";
import type { QcmQuestion } from "@/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      documentName?: string;
      documentText?: string;
      subject?: string;
      difficulty?: string;
      count?: number;
      apiKey?: string;
    };

    const documentName = body.documentName?.trim() || "Cours_ENSAE.pdf";
    const documentText = body.documentText?.trim() || "";
    const subject = body.subject || "Auto";
    const difficulty = body.difficulty || "Mixte";
    const count = Math.min(Math.max(Number(body.count) || 5, 3), 7);

    const apiKey = body.apiKey?.trim() || process.env.GEMINI_API_KEY?.trim();

    if (apiKey && apiKey.length > 10) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Tu es un enseignant expert qui rédige un QCM de compréhension et de maîtrise technique en français.
Génère exactement ${count} questions de QCM pertinentes, précises et variées.
- Document source : "${documentName}"
- Matière sélectionnée : ${subject}
- Niveau de difficulté : ${difficulty}
${
  documentText
    ? `- Contenu réel extrait du document (OBLIGATOIRE : chaque question doit porter exclusivement sur les notions, définitions, règles, formules ou extraits de code présents dans ce texte ; ne pose aucune question hors sujet) :\n"""\n${documentText.slice(0, 15000)}\n"""`
    : `- Aucun texte brut fourni : génère des questions pointues cohérentes avec le titre "${documentName}".`
}
Chaque question doit comporter exactement 4 options crédibles (sans réponse évidente) et une explication pédagogique claire citant le point du cours.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                },
                required: ["question", "options", "correctIndex", "explanation"],
              },
            },
          },
        });

        const parsed = JSON.parse(response.text ?? "[]") as Array<{
          question: string;
          options: string[];
          correctIndex: number;
          explanation: string;
        }>;

        if (Array.isArray(parsed) && parsed.length > 0) {
          const questions: QcmQuestion[] = parsed.map((q, index) => ({
            id: `ai-${Date.now()}-${index}`,
            question: q.question,
            options: q.options.slice(0, 4),
            correctIndex: Math.min(Math.max(q.correctIndex, 0), 3),
            explanation: q.explanation,
          }));

          return NextResponse.json({
            source: "gemini-ai",
            needsApiKey: false,
            questions,
          });
        }
      } catch (aiError) {
        console.error("Gemini API fallback triggered:", aiError);
      }
    }

    const questions = generateDynamicFallbackQcm({
      documentName,
      documentText,
      subject,
      difficulty,
      count,
    });

    return NextResponse.json({
      source: "dynamic-engine",
      needsApiKey: !apiKey,
      questions,
    });
  } catch {
    return NextResponse.json(
      { error: "Impossible de générer le QCM pour ce document." },
      { status: 400 }
    );
  }
}
