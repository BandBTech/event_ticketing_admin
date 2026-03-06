import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useQuery } from "@tanstack/react-query";
import { OrganizerService, AllOrganizers } from "@/services/organizerService";
import { queryKeys } from "@/lib/queryKeys";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { UsersIcon, X } from "@phosphor-icons/react";
import React from "react";

// Organizer Filter
export function OrganizerFilterSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const { data: organizersData, isLoading } = useQuery({
    queryKey: queryKeys.organizers.all({ all_approved: true }),
    queryFn: () => OrganizerService.getOrganizers({ all_approved: true }),
  });

  const organizers = React.useMemo(() => {
    if (!organizersData) return [];
    if (Array.isArray(organizersData)) return organizersData;

    // Use type guard to safely check for OrganizerListResponse
    const data = organizersData as unknown;
    if (
      data &&
      typeof data === "object" &&
      "organizers" in data &&
      Array.isArray((data as { organizers: unknown }).organizers)
    ) {
      return (data as { organizers: AllOrganizers[] }).organizers;
    }
    return [];
  }, [organizersData]);

  const selectedOrganizer = organizers?.find((org) => org.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[220px] justify-between bg-background truncate font-normal group/trigger h-9"
          disabled={isLoading}
        >
          {isLoading ? (
            t("common.loading")
          ) : (
            <div className="flex items-center gap-2 overflow-hidden flex-1 -ml-2">
              <Avatar className="h-5 w-5 shrink-0">
                {selectedOrganizer ? (
                  <>
                      <AvatarImage
                        src={selectedOrganizer?.logo}
                        alt={selectedOrganizer?.name}
                        className="object-contain"
                      />
                    <AvatarFallback className="text-[10px]">
                        {selectedOrganizer?.name?.charAt(0)}
                    </AvatarFallback>
                  </>
                ) : (
                  <AvatarFallback className="bg-muted">
                    <UsersIcon size={12} />
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="truncate">
                  {selectedOrganizer
                    ? selectedOrganizer?.name
                    : t("events.filterByOrganizer", "Filter by Organizer")}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1 ml-2 -mr-2 shrink-0">
            {value && value !== "all" ? (
              <div
                role="button"
                className="p-1 hover:bg-muted rounded-full transition-colors opacity-60 hover:opacity-100"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onChange("all");
                }}
              >
                <X className="h-3 w-3" strokeWidth={3} />
              </div>
            ) : (
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0">
        <Command
          filter={(value, search) => {
            const name = value.split("|")[1] || value;
            if (name?.toLowerCase().includes(search.toLowerCase())) return 1;
            return 0;
          }}
        >
          <CommandInput
            placeholder={t(
              "organizer.searchOrganizers",
              "Search organizers...",
            )}
          />
          <CommandList>
            <CommandEmpty>
              {t("organizer.noOrganizerFound", "No organizer found.")}
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all"
                onSelect={() => {
                  onChange("all");
                  setOpen(false);
                }}
              >
                <div className="flex items-center flex-1 gap-2 overflow-hidden w-full">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-muted">
                      <UsersIcon size={14} />
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">
                    {t("events.allOrganizers", "All Organizers")}
                  </span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4 shrink-0",
                      value === "" || value === "all"
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                </div>
              </CommandItem>
              {organizers.map((organizer) => (
                <CommandItem
                  key={organizer?.id}
                  value={`${organizer?.id}|${organizer?.name}`}
                  onSelect={() => {
                    onChange(organizer?.id);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center flex-1 gap-2 overflow-hidden w-full">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={organizer.logo} alt={organizer?.name} />
                      <AvatarFallback className="text-xs">
                        {organizer?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{organizer?.name}</span>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0",
                        value === organizer?.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
