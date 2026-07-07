import { escapeLike } from "./auth";

export interface ListFilters {
  gender: string | null;
  search: string | null;
  checkedIn: boolean | null;
}

export type SortBy = "created_at" | "checked_in_at";
export type SortOrder = "asc" | "desc";

export function parseListFilters(url: URL): { error: string } | ListFilters {
  const gender = url.searchParams.get("gender");
  const search = url.searchParams.get("search")?.trim() ?? "";
  const checkedInRaw = url.searchParams.get("checked_in");

  if (gender && gender.length > 50) {
    return { error: "Invalid gender filter" };
  }
  if (search.length > 100) {
    return { error: "search must be at most 100 characters" };
  }

  let checkedIn: boolean | null = null;
  if (checkedInRaw === "true") {
    checkedIn = true;
  } else if (checkedInRaw === "false") {
    checkedIn = false;
  } else if (checkedInRaw !== null && checkedInRaw !== "") {
    return { error: "checked_in must be true or false" };
  }

  return {
    gender: gender || null,
    search: search || null,
    checkedIn,
  };
}

export function parseSort(url: URL): { sortBy: SortBy; sortOrder: SortOrder } | { error: string } {
  const sortByRaw = url.searchParams.get("sort_by") ?? "created_at";
  const sortOrderRaw = url.searchParams.get("sort_order") ?? "desc";

  if (sortByRaw !== "created_at" && sortByRaw !== "checked_in_at") {
    return { error: "sort_by must be created_at or checked_in_at" };
  }
  if (sortOrderRaw !== "asc" && sortOrderRaw !== "desc") {
    return { error: "sort_order must be asc or desc" };
  }

  return { sortBy: sortByRaw, sortOrder: sortOrderRaw };
}

export function buildOrderBy(sortBy: SortBy, sortOrder: SortOrder): string {
  const direction = sortOrder === "asc" ? "ASC" : "DESC";
  if (sortBy === "checked_in_at") {
    return `p.checked_in_at IS NULL, p.checked_in_at ${direction}, p.created_at DESC`;
  }
  return `p.created_at ${direction}`;
}

export function buildListQuery(
  filters: ListFilters,
  tableAlias = "p",
): { where: string; binds: (string | number)[] } {
  const clauses: string[] = [];
  const binds: (string | number)[] = [];

  if (filters.checkedIn === true) {
    clauses.push(`${tableAlias}.checkin_status = 'checked_in'`);
  } else if (filters.checkedIn === false) {
    clauses.push(`${tableAlias}.checkin_status = 'not_checked_in'`);
  }

  if (filters.gender) {
    clauses.push(`${tableAlias}.gender = ?`);
    binds.push(filters.gender);
  }

  if (filters.search) {
    const pattern = `%${escapeLike(filters.search)}%`;
    clauses.push(
      `(${tableAlias}.full_name LIKE ? ESCAPE '\\' OR ${tableAlias}.email LIKE ? ESCAPE '\\')`,
    );
    binds.push(pattern, pattern);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  return { where, binds };
}
