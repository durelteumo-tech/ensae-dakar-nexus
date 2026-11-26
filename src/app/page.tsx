import { promises as fs } from "node:fs";
import path from "node:path";
import activitiesData from "@/data/activities.json";
import resourcesData from "@/data/resources.json";
import type { ActivityItem, ResourceItem, StudentGroup } from "@/types";
import { PersonalDashboard } from "@/components/dashboard/PersonalDashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const activities = activitiesData as ActivityItem[];
  const resources = resourcesData as ResourceItem[];

  let groups: StudentGroup[] = [];
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), "src", "data", "groups.json"),
      "utf-8"
    );
    groups = JSON.parse(raw) as StudentGroup[];
  } catch {
    groups = [];
  }

  return (
    <PersonalDashboard
      activities={activities}
      resources={resources}
      initialGroups={groups}
    />
  );
}
