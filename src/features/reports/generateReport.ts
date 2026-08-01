import type { ReportData } from "@/reports/types";
import type { ScoringResult } from "@/scoring/types";

interface SubmissionForReport {
  completed_at: string;
  result_snapshot: ScoringResult;
  participants: {
    reference_code: string;
    first_name: string;
    last_name: string;
  };
}

/**
 * Genere le PDF dans le navigateur de l'administrateur et declenche son telechargement. Jamais
 * appelee cote candidat (mission §12 : "Ne genere pas le PDF depuis le navigateur du candidat").
 *
 * `@react-pdf/renderer` (~600 Ko gzippes) est charge dynamiquement ici plutot qu'importe en tete
 * de fichier : cela l'exclut du bundle candidat, qui n'en a jamais besoin (voir le budget de
 * taille de bundle dans docs/DEPLOYMENT.md).
 */
export async function generateAndDownloadReport(submission: SubmissionForReport): Promise<void> {
  const [{ pdf }, { ReportDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/reports/ReportDocument")
  ]);

  const data: ReportData = {
    participant: {
      firstName: submission.participants.first_name,
      lastName: submission.participants.last_name,
      referenceCode: submission.participants.reference_code
    },
    submittedAt: submission.completed_at,
    generatedAt: new Date().toISOString(),
    result: submission.result_snapshot
  };

  const blob = await pdf(ReportDocument({ data })).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `rapport-${submission.participants.reference_code}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
