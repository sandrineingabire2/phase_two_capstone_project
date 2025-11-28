"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef } from "react";
import type JoditEditor from "jodit-react";

const Editor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => (
    <div className="h-[360px] bg-gray-100 rounded-2xl flex items-center justify-center">
      Loading editor...
    </div>
  ),
});

export type RichEditorProps = {
  value: string;
  onChange: (content: string) => void;
  onBlur?: () => void;
};

export function RichEditor({ value, onChange, onBlur }: RichEditorProps) {
  const editorRef = useRef<JoditEditor | null>(null);

  const config = useMemo(
    () => ({
      readonly: false,
      toolbarAdaptive: false,
      height: 360,
      placeholder: "Start writing your story...",
      buttons:
        "bold,italic,underline,strikethrough,|,ul,ol,paragraph,fontsize,brush,link,table,|,align,hr,quote,code,source,fullsize",
      removeButtons: ["video"],
      style: {
        background: "#fffdf7",
      },
    }),
    []
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
      <Editor
        ref={editorRef}
        value={value}
        config={config}
        onBlur={(content) => {
          onChange(content);
          onBlur?.();
        }}
        onChange={(content) => onChange(content)}
      />
    </div>
  );
}
