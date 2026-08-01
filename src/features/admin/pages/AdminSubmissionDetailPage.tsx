import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import type { ScoringResult } from "@/scoring/types";
import { AdminHeader } from "../components/AdminHeader";
import { generateAndDownloadReport } from "@/features/reports/generateReport";

interface ParticipantDetail {
  id: string;
  reference_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  job_title: string | null;
  comment: string | null;
  anonymized_at: string | null;
}

interface SubmissionDetail {
  id: string;
  status: string;
  created_at: string;
  completed_at: string;
  duration_seconds: number;
  scoring_version: string;
  result_snapshot: ScoringResult;
  participants: ParticipantDetail;
}

interface ReportRow {
  id: string;
  generated_at: string;
  status: string;
  storage_path: string | null;
  downloaded_at: string | null;
  sent_at: string | null;
  notes: string | null;
}

export function AdminSubmissionDetailPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!submissionId) return;
    const { data, error: queryError } = await supabase
      .from("submissions")
      .select(
        "id, status, created_at, completed_at, duration_seconds, scoring_version, result_snapshot, participants(id, reference_code, first_name, last_name, email, phone, organization, job_title, comment, anonymized_at)"
      )
      .eq("id", submissionId)
      .maybeSingle<SubmissionDetail>();

    if (queryError || !data) {
      setError("Soumission introuvable.");
      return;
    }
    setSubmission(data);

    const { data: reportRows } = await supabase
      .from("reports")
      .select("id, generated_at, status, storage_path, downloaded_at, sent_at, notes")
      .eq("submission_id", submissionId)
      .order("generated_at", { ascending: false });
    setReports(reportRows ?? []);
  }, [submissionId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleRecalculate() {
    if (!submissionId) return;
    setBusy("recalculate");
    const recalcResponse = await supabase.functions.invoke<{ ok: boolean }>(
      "recalculate-submission",
      { body: { submissionId } }
    );
    const fnError: unknown = recalcResponse.error;
    setBusy(null);
    if (fnError) {
      setError("Le recalcul a échoué.");
      return;
    }
    await load();
  }

  async function handleGenerateReport() {
    if (!submission) return;
    setBusy("report");
    try {
      await generateAndDownloadReport(submission);
      await supabase.from("reports").insert({
        submission_id: submission.id,
        report_template_version: "report-2026.08.0",
        scoring_version: submission.scoring_version,
        status: "generated"
      });
      await load();
    } finally {
      setBusy(null);
    }
  }

  async function handleMarkSent(reportId: string) {
    setBusy(reportId);
    await supabase
      .from("reports")
      .update({ sent_at: new Date().toISOString(), status: "sent" })
      .eq("id", reportId);
    setBusy(null);
    await load();
  }

  async function handleAnonymize() {
    if (!submission) return;
    if (!window.confirm("Anonymiser définitivement ce candidat ? Cette action est irréversible."))
      return;
    setBusy("anonymize");
    await supabase
      .from("participants")
      .update({
        first_name: "Anonymisé",
        last_name: "Anonymisé",
        email: `anonymise-${submission.participants.id}@invalid`,
        phone: null,
        organization: null,
        job_title: null,
        comment: null,
        anonymized_at: new Date().toISOString()
      })
      .eq("id", submission.participants.id);
    setBusy(null);
    await load();
  }

  if (error) {
    return (
      <div className="app admin-dashboard">
        <AdminHeader title="Détail de la soumission" />
        <main>
          <p className="notice notice--error">{error}</p>
          <button
            type="button"
            className="ghost-button"
            onClick={() => void navigate("/admin/dashboard")}
          >
            Retour
          </button>
        </main>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="app admin-dashboard">
        <AdminHeader title="Détail de la soumission" />
        <main>Chargement...</main>
      </div>
    );
  }

  const result = submission.result_snapshot;
  const participant = submission.participants;

  return (
    <div className="app admin-dashboard">
      <AdminHeader title={`Soumission ${participant.reference_code}`} />
      <main className="admin-detail">
        <section>
          <h2>Candidat</h2>
          {participant.anonymized_at ? (
            <p className="notice">
              Ce candidat a été anonymisé le{" "}
              {new Date(participant.anonymized_at).toLocaleDateString("fr-FR")}.
            </p>
          ) : (
            <dl>
              <div>
                <dt>Nom</dt>
                <dd>
                  {participant.first_name} {participant.last_name}
                </dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd>{participant.email}</dd>
              </div>
              {participant.organization && (
                <div>
                  <dt>Organisation</dt>
                  <dd>{participant.organization}</dd>
                </div>
              )}
              {participant.job_title && (
                <div>
                  <dt>Fonction</dt>
                  <dd>{participant.job_title}</dd>
                </div>
              )}
              {participant.comment && (
                <div>
                  <dt>Commentaire</dt>
                  <dd>{participant.comment}</dd>
                </div>
              )}
            </dl>
          )}
        </section>

        <section>
          <h2>Résultat autoritatif (version {submission.scoring_version})</h2>
          <dl>
            <div>
              <dt>Base probable</dt>
              <dd>
                {result.base.typeCode} (marge {result.base.marginNormalized.toFixed(1)} pts,
                confiance {result.base.confidence.level})
              </dd>
            </div>
            <div>
              <dt>Base alternative</dt>
              <dd>{result.base.alternative ?? "—"}</dd>
            </div>
            <div>
              <dt>Phase actuelle</dt>
              <dd>
                {result.currentPhase.typeCode} ({result.currentPhase.status}, confiance{" "}
                {result.currentPhase.confidence.level})
              </dd>
            </div>
            <div>
              <dt>Changement de Phase établi</dt>
              <dd>{result.phaseChangeEstablished ? "Oui" : "Non"}</dd>
            </div>
            <div>
              <dt>Phases vécues confirmées</dt>
              <dd>
                {result.phasesVecues.length
                  ? result.phasesVecues.map((f) => f.typeCode).join(", ")
                  : "Aucune"}
              </dd>
            </div>
          </dl>

          {result.contradictions.length > 0 && (
            <>
              <h3>Contradictions détectées</h3>
              <ul>
                {result.contradictions.map((contradiction) => (
                  <li key={contradiction.code}>{contradiction.message}</li>
                ))}
              </ul>
            </>
          )}

          <h3>Immeuble (Structure)</h3>
          <ol className="admin-building">
            {result.structureBuilding.map((floor) => (
              <li key={floor.typeCode}>
                Étage {floor.floorIndex} — {floor.typeCode} — {floor.status} —{" "}
                {floor.displayPercent}%
              </li>
            ))}
          </ol>

          <div className="button-row">
            <button
              type="button"
              className="ghost-button"
              disabled={busy === "recalculate"}
              onClick={() => void handleRecalculate()}
            >
              {busy === "recalculate" ? "Recalcul..." : "Recalculer"}
            </button>
          </div>
        </section>

        <section>
          <h2>Rapports</h2>
          <div className="button-row">
            <button
              type="button"
              className="primary-button"
              disabled={busy === "report"}
              onClick={() => void handleGenerateReport()}
            >
              {busy === "report" ? "Génération..." : "Générer le rapport PDF"}
            </button>
          </div>
          <ul>
            {reports.map((report) => (
              <li key={report.id}>
                {new Date(report.generated_at).toLocaleString("fr-FR")} — {report.status}
                {!report.sent_at && (
                  <button
                    type="button"
                    className="ghost-button"
                    disabled={busy === report.id}
                    onClick={() => void handleMarkSent(report.id)}
                  >
                    Marquer comme envoyé
                  </button>
                )}
              </li>
            ))}
            {reports.length === 0 && <li>Aucun rapport généré pour l'instant.</li>}
          </ul>
        </section>

        <section>
          <h2>Zone sensible</h2>
          <button
            type="button"
            className="danger-button"
            disabled={!!participant.anonymized_at || busy === "anonymize"}
            onClick={() => void handleAnonymize()}
          >
            {busy === "anonymize" ? "Anonymisation..." : "Anonymiser ce candidat"}
          </button>
        </section>
      </main>
    </div>
  );
}
