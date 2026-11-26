import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

export interface GroupTask {
  id: string;
  groupId: string;
  title: string;
  status: "todo" | "doing" | "done";
  assignee?: string;
}

const DATA_PATH = path.join(process.cwd(), "src", "data", "tasks.json");

async function readTasks(): Promise<GroupTask[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw) as GroupTask[];
  } catch {
    return [];
  }
}

async function writeTasks(tasks: GroupTask[]): Promise<void> {
  try {
    await fs.writeFile(DATA_PATH, JSON.stringify(tasks, null, 2), "utf-8");
  } catch {
    // Ignore on read-only Vercel fs
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("groupId");
  const all = await readTasks();
  const tasks = groupId ? all.filter((t) => t.groupId === groupId) : all;
  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      action?: "create" | "move";
      groupId?: string;
      taskId?: string;
      title?: string;
      assignee?: string;
      status?: GroupTask["status"];
    };

    const tasks = await readTasks();

    if (body.action === "move" && body.taskId && body.status) {
      const updated = tasks.map((t) =>
        t.id === body.taskId ? { ...t, status: body.status! } : t
      );
      await writeTasks(updated);
      return NextResponse.json({ tasks: updated });
    }

    const title = body.title?.trim();
    const groupId = body.groupId?.trim();
    if (!title || !groupId) {
      return NextResponse.json(
        { error: "Titre et salon requis." },
        { status: 400 }
      );
    }

    const newTask: GroupTask = {
      id: `tsk-${Date.now()}`,
      groupId,
      title,
      status: "todo",
      assignee: body.assignee?.trim() || undefined,
    };
    const updated = [...tasks, newTask];
    await writeTasks(updated);
    return NextResponse.json({ task: newTask, tasks: updated });
  } catch {
    return NextResponse.json(
      { error: "Impossible de mettre à jour les tâches." },
      { status: 400 }
    );
  }
}
