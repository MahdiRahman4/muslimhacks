import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ParticipantFilterValues {
  search: string;
  checkedIn: "all" | "true" | "false";
  gender: "all" | "Male" | "Female" | "Other";
  sortBy: "created_at" | "checked_in_at";
  sortOrder: "asc" | "desc";
}

interface ParticipantFiltersProps {
  values: ParticipantFilterValues;
  onChange: (values: ParticipantFilterValues) => void;
}

export function ParticipantFilters({ values, onChange }: ParticipantFiltersProps) {
  const update = (patch: Partial<ParticipantFilterValues>) => {
    onChange({ ...values, ...patch });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Filters</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Name or email"
            value={values.search}
            onChange={(e) => update({ search: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Check-in</Label>
          <Select
            value={values.checkedIn}
            onValueChange={(v) => update({ checkedIn: v as ParticipantFilterValues["checkedIn"] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Checked in</SelectItem>
              <SelectItem value="false">Not checked in</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Gender</Label>
          <Select
            value={values.gender}
            onValueChange={(v) => update({ gender: v as ParticipantFilterValues["gender"] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Sort</Label>
          <Select
            value={`${values.sortBy}:${values.sortOrder}`}
            onValueChange={(v) => {
              const [sortBy, sortOrder] = v.split(":") as [
                ParticipantFilterValues["sortBy"],
                ParticipantFilterValues["sortOrder"],
              ];
              update({ sortBy, sortOrder });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at:desc">Newest first</SelectItem>
              <SelectItem value="created_at:asc">Oldest first</SelectItem>
              <SelectItem value="checked_in_at:desc">Checked in (recent)</SelectItem>
              <SelectItem value="checked_in_at:asc">Checked in (oldest)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

export function filtersToQueryParams(values: ParticipantFilterValues) {
  return {
    search: values.search.trim() || undefined,
    checked_in: values.checkedIn === "all" ? undefined : values.checkedIn,
    gender: values.gender === "all" ? undefined : values.gender,
    sort_by: values.sortBy,
    sort_order: values.sortOrder,
  };
}
