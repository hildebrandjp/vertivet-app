import type { ComponentPropsWithRef } from "react";
import type { Align } from "../common";
import { cx } from "../utils/cx";
import styles from "./Table.module.css";

/**
 * Basic data listing (04 Table). Composable primitives:
 * <Table><TableHeader><TableRow><TableHead/>…</TableRow></TableHeader>
 *        <TableBody><TableRow><TableCell/>…</TableRow></TableBody></Table>
 */
export interface TableProps extends ComponentPropsWithRef<"table"> {
  /** Class for the scroll wrapper around the table. */
  wrapperClassName?: string;
  density?: "compact" | "comfortable";
}

export function Table({
  className,
  wrapperClassName,
  density = "comfortable",
  ...rest
}: TableProps) {
  return (
    <div className={cx(styles.wrapper, wrapperClassName)}>
      <table
        {...rest}
        data-density={density}
        className={cx(styles.table, className)}
      />
    </div>
  );
}

export function TableCaption({
  className,
  ...rest
}: ComponentPropsWithRef<"caption">) {
  return <caption {...rest} className={cx(styles.caption, className)} />;
}

export function TableHeader({
  className,
  ...rest
}: ComponentPropsWithRef<"thead">) {
  return <thead {...rest} className={cx(styles.header, className)} />;
}

export function TableBody({
  className,
  ...rest
}: ComponentPropsWithRef<"tbody">) {
  return <tbody {...rest} className={cx(styles.body, className)} />;
}

export function TableFooter({
  className,
  ...rest
}: ComponentPropsWithRef<"tfoot">) {
  return <tfoot {...rest} className={cx(styles.footer, className)} />;
}

export interface TableRowProps extends ComponentPropsWithRef<"tr"> {
  selected?: boolean;
}

export function TableRow({ selected, className, ...rest }: TableRowProps) {
  return (
    <tr
      {...rest}
      data-selected={selected || undefined}
      className={cx(styles.row, className)}
    />
  );
}

export interface TableHeadProps
  extends Omit<ComponentPropsWithRef<"th">, "align"> {
  align?: Align;
}

export function TableHead({
  align = "start",
  scope = "col",
  className,
  ...rest
}: TableHeadProps) {
  return (
    <th
      {...rest}
      scope={scope}
      data-align={align}
      className={cx(styles.head, className)}
    />
  );
}

export interface TableCellProps
  extends Omit<ComponentPropsWithRef<"td">, "align"> {
  align?: Align;
}

export function TableCell({
  align = "start",
  className,
  ...rest
}: TableCellProps) {
  return (
    <td {...rest} data-align={align} className={cx(styles.cell, className)} />
  );
}
