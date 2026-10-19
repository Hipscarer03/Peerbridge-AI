"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import type {ReactNode} from "react";
import styles from "./Select.module.css";

export interface SelectOption { value: string; label: string; icon?: ReactNode; description?: string }

export default function Select({value, onValueChange, options, disabled, ariaLabel, placeholder = "Chọn một mục", className}: {
  value: string; onValueChange: (value: string) => void; options: SelectOption[];
  disabled?: boolean; ariaLabel: string; placeholder?: string; className?: string;
}) {
  const selected = options.find(option => option.value === value);
  return <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
    <SelectPrimitive.Trigger className={`${styles.trigger} ${className ?? ""}`} aria-label={ariaLabel}>
      <SelectPrimitive.Value placeholder={placeholder}>{selected && <span className={styles.value}>{selected.icon}<span className={styles.selectedText}>{selected.label}{selected.description && <small>{selected.description}</small>}</span></span>}</SelectPrimitive.Value>
      <SelectPrimitive.Icon className={styles.chevron}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
    <SelectPrimitive.Portal><SelectPrimitive.Content className={styles.content} position="popper" sideOffset={6} collisionPadding={12}>
      <SelectPrimitive.ScrollUpButton className={styles.scrollButton}>⌃</SelectPrimitive.ScrollUpButton>
      <SelectPrimitive.Viewport className={styles.viewport}>{options.map(option => <SelectPrimitive.Item className={styles.item} key={option.value} value={option.value} textValue={option.label}>
        {option.icon}<SelectPrimitive.ItemText><span className={styles.optionText}>{option.label}{option.description && <small>{option.description}</small>}</span></SelectPrimitive.ItemText><SelectPrimitive.ItemIndicator className={styles.indicator}>✓</SelectPrimitive.ItemIndicator>
      </SelectPrimitive.Item>)}</SelectPrimitive.Viewport>
      <SelectPrimitive.ScrollDownButton className={styles.scrollButton}>⌄</SelectPrimitive.ScrollDownButton>
    </SelectPrimitive.Content></SelectPrimitive.Portal>
  </SelectPrimitive.Root>;
}
