import type {
  AuditReport,
  Bidder,
  BidderDocument,
  BidderSubmission,
  Criterion,
  PublicTenderDetail,
  PublicTenderSummary,
  TenderDetail,
  TenderStats,
  TenderSummary,
  VerdictMatrix,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type ApiEnvelope<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

async function request<T>(
  path: string,
  init?: RequestInit
): Promise<ApiEnvelope<T>> {
  const response = await fetch(`${BASE_URL}${path}`, {
    cache: "no-store",
    ...init,
  });

  if (!response.ok) {
    throw new Error(`${init?.method ?? "GET"} ${path} failed: ${response.status}`);
  }

  return (await response.json()) as ApiEnvelope<T>;
}

export async function fetchTenders(): Promise<{
  tenders: TenderSummary[];
  stats: TenderStats;
}> {
  const payload = await request<TenderSummary[]>("/api/v1/tenders");
  return {
    tenders: payload.data,
    stats: payload.meta?.stats as TenderStats,
  };
}

export async function fetchTender(id: string): Promise<TenderDetail> {
  return (await request<TenderDetail>(`/api/v1/tenders/${id}`)).data;
}

export async function fetchPublicTenders(): Promise<PublicTenderSummary[]> {
  return (await request<PublicTenderSummary[]>("/api/v1/public/tenders")).data;
}

export async function fetchPublicTender(id: string): Promise<PublicTenderDetail> {
  return (await request<PublicTenderDetail>(`/api/v1/public/tenders/${id}`)).data;
}

export async function createTender(form: FormData): Promise<TenderDetail> {
  return (
    await request<TenderDetail>("/api/v1/tenders", {
      method: "POST",
      body: form,
    })
  ).data;
}

export async function fetchCriteria(tenderId: string): Promise<Criterion[]> {
  return (await request<Criterion[]>(`/api/v1/tenders/${tenderId}/criteria`)).data;
}

export async function updateCriterion(
  tenderId: string,
  criterionId: string,
  body: Partial<Criterion>
): Promise<Criterion> {
  return (
    await request<Criterion>(`/api/v1/tenders/${tenderId}/criteria/${criterionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  ).data;
}

export async function approveCriteria(
  tenderId: string
): Promise<{ tender_id: string; status: string }> {
  return (
    await request<{ tender_id: string; status: string }>(
      `/api/v1/tenders/${tenderId}/criteria/approve`,
      { method: "POST" }
    )
  ).data;
}

export async function fetchBidders(tenderId: string): Promise<Bidder[]> {
  return (await request<Bidder[]>(`/api/v1/tenders/${tenderId}/bidders`)).data;
}

export async function fetchTenderSubmissions(
  tenderId: string
): Promise<BidderSubmission[]> {
  return (
    await request<BidderSubmission[]>(`/api/v1/tenders/${tenderId}/submissions`)
  ).data;
}

export async function createSubmission(
  tenderId: string,
  body: {
    legal_name: string;
    contact_email: string;
    gst_number?: string;
  }
): Promise<BidderSubmission> {
  return (
    await request<BidderSubmission>(`/api/v1/public/tenders/${tenderId}/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  ).data;
}

export async function uploadSubmissionDocument(
  submissionId: string,
  file: File
): Promise<BidderDocument & { submission_id: string }> {
  const form = new FormData();
  form.append("file", file);
  return (
    await request<BidderDocument & { submission_id: string }>(
      `/api/v1/submissions/${submissionId}/documents`,
      {
        method: "POST",
        body: form,
      }
    )
  ).data;
}

export async function fetchSubmission(submissionId: string): Promise<BidderSubmission> {
  return (await request<BidderSubmission>(`/api/v1/submissions/${submissionId}`)).data;
}

export async function createBidder(
  tenderId: string,
  legalName: string
): Promise<Bidder> {
  return (
    await request<Bidder>(`/api/v1/tenders/${tenderId}/bidders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ legal_name: legalName }),
    })
  ).data;
}

export async function triggerEvaluation(tenderId: string): Promise<{
  tender_id: string;
  job_id: string;
  status: string;
}> {
  return (
    await request<{ tender_id: string; job_id: string; status: string }>(
      `/api/v1/tenders/${tenderId}/evaluate`,
      { method: "POST" }
    )
  ).data;
}

export async function fetchVerdicts(tenderId: string): Promise<VerdictMatrix> {
  return (await request<VerdictMatrix>(`/api/v1/tenders/${tenderId}/verdicts`)).data;
}

export async function approveVerdict(verdictId: string) {
  return request(`/api/v1/verdicts/${verdictId}/approve`, { method: "POST" });
}

export async function overrideVerdict(verdictId: string, reason: string) {
  return request(`/api/v1/verdicts/${verdictId}/override`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
}

export async function fetchAuditReport(tenderId: string): Promise<AuditReport> {
  return (await request<AuditReport>(`/api/v1/tenders/${tenderId}/report`)).data;
}
