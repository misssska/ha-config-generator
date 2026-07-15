"use client";

import {
  type FormEvent,
  useCallback,
  useState,
} from "react";

import {
  generateEsphomeProject,
  type GenerateProjectInput,
} from "@/lib/esphome-api";
import type { GeneratedFile } from "@/types/esphome";

type ValidateHardware = () => string | null;

export function useEsphomeGeneration() {
  const [generatedFiles, setGeneratedFiles] = useState<
    GeneratedFile[]
  >([]);

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const [generationSequence, setGenerationSequence] =
    useState(0);

  const clearGeneratedFiles = useCallback(() => {
    setGeneratedFiles([]);
  }, []);

  const createGenerateHandler = useCallback(
    (
      input: GenerateProjectInput,
      validateHardware: ValidateHardware,
    ) =>
      async function handleGenerate(
        event: FormEvent<HTMLFormElement>,
      ) {
        event.preventDefault();

        const validationError = validateHardware();

        if (validationError) {
          setError(validationError);
          return;
        }

        try {
          setGenerating(true);
          setError("");
          setGeneratedFiles([]);

          const data = await generateEsphomeProject(input);

          setGeneratedFiles(data.files);
          setGenerationSequence(
            (sequence) => sequence + 1,
          );
        } catch (generateError) {
          setError(
            generateError instanceof Error
              ? generateError.message
              : "Ismeretlen hiba történt.",
          );
        } finally {
          setGenerating(false);
        }
      },
    [],
  );

  const copyFile = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      setError("A vágólapra másolás nem sikerült.");
    }
  }, []);

  const downloadFile = useCallback((file: GeneratedFile) => {
    const blob = new Blob([file.content], {
      type: "text/yaml;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = file.filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }, []);

  return {
    generatedFiles,
    generationSequence,
    generating,
    error,
    setError,
    clearGeneratedFiles,
    createGenerateHandler,
    copyFile,
    downloadFile,
  };
}
