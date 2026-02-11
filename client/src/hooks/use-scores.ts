import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface Score {
  id: number;
  initials: string;
  score: number;
  createdAt: string;
}

export function useScores() {
  return useQuery<Score[]>({
    queryKey: ["/api/scores"],
  });
}

export function useCreateScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { initials: string; score: number }) => {
      const res = await apiRequest("POST", "/api/scores", {
        initials: data.initials.toUpperCase().slice(0, 3),
        score: data.score,
      });
      return (await res.json()) as Score;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scores"] });
    },
  });
}
