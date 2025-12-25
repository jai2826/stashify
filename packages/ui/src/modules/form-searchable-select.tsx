"use client";

import * as React from "react";
import { useFormContext, FieldPath, FieldValues } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import {
  SearchableSelect,
  SearchableSelectProps,
} from "@workspace/ui/components/searchable-select";

interface FormSearchableSelectProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> extends Omit<SearchableSelectProps, "value" | "onValueChange"> {
  name: TName;
  label?: string;
}

export function FormSearchableSelect<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  name,
  label,
  ...props
}: FormSearchableSelectProps<TFieldValues, TName>) {
  const form = useFormContext<TFieldValues>();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <SearchableSelect
            {...props}
            value={field.value}
            onValueChange={field.onChange}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
