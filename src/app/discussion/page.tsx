import { promises as fs } from "node:fs";
import path from "node:path";
import type { ChatMessage, StudentGroup } from "@/types";
import { DiscussionBoard } from "@/components/discussion/DiscussionBoard";

export const dynamic = "force-dynamic";

export default async function DiscussionPage() {
  let groups: StudentGroup[] = [];
  let messages: ChatMessage[] = [];

  try {
    const rawGroups = await fs.readFile(
      path.join(process.cwd(), "src", "data", "groups.json"),
      "utf-8"
    );
    groups = JSON.parse(rawGroups) as StudentGroup[];
  } catch {
    groups = [];
  }

  try {
    const rawMsgs = await fs.readFile(
      path.join(process.cwd(), "src", "data", "chat-messages.json"),
      "utf-8"
    );
    messages = JSON.parse(rawMsgs) as ChatMessage[];
  } catch {
    messages = [];
  }

  return (
    <DiscussionBoard initialGroups={groups} initialMessages={messages} />
  );
}
