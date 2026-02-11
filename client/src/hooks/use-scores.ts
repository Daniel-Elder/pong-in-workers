import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface LocalScore {
  id: number;
  initials: string;
  score: number;
  createdAt: string;
}

const STORAGE_KEY = "pong_high_scores";

function getStoredScores(): LocalScore[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LocalScore[];
  } catch {
    return [];
  }
}

function saveScores(scores: LocalScore[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
}

export function useScores() {
  return useQuery({
    queryKey: ["local-scores"],
    queryFn: async () => {
      const scores = getStoredScores();
      return scores.sort((a, b) => b.score - a.score).slice(0, 10);
    },
  });
}

export function useCreateScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { initials: string; score: number }) => {
      const scores = getStoredScores();
      const newScore: LocalScore = {
        id: Date.now(),
        initials: data.initials.toUpperCase().slice(0, 3),
        score: data.score,
        createdAt: new Date().toISOString(),
      };
      scores.push(newScore);
      saveScores(scores);
      return newScore;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["local-scores"] });
    },
  });
}
