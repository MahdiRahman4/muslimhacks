import { Search } from "lucide-react";
import { BRAND } from "@/components/Shared";

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

const selectStyle = {
  background: "rgba(245,238,227,0.06)",
  border: "1px solid rgba(221,168,83,0.18)",
  outline: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C9BBA8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
} as const;

export function ParticipantFilters({ values, onChange }: ParticipantFiltersProps) {
  const update = (patch: Partial<ParticipantFilterValues>) => {
    onChange({ ...values, ...patch });
  };

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: "rgba(245,238,227,0.03)", border: "1px solid rgba(221,168,83,0.1)" }}
    >
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: BRAND.sand }} />
        <input
          type="search"
          placeholder="Search by name or email…"
          value={values.search}
          onChange={(e) => update({ search: e.target.value })}
          className="w-full pl-9 pr-4 py-2.5 font-sans text-sm rounded-lg focus-visible:ring-2 focus-visible:ring-offset-1"
          style={{ background: "rgba(245,238,227,0.06)", border: "1px solid rgba(221,168,83,0.18)", color: BRAND.cream, outline: "none" }}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={values.checkedIn}
          onChange={(e) => update({ checkedIn: e.target.value as ParticipantFilterValues["checkedIn"] })}
          className="flex-1 px-4 py-2.5 font-sans text-sm rounded-lg focus-visible:ring-2 appearance-none"
          style={{ ...selectStyle, color: BRAND.cream }}
        >
          <option value="all" style={{ background: BRAND.navy }}>All check-in statuses</option>
          <option value="true" style={{ background: BRAND.navy }}>Checked in</option>
          <option value="false" style={{ background: BRAND.navy }}>Not checked in</option>
        </select>

        <select
          value={values.gender}
          onChange={(e) => update({ gender: e.target.value as ParticipantFilterValues["gender"] })}
          className="flex-1 px-4 py-2.5 font-sans text-sm rounded-lg focus-visible:ring-2 appearance-none"
          style={{ ...selectStyle, color: BRAND.cream }}
        >
          <option value="all" style={{ background: BRAND.navy }}>All genders</option>
          <option value="Male" style={{ background: BRAND.navy }}>Male</option>
          <option value="Female" style={{ background: BRAND.navy }}>Female</option>
          <option value="Other" style={{ background: BRAND.navy }}>Other</option>
        </select>

        <select
          value={`${values.sortBy}:${values.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split(":") as [
              ParticipantFilterValues["sortBy"],
              ParticipantFilterValues["sortOrder"],
            ];
            update({ sortBy, sortOrder });
          }}
          className="flex-1 px-4 py-2.5 font-sans text-sm rounded-lg focus-visible:ring-2 appearance-none"
          style={{ ...selectStyle, color: BRAND.cream }}
        >
          <option value="created_at:desc" style={{ background: BRAND.navy }}>Newest first</option>
          <option value="created_at:asc" style={{ background: BRAND.navy }}>Oldest first</option>
          <option value="checked_in_at:desc" style={{ background: BRAND.navy }}>Checked in (recent)</option>
          <option value="checked_in_at:asc" style={{ background: BRAND.navy }}>Checked in (oldest)</option>
        </select>
      </div>
    </div>
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
