"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { getErrorMessage } from "@/5shared/lib/errors";
import { createGroup } from "../api/createGroup";
import { createGroupSchema, type CreateGroupInput } from "./schemas";

export function useCreateGroup() {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CreateGroupInput>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: { name: "", maxMembers: 1 },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset();
      setServerError(null);
    }
  }

  async function handleSubmit(values: CreateGroupInput) {
    setServerError(null);

    const res = await createGroup(values);

    if (!res.ok) {
      setServerError(getErrorMessage(res.errorCode));
      return;
    }

    handleOpenChange(false);
  }

  // В схемах message = ErrorCode — переводим код в текст
  const fieldMessages = Object.values(form.formState.errors)
    .map((error) => error?.message)
    .filter((message): message is string => Boolean(message))
    .map((code) => getErrorMessage(code));

  const formErrors = Array.from(
    new Set(serverError ? [...fieldMessages, serverError] : fieldMessages)
  );

  return {
    open,
    handleOpenChange,
    register: form.register,
    handleSubmit: form.handleSubmit(handleSubmit),
    formErrors,
    submitCount: form.formState.submitCount,
    isSubmitting: form.formState.isSubmitting,
  };
}
