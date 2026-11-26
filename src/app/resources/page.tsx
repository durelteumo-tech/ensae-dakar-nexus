import resourcesData from "@/data/resources.json";
import type { ResourceItem } from "@/types";
import { ResourcesHub } from "@/components/resources/ResourcesHub";

const resources = resourcesData as ResourceItem[];

export default function ResourcesPage() {
  return <ResourcesHub initialResources={resources} />;
}
