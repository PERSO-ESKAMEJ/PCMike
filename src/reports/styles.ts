import { StyleSheet } from "@react-pdf/renderer";

/**
 * Palette originale (pas de reprise de charte PCM officielle) -- voir mission §12.2.
 */
export const REPORT_COLORS: Record<string, string> = {
  AN: "#2f6fb3",
  PE: "#7d5bb3",
  EM: "#c45c77",
  IM: "#6b7b4c",
  EN: "#d08b2f",
  PR: "#b64b3c",
  ink: "#1f2624",
  muted: "#5b6663",
  line: "#d7ddd9",
  bg: "#f7f8f6"
};

export const reportStyles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontSize: 10.5,
    fontFamily: "Helvetica",
    color: REPORT_COLORS.ink
  },
  coverPage: {
    paddingTop: 120,
    paddingHorizontal: 56,
    fontFamily: "Helvetica"
  },
  eyebrow: {
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: REPORT_COLORS.muted,
    marginBottom: 6
  },
  h1: { fontSize: 22, fontFamily: "Helvetica-Bold", marginBottom: 10 },
  h2: { fontSize: 15, fontFamily: "Helvetica-Bold", marginBottom: 10, marginTop: 4 },
  h3: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 6, marginTop: 10 },
  paragraph: { fontSize: 10.5, lineHeight: 1.5, marginBottom: 8, color: REPORT_COLORS.ink },
  small: { fontSize: 9, color: REPORT_COLORS.muted, lineHeight: 1.4 },
  notice: {
    fontSize: 9.5,
    lineHeight: 1.4,
    color: REPORT_COLORS.muted,
    borderWidth: 1,
    borderColor: REPORT_COLORS.line,
    borderRadius: 4,
    padding: 10,
    marginBottom: 14
  },
  section: { marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  divider: { borderBottomWidth: 1, borderBottomColor: REPORT_COLORS.line, marginVertical: 10 },
  bulletRow: { flexDirection: "row", marginBottom: 4 },
  bulletMark: { width: 10, fontSize: 10.5 },
  bulletText: { flex: 1, fontSize: 10.5, lineHeight: 1.45 },
  barTrack: {
    height: 8,
    backgroundColor: "#e9ece9",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 3,
    marginBottom: 8
  },
  floorRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: REPORT_COLORS.line,
    borderRadius: 4,
    padding: 8,
    marginBottom: 6
  },
  floorLabel: { width: 90, fontSize: 9.5, fontFamily: "Helvetica-Bold" },
  floorMeta: { width: 90, fontSize: 8.5, color: REPORT_COLORS.muted },
  pageNumber: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 8,
    color: REPORT_COLORS.muted
  }
});
