import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import type { ScoringResult } from "@/scoring/types";
import { AdminHeader } from "../components/AdminHeader";

interface SubmissionRow {
  id: string;
  status: string;
  created_at: string;
  scoring_version: string;
  result_snapshot: ScoringResult;
  participants: {
    reference_code: string;
    first_name: string;
    last_name: string;
    email: string;
    organization: string | null;
  } | null;
}

export function AdminDashboardPage() {
  const [rows, setRows] = useState<SubmissionRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error: queryError } = await supabase
        .from("submissions")
        .select(
          "id, status, created_at, scoring_version, result_snapshot, participants(reference_code, first_name, last_name, email, organization)"
        )
        .order("created_at", { ascending: false })
        .returns<SubmissionRow[]>();

      if (cancelled) return;
      if (queryError) {
        setError("Impossible de charger les soumissions.");
        return;
      }
      setRows(data ?? []);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRows = useMemo(() => {
    if (!rows) return [];
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) => {
      const participant = row.participants;
      if (!participant) return false;
      const haystack = [
        participant.reference_code,
        participant.first_name,
        participant.last_name,
        participant.email,
        participant.organization ?? ""
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [rows, search]);

  return (
    <div className="app admin-dashboard">
      <AdminHeader title="Soumissions" />
      <main>
        <div className="field-full">
          <label>
            Rechercher (nom, e-mail, référence, organisation)
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>

        {error && <p className="notice notice--error">{error}</p>}
        {!rows && !error && <p>Chargement...</p>}

        {rows && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Candidat</th>
                <th>Date</th>
                <th>Base probable</th>
                <th>Phase actuelle</th>
                <th>Confiance</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link to={`/admin/submissions/${row.id}`}>
                      {row.participants?.reference_code ?? "—"}
                    </Link>
                  </td>
                  <td>
                    {row.participants
                      ? `${row.participants.first_name} ${row.participants.last_name}`
                      : "—"}
                  </td>
                  <td>{new Date(row.created_at).toLocaleDateString("fr-FR")}</td>
                  <td>{row.result_snapshot?.base?.typeCode ?? "—"}</td>
                  <td>{row.result_snapshot?.currentPhase?.typeCode ?? "—"}</td>
                  <td>{row.result_snapshot?.base?.confidence?.level ?? "—"}</td>
                  <td>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {rows && filteredRows.length === 0 && (
          <p>Aucune soumission ne correspond à la recherche.</p>
        )}
      </main>
    </div>
  );
}
