import type {StudySegment} from "@/lib/study-meetings";

export const segment = (title: string, minutes: number): StudySegment => ({title, minutes, outcome: "", role_a: "peer", role_b: "peer"});

export const presets: Record<number, StudySegment[]> = {
  25: [segment("Chốt mục tiêu", 5), segment("Tự thử", 5), segment("Cùng giải thích", 10), segment("Chốt kết quả", 5)],
  50: [segment("Chốt mục tiêu", 5), segment("Tự thử", 10), segment("Học và làm", 15), segment("Nghỉ", 5), segment("Giải thích lại", 10), segment("Chốt kết quả", 5)],
  75: [segment("Chốt mục tiêu", 5), segment("Tự thử", 15), segment("Học và làm", 25), segment("Nghỉ", 5), segment("Bài tương tự", 20), segment("Chốt kết quả", 5)],
};
