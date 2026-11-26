import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import type { ResourceItem } from "@/types";

const DATA_PATH = path.join(process.cwd(), "src", "data", "resources.json");

async function readLocalResources(): Promise<ResourceItem[]> {
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw) as ResourceItem[];
}

export async function GET() {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const mapped: ResourceItem[] = data.map((row) => ({
        id: String(row.id),
        title: String(row.title),
        subject: row.subject as ResourceItem["subject"],
        fileType: row.file_type as ResourceItem["fileType"],
        fileSize: String(row.file_size),
        author: String(row.author_name),
        promo: String(row.promo),
        badge: (row.badge as ResourceItem["badge"]) ?? "100% Validé",
        downloads: Number(row.downloads ?? 0),
        uploadedAt: String(row.created_at).slice(0, 10),
        downloadUrl: String(row.file_url ?? "#"),
      }));
      return NextResponse.json({ mode: "supabase", resources: mapped });
    }
  }

  const resources = await readLocalResources();
  return NextResponse.json({ mode: "server-json", resources });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ResourceItem>;
    const newItem: ResourceItem = {
      id: `res-${Date.now()}`,
      title: body.title?.trim() || "Ressource_ENSAE",
      subject: body.subject ?? "Économétrie",
      fileType: body.fileType ?? "PDF",
      fileSize: body.fileSize ?? "512 KB",
      author: body.author?.trim() || "Étudiant ENSAE",
      promo: body.promo ?? "ISE 2",
      badge: body.badge ?? "100% Validé",
      downloads: 0,
      uploadedAt: new Date().toISOString().slice(0, 10),
      downloadUrl: "#",
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("resources")
        .insert({
          title: newItem.title,
          subject: newItem.subject,
          file_type: newItem.fileType,
          file_size: newItem.fileSize,
          author_name: newItem.author,
          promo: newItem.promo,
          badge: newItem.badge,
          downloads: 0,
          file_url: newItem.downloadUrl,
        })
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({
          mode: "supabase",
          resource: { ...newItem, id: String(data.id) },
        });
      }
      if (error) {
        return NextResponse.json(
          { error: `Supabase: ${error.message}` },
          { status: 500 }
        );
      }
    }

    const current = await readLocalResources();
    const updated = [newItem, ...current];
    await fs.writeFile(DATA_PATH, JSON.stringify(updated, null, 2), "utf-8");

    return NextResponse.json({ mode: "server-json", resource: newItem });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement de la ressource." },
      { status: 400 }
    );
  }
}
