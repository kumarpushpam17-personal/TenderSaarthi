import type { DocumentType } from "@/lib/types";

const LANG_STYLE: Record<string, string> = {
  en: "bg-blue-100 text-blue-800",
  hi: "bg-orange-100 text-orange-800",
  kn: "bg-purple-100 text-purple-800",
};

const TYPE_STYLE: Record<DocumentType, string> = {
  TYPED_PDF: "bg-green-100 text-green-700",
  SCANNED_PDF: "bg-red-100 text-red-700",
  IMAGE: "bg-red-100 text-red-700",
  DOCX: "bg-blue-100 text-blue-700",
};

const TYPE_LABEL: Record<DocumentType, string> = {
  TYPED_PDF: "typed",
  SCANNED_PDF: "scanned",
  IMAGE: "photo",
  DOCX: "docx",
};

interface DocumentBadgeProps {
  languages: string[];
  docType: DocumentType;
}

export function DocumentBadge({ languages, docType }: DocumentBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1">
      {languages.map((language) => (
        <span
          key={language}
          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${LANG_STYLE[language] ?? "bg-gray-100 text-gray-600"}`}
        >
          {language.toUpperCase()}
        </span>
      ))}
      <span className={`rounded px-1.5 py-0.5 text-[10px] ${TYPE_STYLE[docType]}`}>
        {TYPE_LABEL[docType]}
      </span>
    </span>
  );
}
