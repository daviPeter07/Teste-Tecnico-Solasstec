"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FormDialogLayout } from "@/modules/dashboard/shared/components/form-dialog-layout";
import { getDateOnlyInTimeZone } from "@/utils/date-format";
import { normalize } from "@/utils/normalize";
import { useCreateVisitor, useUpdateVisitor } from "../services/visitors-service";
import {
  visitorFormSchema,
  type VisitorDocumentType,
  type Visitor,
  type VisitorFormData,
} from "../schemas/visitor-schema";

function formatDocumentInput(documentType: string, document: string) {
  return documentType === "RG"
    ? normalize.rg(document)
    : normalize.cpf(document);
}

const documentTypeOptions: VisitorDocumentType[] = ["CPF", "RG"];

export interface VisitorFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitorToEdit?: Visitor | null;
}

export function VisitorFormModal({
  open,
  onOpenChange,
  visitorToEdit,
}: VisitorFormModalProps) {
  const isEditing = Boolean(visitorToEdit);
  const createVisitor = useCreateVisitor();
  const updateVisitor = useUpdateVisitor();

  const form = useForm<VisitorFormData>({
    resolver: zodResolver(visitorFormSchema),
    defaultValues: {
      name: "",
      documentType: "CPF",
      document: "",
      birthDate: "",
      hasDisability: false,
      photo: "",
    },
  });
  const documentType = useWatch({
    control: form.control,
    name: "documentType",
  });

  useEffect(() => {
    if (open) {
      if (visitorToEdit) {
        const visitorDocumentType =
          visitorToEdit.documentType === "RG" ? "RG" : "CPF";
        form.reset({
          name: visitorToEdit.name,
          documentType: visitorDocumentType,
          document: formatDocumentInput(
            visitorDocumentType,
            visitorToEdit.document,
          ),
          birthDate: visitorToEdit.birthDate,
          hasDisability: visitorToEdit.hasDisability,
          photo: visitorToEdit.photo ?? "",
        });
      } else {
        form.reset({
          name: "",
          documentType: "CPF",
          document: "",
          birthDate: "",
          hasDisability: false,
          photo: "",
        });
      }
    }
  }, [open, visitorToEdit, form]);

  async function onSubmit(data: VisitorFormData) {
    try {
      if (isEditing && visitorToEdit) {
        await updateVisitor.mutateAsync({ id: visitorToEdit.id, input: data });
        onOpenChange(false);
      } else {
        await createVisitor.mutateAsync(data);
        onOpenChange(false);
      }
    } catch {
      // Mutation state handles error rendering
    }
  }

  return (
    <FormDialogLayout
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar visitante" : "Novo visitante"}
      description={
        isEditing
          ? "Atualize as informações do visitante selecionado."
          : "Informe os dados pessoais. A classificação de prioridade será calculada automaticamente."
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {(createVisitor.isError || updateVisitor.isError) && (
            <Alert variant="destructive" className="rounded-none">
              <AlertTitle>Operação não concluída</AlertTitle>
              <AlertDescription>
                {createVisitor.error?.message ?? updateVisitor.error?.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel required>Nome completo</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: Carlos Eduardo Silva"
                      className="h-11 rounded-none"
                      autoComplete="name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Tipo</FormLabel>
                  <FormControl>
                    <div className="grid h-11 grid-cols-2 border border-input bg-background">
                      {documentTypeOptions.map((option) => {
                        const isSelected = field.value === option;

                        return (
                          <button
                            key={option}
                            type="button"
                            aria-pressed={isSelected}
                            className={cn(
                              "border-r border-border text-sm font-semibold tracking-wide transition-colors last:border-r-0",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                            onClick={() => {
                              field.onChange(option);
                              form.setValue(
                                "document",
                                formatDocumentInput(
                                  option,
                                  form.getValues("document"),
                                ),
                                { shouldValidate: true },
                              );
                            }}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{documentType}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(
                          formatDocumentInput(documentType, e.target.value),
                        );
                      }}
                      placeholder={
                        documentType === "RG"
                          ? "Ex: 12.345.678-X"
                          : "Ex: 123.456.789-00"
                      }
                      maxLength={documentType === "RG" ? 17 : 14}
                      className="h-11 rounded-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Data de nascimento</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      max={getDateOnlyInTimeZone()}
                      className="h-11 rounded-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hasDisability"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel className="text-sm font-semibold text-foreground">
                    Necessidades de acessibilidade
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-3 border border-border bg-card p-4">
                      <input
                        id="hasDisability"
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="size-4 rounded-none accent-primary"
                      />
                      <label
                        htmlFor="hasDisability"
                        className="cursor-pointer text-sm text-foreground select-none"
                      >
                        Pessoa com Deficiência (PCD)
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-none"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="h-11 rounded-none"
              disabled={createVisitor.isPending || updateVisitor.isPending}
            >
              {createVisitor.isPending || updateVisitor.isPending
                ? "Salvando..."
                : isEditing
                ? "Salvar alterações"
                : "Cadastrar visitante"}
            </Button>
          </div>
        </form>
      </Form>
    </FormDialogLayout>
  );
}

export { VisitorFormModal as VisitorForm };
