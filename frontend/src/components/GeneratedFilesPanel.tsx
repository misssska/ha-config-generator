"use client";

import type { GeneratedFile } from "@/types/esphome";

type GeneratedFilesPanelProps = {
  generatedFiles: GeneratedFile[];
  onCopy: (content: string) => void | Promise<void>;
  onDownload: (file: GeneratedFile) => void;
};

export default function GeneratedFilesPanel({
  generatedFiles,
  onCopy,
  onDownload,
}: GeneratedFilesPanelProps) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Generált fájlok</h2>

        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
          {generatedFiles.length} fájl
        </span>
      </div>

      {generatedFiles.length === 0 && (
        <div className="flex min-h-80 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/50 p-8 text-center text-slate-500">
          A generált ESPHome-fájlok itt jelennek meg.
        </div>
      )}

      <div className="space-y-6">
        {generatedFiles.map((file) => (
          <article
            key={file.filename}
            className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
              <h3 className="font-mono text-sm font-semibold text-emerald-300">
                {file.filename}
              </h3>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void onCopy(file.content)}
                  className="rounded-md border border-slate-700 px-3 py-1.5 text-xs transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  Másolás
                </button>

                <button
                  type="button"
                  onClick={() => onDownload(file)}
                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  Letöltés
                </button>
              </div>
            </div>

            <pre className="max-h-[720px] overflow-auto p-4 text-sm leading-6 text-slate-300">
              <code>{file.content}</code>
            </pre>
          </article>
        ))}
      </div>
    </section>
  );
}
