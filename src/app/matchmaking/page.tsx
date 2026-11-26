import studentsData from "@/data/students.json";
import type { StudentProfile } from "@/types";
import { MatchmakingBoard } from "@/components/matchmaking/MatchmakingBoard";

const students = studentsData as StudentProfile[];

export default function MatchmakingPage() {
  return <MatchmakingBoard initialStudents={students} />;
}
