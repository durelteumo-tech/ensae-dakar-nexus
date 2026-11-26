import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getSupabaseClient } from "@/lib/supabase";
import type { ChatMessage } from "@/types";

const DATA_PATH = path.join(process.cwd(), "src", "data", "chat-messages.json");

async function readLocalMessages(): Promise<ChatMessage[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw) as ChatMessage[];
  } catch {
    return [];
  }
}

async function writeLocalMessages(messages: ChatMessage[]): Promise<void> {
  try {
    await fs.writeFile(DATA_PATH, JSON.stringify(messages, null, 2), "utf-8");
  } catch {
    // Ignore write failures on read-only filesystems
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("groupId");

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      let query = supabase
        .from("chat_messages")
        .select("*")
        .order("created_ts", { ascending: true });

      if (groupId) {
        query = query.eq("group_id", groupId);
      }

      const { data, error } = await query;
      if (!error && data) {
        const messages: ChatMessage[] = data.map((row) => ({
          id: String(row.id),
          groupId: String(row.group_id),
          author: String(row.author),
          promo: String(row.promo),
          specialty: row.specialty ? String(row.specialty) : undefined,
          content: String(row.content),
          createdAt: String(row.created_at),
          timestamp: Number(row.created_ts),
        }));
        return NextResponse.json({ messages, synced: "supabase" });
      }
    } catch {
      // Fall back to local server storage
    }
  }

  const all = await readLocalMessages();
  const messages = groupId ? all.filter((m) => m.groupId === groupId) : all;
  return NextResponse.json({ messages, synced: "server" });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      groupId?: string;
      author?: string;
      promo?: string;
      specialty?: string;
      content?: string;
    };

    const groupId = body.groupId?.trim();
    const content = body.content?.trim();

    if (!groupId || !content) {
      return NextResponse.json(
        { error: "Salon et message requis." },
        { status: 400 }
      );
    }

    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      groupId,
      author: body.author?.trim() || "Moussa Diop",
      promo: body.promo?.trim() || "ISE2",
      specialty: body.specialty?.trim() || undefined,
      content,
      createdAt: `${hh}:${mm}`,
      timestamp: Date.now(),
    };

    const supabase = getSupabaseClient();
  if (supabase) {
      try {
        const { error } = await supabase.from("chat_messages").insert({
          id: newMessage.id,
          group_id: newMessage.groupId,
          author: newMessage.author,
          promo: newMessage.promo,
          specialty: newMessage.specialty ?? null,
          content: newMessage.content,
          created_at: newMessage.createdAt,
          created_ts: newMessage.timestamp,
        });
        if (!error) {
          return NextResponse.json({ message: newMessage, synced: "supabase" });
        }
      } catch {
        // Fall through to local server file
      }
    }

    const existing = await readLocalMessages();
    const updated = [...existing, newMessage];
    await writeLocalMessages(updated);

    return NextResponse.json({ message: newMessage, synced: "server" });
  } catch {
    return NextResponse.json(
      { error: "Impossible d'envoyer le message." },
      { status: 400 }
    );
  }
}
