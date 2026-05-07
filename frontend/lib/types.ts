export type TenderStatus =
  | "UPLOADED"
  | "EXTRACTING"
  | "AWAITING_REVIEW"
  | "CRITERIA_APPROVED"
  | "EVALUATING"
  | "EVALUATED"
  | "SIGNED";

export type CriterionCategory =
  | "FINANCIAL"
  | "TECHNICAL"
  | "COMPLIANCE"
  | "DOCUMENT"
  | "CERTIFICATION";

export type DocumentType = "TYPED_PDF" | "SCANNED_PDF" | "IMAGE" | "DOCX";

export type VerdictValue = "ELIGIBLE" | "NOT_ELIGIBLE" | "NEEDS_MANUAL_REVIEW";

export interface TenderSummary {
  id: string;
  title: string;
  procuring_department: string;
  status: TenderStatus;
  uploaded_at: string;
  criteria_count: number;
  bidder_count: number;
  verdict_count: number;
}

export interface TenderDetail extends TenderSummary {
  source_pdf_uri: string | null;
}

export interface Criterion {
  id: string;
  tender_id: string;
  category: CriterionCategory;
  description: string;
  is_mandatory: boolean;
  threshold: { type: string; value: number | boolean } | null;
  source_page: number | null;
  approved_at: string | null;
}

export interface BidderDocument {
  id: string;
  filename: string;
  document_type: DocumentType;
  detected_languages: string[];
}

export interface Bidder {
  id: string;
  tender_id: string;
  legal_name: string;
  uploaded_at: string;
  documents: BidderDocument[];
}

export interface EvidenceRef {
  value: string;
  page: number;
  bbox: [number, number, number, number];
  raw_span: string;
  translated_span: string | null;
}

export interface VerdictResult {
  criterion_id: string;
  verdict: VerdictValue;
  reason: string;
  ocr_confidence: number | null;
  extraction_confidence: number | null;
  span_validated: boolean;
  evidence_ref: EvidenceRef | null;
  model_version: string;
  replay_id: string;
  reviewer_action?: "APPROVED" | "OVERRIDDEN" | null;
  reviewer_reason?: string | null;
}

export interface BidderVerdicts {
  bidder_id: string;
  bidder_name: string;
  results: VerdictResult[];
}

export interface VerdictMatrix {
  tender_id: string;
  criteria: string[];
  verdicts: BidderVerdicts[];
}

export interface TenderStats {
  active: number;
  awaiting_review: number;
  evaluated: number;
  signed: number;
  verdicts_total: number;
}

export interface AuditReport {
  id: string;
  tender_id: string;
  tender_title: string;
  procuring_department: string;
  generated_at: string;
  generated_by: string;
  bidder_count: number;
  criteria_count: number;
  verdict_count: number;
  eligible_count: number;
  not_eligible_count: number;
  needs_review_count: number;
  content_hash: string;
  replay_id: string;
  model_versions: string[];
  pdf_uri: string;
}
