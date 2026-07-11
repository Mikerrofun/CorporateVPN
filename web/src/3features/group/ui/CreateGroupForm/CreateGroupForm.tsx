"use client";

import { CustomDialog, Input, SubmitButton, FormErrorBlock } from "@/5shared/ui";
import { useCreateGroup } from "../../model/useCreateGroup";

export function CreateGroupForm() {
  const { open, handleOpenChange, register, handleSubmit, formErrors, submitCount, isSubmitting } =
    useCreateGroup();

  return (
    <CustomDialog
      trigger={
        <button type="button" className="btn-primary">
          Создать группу
        </button>
      }
      open={open}
      onOpenChange={handleOpenChange}
      title="Новая группа"
      description="Название и лимит участников"
      content={
        <div className="relative">
          <FormErrorBlock messages={formErrors} resetKey={submitCount} />

          <form id="create-group-form" onSubmit={handleSubmit} className="space-y-4">
            <Input
              autoComplete="off"
              label="Название"
              type="text"
              placeholder="Например: Отдел продаж"
              {...register("name")}
            />

            <Input
              label="Макс. участников"
              type="number"
              min={1}
              max={10}
              placeholder="1–10"
              {...register("maxMembers", { valueAsNumber: true })}
            />

            <SubmitButton loading={isSubmitting} className="w-full py-3">
              Создать
            </SubmitButton>
          </form>
        </div>
      }
    />
  );
}
