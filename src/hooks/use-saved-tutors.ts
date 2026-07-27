"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSavedTutors, saveTutor, unsaveTutor } from "@/services/saved-tutors-api";

export function useSavedTutors(enabled = true) {
  return useQuery({
    queryKey: ["saved-tutors"],
    queryFn: fetchSavedTutors,
    enabled,
  });
}

export function useToggleSaveTutor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ tutorId, currentlySaved }: { tutorId: string; currentlySaved: boolean }) => {
      if (currentlySaved) await unsaveTutor(tutorId);
      else await saveTutor(tutorId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-tutors"] });
    },
  });
}
