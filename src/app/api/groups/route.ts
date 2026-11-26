import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getSupabaseClient } from "@/lib/supabase";
import type { StudentGroup } from "@/types";

const DATA_PATH = path.join(process.cwd(), "src", "data", "groups.json");

async function readLocalGroups(): Promise<StudentGroup[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw) as StudentGroup[];
  } catch {
    return [];
  }
}

async function writeLocalGroups(groups: StudentGroup[]): Promise<void> {
  try {
    await fs.writeFile(DATA_PATH, JSON.stringify(groups, null, 2), "utf-8");
  } catch {
    // Ignore write failures in read-only Vercel serverless environment
  }
}

export async function GET() {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("study_groups")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const groups: StudentGroup[] = data.map((row) => ({
          id: String(row.id),
          name: String(row.name),
          subject: String(row.subject),
          promo: String(row.promo),
          code: String(row.code),
          members: Array.isArray(row.members) ? (row.members as string[]) : [],
          createdBy: String(row.created_by),
        }));
        return NextResponse.json({ groups, synced: "supabase" });
      }
    } catch {
      // Fall back to local JSON
    }
  }

  const groups = await readLocalGroups();
  return NextResponse.json({ groups, synced: "server" });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      action?: "create" | "join";
      name?: string;
      subject?: string;
      promo?: string;
      code?: string;
      memberName?: string;
    };

    const memberName = body.memberName?.trim() || "Moussa Diop";
    const supabase = getSupabaseClient();

    if (body.action === "join") {
      const code = body.code?.trim().toUpperCase();
      if (!code) {
        return NextResponse.json(
          { error: "Veuillez saisir un code de groupe." },
          { status: 400 }
        );
      }

      if (supabase) {
        try {
          const { data: found } = await supabase
            .from("study_groups")
            .select("*")
            .eq("code", code)
            .maybeSingle();

          if (found) {
            const members = Array.isArray(found.members)
              ? (found.members as string[])
              : [];
            const nextMembers = members.includes(memberName)
              ? members
              : [...members, memberName];

            await supabase
              .from("study_groups")
              .update({ members: nextMembers })
              .eq("id", found.id);

            const { data: allRows } = await supabase
              .from("study_groups")
              .select("*")
              .order("created_at", { ascending: false });

            const groups: StudentGroup[] = (allRows ?? []).map((row) => ({
              id: String(row.id),
              name: String(row.name),
              subject: String(row.subject),
              promo: String(row.promo),
              code: String(row.code),
              members: Array.isArray(row.members)
                ? (row.members as string[])
                : [],
              createdBy: String(row.created_by),
            }));

            return NextResponse.json({
              group: {
                id: String(found.id),
                name: String(found.name),
                subject: String(found.subject),
                promo: String(found.promo),
                code: String(found.code),
                members: nextMembers,
                createdBy: String(found.created_by),
              },
              groups,
            });
          }
        } catch {
          // Fall back to local
        }
      }

      const groups = await readLocalGroups();
      const target = groups.find((g) => g.code.toUpperCase() === code);
      if (!target) {
        return NextResponse.json(
          { error: `Aucun groupe trouvé pour le code "${code}".` },
          { status: 404 }
        );
      }

      const updated = groups.map((g) =>
        g.id === target.id && !g.members.includes(memberName)
          ? { ...g, members: [...g.members, memberName] }
          : g
      );
      await writeLocalGroups(updated);
      return NextResponse.json({ group: target, groups: updated });
    }

    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json(
        { error: "Le nom du groupe est requis." },
        { status: 400 }
      );
    }

    const generatedCode = `ENSAE-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;

    const newGroup: StudentGroup = {
      id: `grp-${Date.now()}`,
      name,
      subject: body.subject?.trim() || "Général",
      promo: body.promo?.trim() || "ISE2",
      code: generatedCode,
      members: [memberName],
      createdBy: memberName,
    };

    if (supabase) {
      try {
        const { error } = await supabase.from("study_groups").insert({
          id: newGroup.id,
          name: newGroup.name,
          subject: newGroup.subject,
          promo: newGroup.promo,
          code: newGroup.code,
          members: newGroup.members,
          created_by: newGroup.createdBy,
        });

        if (error) {
          return NextResponse.json(
            { error: `Supabase: ${error.message}` },
            { status: 500 }
          );
        }

        const { data: allRows } = await supabase
          .from("study_groups")
          .select("*")
          .order("created_at", { ascending: false });

        const groups: StudentGroup[] = (allRows ?? []).map((row) => ({
          id: String(row.id),
          name: String(row.name),
          subject: String(row.subject),
          promo: String(row.promo),
          code: String(row.code),
          members: Array.isArray(row.members)
            ? (row.members as string[])
            : [],
          createdBy: String(row.created_by),
        }));

        return NextResponse.json({ group: newGroup, groups });
      } catch (e) {
        return NextResponse.json(
          { error: `Erreur Supabase: ${String(e)}` },
          { status: 500 }
        );
      }
    }

    const groups = await readLocalGroups();
    const updated = [newGroup, ...groups];
    await writeLocalGroups(updated);
    return NextResponse.json({ group: newGroup, groups: updated });
  } catch {
    return NextResponse.json(
      { error: "Impossible de traiter la demande de groupe." },
      { status: 400 }
    );
  }
}
