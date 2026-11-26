import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import type { StudentProfile } from "@/types";

const DATA_PATH = path.join(process.cwd(), "src", "data", "students.json");

async function readLocalStudents(): Promise<StudentProfile[]> {
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw) as StudentProfile[];
}

export async function GET() {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("updated_at", { ascending: false });

    if (!error && data && data.length > 0) {
      const mapped: StudentProfile[] = data.map((row) => ({
        id: String(row.id),
        email: String(row.email),
        name: String(row.full_name),
        promo: row.promo as StudentProfile["promo"],
        specialty: String(row.specialty),
        skills: Array.isArray(row.skills) ? row.skills : [],
        lookingFor: Array.isArray(row.looking_for) ? row.looking_for : [],
        matchScore: 90,
        projectIdea: String(row.project_idea ?? ""),
        whatsappHandle: String(row.whatsapp_handle ?? ""),
        discordHandle: String(row.discord_handle ?? ""),
        availability:
          (row.availability as StudentProfile["availability"]) ?? "Disponible",
      }));
      return NextResponse.json({ mode: "supabase", students: mapped });
    }
  }

  const students = await readLocalStudents();
  return NextResponse.json({ mode: "server-json", students });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<StudentProfile> & {
      email?: string;
    };

    if (!body.email || !body.email.toLowerCase().endsWith("@ensae.sn")) {
      return NextResponse.json(
        { error: "Adresse @ensae.sn requise." },
        { status: 400 }
      );
    }

    const students = await readLocalStudents();
    const existingIndex = students.findIndex(
      (s) => s.email?.toLowerCase() === body.email?.toLowerCase()
    );

    const profile: StudentProfile = {
      id: existingIndex >= 0 ? students[existingIndex].id : `stu-${Date.now()}`,
      email: body.email.toLowerCase(),
      name:
        body.name?.trim() ||
        (existingIndex >= 0 ? students[existingIndex].name : body.email.split("@")[0]),
      promo: body.promo ?? (existingIndex >= 0 ? students[existingIndex].promo : "ISE2"),
      specialty:
        body.specialty?.trim() ||
        (existingIndex >= 0
          ? students[existingIndex].specialty
          : "Statistique & Data Science"),
      skills:
        body.skills && body.skills.length > 0
          ? body.skills
          : existingIndex >= 0
          ? students[existingIndex].skills
          : ["Python", "R"],
      lookingFor:
        body.lookingFor && body.lookingFor.length > 0
          ? body.lookingFor
          : existingIndex >= 0
          ? students[existingIndex].lookingFor
          : ["Économétrie"],
      matchScore: existingIndex >= 0 ? students[existingIndex].matchScore : 88,
      projectIdea:
        body.projectIdea?.trim() ||
        (existingIndex >= 0
          ? students[existingIndex].projectIdea
          : "Recherche de binôme pour projet académique ENSAE."),
      whatsappHandle:
        body.whatsappHandle?.trim() ||
        (existingIndex >= 0 ? students[existingIndex].whatsappHandle : "221770000000"),
      discordHandle:
        body.discordHandle?.trim() ||
        (existingIndex >= 0
          ? students[existingIndex].discordHandle
          : `${body.email.split("@")[0]}#0001`),
      availability:
        body.availability ??
        (existingIndex >= 0 ? students[existingIndex].availability : "Disponible"),
    };

    const updated =
      existingIndex >= 0
        ? students.map((s, idx) => (idx === existingIndex ? profile : s))
        : [profile, ...students];

    await fs.writeFile(DATA_PATH, JSON.stringify(updated, null, 2), "utf-8");

    return NextResponse.json({ mode: "server-json", student: profile });
  } catch {
    return NextResponse.json(
      { error: "Impossible de mettre à jour le profil étudiant." },
      { status: 400 }
    );
  }
}
