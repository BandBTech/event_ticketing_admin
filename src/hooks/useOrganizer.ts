import { useQuery } from "@tanstack/react-query";
import { OrganizerService } from "@/services/organizerService";
import { queryKeys } from "@/lib/queryKeys";

export const useOrganizerById = (id?: string) => {
  return useQuery({
    queryKey: queryKeys.organizers.detail(id),
    queryFn: () => {
      if (!id) {
        throw new Error("Organizer id is required");
      }
      return OrganizerService.getOrganizerById(id);
    },
    enabled: !!id,
  });
};
