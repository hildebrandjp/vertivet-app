"use client";

import { type ReactNode, useId, useMemo, useState } from "react";
import type { Align } from "../common";
import { useControllableState } from "../hooks/useControllableState";
import { cx } from "../utils/cx";
import { Checkbox } from "./Checkbox";
import styles from "./DataTable.module.css";
import { InputGroup } from "./InputGroup";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronsUpDownIcon,
  SearchIcon,
} from "./icons";
import { Pagination } from "./Pagination";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table";
import { TextInput } from "./TextInput";

type SortValue = string | number | Date | null | undefined;
export type SortDirection = "asc" | "desc";
export interface SortState {
  columnId: string;
  direction: SortDirection;
}

export interface DataTableColumn<T> {
  id: string;
  header: ReactNode;
  /** Cell content. */
  cell: (row: T) => ReactNode;
  /** Makes the column sortable by this value. */
  sortValue?: (row: T) => SortValue;
  /** Text matched by the search box. Falls back to `sortValue`. */
  searchValue?: (row: T) => string;
  align?: Align;
  /** CSS width, e.g. "120px" or "20%". */
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  title?: ReactNode;
  /** Extra controls in the toolbar (filters, buttons). */
  toolbar?: ReactNode;
  /** Accessible table description, visually hidden. */
  caption?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  selectable?: boolean;
  selectedIds?: string[];
  defaultSelectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  defaultSort?: SortState | null;
  /** Rows per page. 0 disables pagination. */
  pageSize?: number;
  emptyMessage?: ReactNode;
  className?: string;
}

const EMPTY_IDS: string[] = [];

function compareValues(a: SortValue, b: SortValue): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

/**
 * Richer data listing (10 Data Table): search, sortable columns,
 * row selection and pagination on top of the <Table> primitives.
 */
export function DataTable<T>({
  data,
  columns,
  getRowId,
  title,
  toolbar,
  caption,
  searchable = true,
  searchPlaceholder = "Search…",
  selectable = false,
  selectedIds,
  defaultSelectedIds = EMPTY_IDS,
  onSelectionChange,
  defaultSort = null,
  pageSize = 10,
  emptyMessage = "No results.",
  className,
}: DataTableProps<T>) {
  const titleId = useId();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState | null>(defaultSort);
  const [page, setPage] = useState(1);
  const [selection, setSelection] = useControllableState({
    value: selectedIds,
    defaultValue: defaultSelectedIds,
    onChange: onSelectionChange,
  });
  const selectedSet = useMemo(() => new Set(selection), [selection]);

  // 1. Search
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return data;
    return data.filter((row) =>
      columns.some((column) => {
        const raw = column.searchValue?.(row) ?? column.sortValue?.(row);
        return raw != null && String(raw).toLowerCase().includes(needle);
      }),
    );
  }, [columns, data, query]);

  // 2. Sort
  const sorted = useMemo(() => {
    const column = sort && columns.find((c) => c.id === sort.columnId);
    if (!sort || !column?.sortValue) return filtered;
    const getValue = column.sortValue;
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...filtered].sort(
      (a, b) => factor * compareValues(getValue(a), getValue(b)),
    );
  }, [columns, filtered, sort]);

  // 3. Paginate
  const pageCount =
    pageSize > 0 ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const currentPage = Math.min(page, pageCount);
  const rows =
    pageSize > 0
      ? sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)
      : sorted;

  // Selection applies to every row matching the current search.
  const filteredIds = filtered.map(getRowId);
  const selectedInView = filteredIds.filter((id) => selectedSet.has(id)).length;
  const allSelected =
    filteredIds.length > 0 && selectedInView === filteredIds.length;

  const toggleAll = () => {
    const visible = new Set(filteredIds);
    setSelection(
      allSelected
        ? selection.filter((id) => !visible.has(id))
        : Array.from(new Set([...selection, ...filteredIds])),
    );
  };

  const toggleRow = (id: string) =>
    setSelection(
      selectedSet.has(id)
        ? selection.filter((x) => x !== id)
        : [...selection, id],
    );

  const cycleSort = (columnId: string) => {
    setSort((current) => {
      if (current?.columnId !== columnId) return { columnId, direction: "asc" };
      if (current.direction === "asc") return { columnId, direction: "desc" };
      return null;
    });
  };

  return (
    <section
      className={cx(styles.dataTable, className)}
      aria-labelledby={title ? titleId : undefined}
    >
      {title || searchable || toolbar ? (
        <div className={styles.toolbar}>
          {title ? (
            <h3 id={titleId} className={styles.title}>
              {title}
            </h3>
          ) : null}
          <div className={styles.controls}>
            {searchable ? (
              <InputGroup
                size="sm"
                startAddon={<SearchIcon />}
                className={styles.search}
              >
                <TextInput
                  type="search"
                  aria-label="Search table"
                  placeholder={searchPlaceholder}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                />
              </InputGroup>
            ) : null}
            {toolbar}
          </div>
        </div>
      ) : null}

      <Table density="compact" wrapperClassName={styles.tableWrapper}>
        {caption ? (
          <TableCaption className="sr-only">{caption}</TableCaption>
        ) : null}
        <TableHeader>
          <TableRow>
            {selectable ? (
              <TableHead className={styles.selectCell}>
                <Checkbox
                  size="sm"
                  aria-label="Select all rows"
                  checked={allSelected}
                  indeterminate={selectedInView > 0 && !allSelected}
                  disabled={filteredIds.length === 0}
                  onChange={toggleAll}
                />
              </TableHead>
            ) : null}
            {columns.map((column) => {
              const direction =
                sort?.columnId === column.id ? sort.direction : undefined;
              return (
                <TableHead
                  key={column.id}
                  align={column.align}
                  style={column.width ? { width: column.width } : undefined}
                  aria-sort={
                    column.sortValue
                      ? direction === "asc"
                        ? "ascending"
                        : direction === "desc"
                          ? "descending"
                          : "none"
                      : undefined
                  }
                >
                  {column.sortValue ? (
                    <button
                      type="button"
                      className={styles.sortButton}
                      onClick={() => cycleSort(column.id)}
                    >
                      {column.header}
                      <span
                        className={styles.sortIcon}
                        data-active={direction ? "" : undefined}
                      >
                        {direction === "asc" ? (
                          <ArrowUpIcon />
                        ) : direction === "desc" ? (
                          <ArrowDownIcon />
                        ) : (
                          <ChevronsUpDownIcon />
                        )}
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (selectable ? 1 : 0)}
                className={styles.empty}
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const id = getRowId(row);
              const isSelected = selectedSet.has(id);
              return (
                <TableRow key={id} selected={isSelected}>
                  {selectable ? (
                    <TableCell className={styles.selectCell}>
                      <Checkbox
                        size="sm"
                        aria-label={`Select row ${id}`}
                        checked={isSelected}
                        onChange={() => toggleRow(id)}
                      />
                    </TableCell>
                  ) : null}
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <div className={styles.footer}>
        <p className={styles.summary} aria-live="polite">
          {selectable ? (
            <>
              {selectedInView} of {filtered.length} selected
              <span aria-hidden="true"> · </span>
            </>
          ) : null}
          {filtered.length} {filtered.length === 1 ? "result" : "results"}
        </p>
        {pageCount > 1 ? (
          <Pagination
            variant="compact"
            page={currentPage}
            pageCount={pageCount}
            onPageChange={setPage}
            aria-label="Table pagination"
          />
        ) : null}
      </div>
    </section>
  );
}
