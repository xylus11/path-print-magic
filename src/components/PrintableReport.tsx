import { useEffect } from "react";
import type { PathologyTest } from "../lib/pathology-tests";

type Patient = {
  name: string;
  age: string;
  gender: string;
  refBy: string;
};

type Props = {
  patient: Patient;
  tests: PathologyTest[];
  values: Record<string, Record<string, string>>;
  totalCost: number;
  onBack: () => void;
};

const fmtDate = (d: Date) => {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${dd}/${mm}/${yyyy} ${String(h).padStart(2, "0")}:${m}${ampm}`;
};

export function PrintableReport({
  patient,
  tests,
  values,
  totalCost,
  onBack,
}: Props) {
  useEffect(() => {
    const prev = document.title;
    document.title = `Pathology Report - ${patient.name}`;
    return () => {
      document.title = prev;
    };
  }, [patient.name]);

  const now = new Date();
  const dateStr = fmtDate(now);
  const accessionId = `NSL${now.getFullYear().toString().slice(-2)}${String(
    now.getMonth() + 1
  ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${String(
    now.getSeconds()
  ).padStart(2, "0")}${String(now.getMilliseconds()).padStart(3, "0")}`;

  return (
    <div className="min-h-screen bg-slate-200">
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          html, body { background: white !important; }
          .no-print { display: none !important; }
          .report-page {
            box-shadow: none !important;
            margin: 0 !important;
            page-break-after: always;
            width: 210mm !important;
            min-height: 297mm !important;
          }
          .report-page:last-child { page-break-after: auto; }
        }
        .report-page {
          width: 210mm;
          min-height: 297mm;
          padding: 14mm 12mm;
          background: white;
          color: #000;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 11px;
          line-height: 1.35;
        }
      `}</style>

      <div className="no-print sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            ← Back to Edit Values
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              {tests.length} test(s) • ₹{totalCost}
            </span>
            <button
              onClick={() => window.print()}
              className="bg-blue-600 text-white px-5 py-2 rounded-md font-medium hover:bg-blue-700"
            >
              Print Report
            </button>
          </div>
        </div>
      </div>

      <div className="py-6 flex flex-col items-center gap-6 print:p-0 print:gap-0">
        {tests.map((test, idx) => (
          <ReportPage
            key={test.id}
            test={test}
            patient={patient}
            values={values[test.id] ?? {}}
            dateStr={dateStr}
            accessionId={accessionId}
            pageNum={idx + 1}
            totalPages={tests.length}
          />
        ))}
      </div>
    </div>
  );
}

function ReportPage({
  test,
  patient,
  values,
  dateStr,
  accessionId,
  pageNum,
  totalPages,
}: {
  test: PathologyTest;
  patient: Patient;
  values: Record<string, string>;
  dateStr: string;
  accessionId: string;
  pageNum: number;
  totalPages: number;
}) {
  const titlePrefix =
    patient.gender === "Female"
      ? "Miss."
      : patient.gender === "Male"
        ? "Mr."
        : "";

  const department =
    test.department ||
    `DEPARTMENT OF ${(test.category || "PATHOLOGY").toUpperCase()}`;

  return (
    <div className="report-page shadow-lg print:shadow-none flex flex-col">
      {/* Top spacer where letterhead would be printed */}
      <div style={{ height: "30mm" }} />

      {/* Patient info box */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #000",
          fontSize: "10.5px",
        }}
      >
        <tbody>
          <InfoRow
            l1="Name"
            v1={`${titlePrefix}${patient.name.toUpperCase()}`}
            l2="Centre Details"
            v2=":INTERLAB - NSL"
          />
          <InfoRow
            l1="Age"
            v1={`${patient.age} Yrs    Sex: ${patient.gender}`}
            l2="Accession.ID"
            v2={`:${accessionId}`}
          />
          <InfoRow
            l1="Collection Date"
            v1={dateStr}
            l2="Referred By"
            v2={`:${patient.refBy || "SELF"}`}
          />
          <InfoRow
            l1="Received Date"
            v1={dateStr}
            l2="Report Date"
            v2={`:${dateStr}`}
          />
          <InfoRow
            l1="Registration Date"
            v1={dateStr}
            l2="Ref.No/TRF.No"
            v2=": /"
          />
        </tbody>
      </table>

      {/* Department header */}
      <div
        style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "12px",
          padding: "4px 0",
          borderBottom: "1.5px solid #000",
          marginTop: "0",
        }}
      >
        {department}
      </div>

      {/* Column headers */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #000" }}>
            <th style={thStyle}>Test Name</th>
            <th style={{ ...thStyle, textAlign: "center", width: "20%" }}>
              Result
            </th>
            <th style={{ ...thStyle, textAlign: "center", width: "15%" }}>
              Unit
            </th>
            <th style={{ ...thStyle, width: "30%" }}>Bio. Ref. Range</th>
          </tr>
        </thead>
      </table>

      {/* Test name + sample type subtitle */}
      <div style={{ marginTop: "8px" }}>
        <div style={{ fontWeight: "bold", fontSize: "12px" }}>{test.name}</div>
        <div style={{ fontStyle: "italic", fontSize: "10px", color: "#000" }}>
          {test.sampleType}
        </div>
      </div>

      {/* Sub-tests */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "4px",
        }}
      >
        <tbody>
          {(test.subTests ?? []).map((sub) => {
            const result = values[sub.name] || "";
            const flag = computeFlag(result, sub.reference);
            return (
              <tr key={sub.name} style={{ verticalAlign: "top" }}>
                <td style={{ padding: "4px 4px 4px 0", width: "35%" }}>
                  <div>{sub.name}</div>
                  {sub.method && (
                    <div
                      style={{
                        fontStyle: "italic",
                        fontSize: "9px",
                        color: "#000",
                      }}
                    >
                      {sub.method}
                    </div>
                  )}
                </td>
                <td
                  style={{
                    padding: "4px",
                    width: "20%",
                    textAlign: "center",
                    fontWeight: flag ? "bold" : "normal",
                  }}
                >
                  {result || "—"}
                  {flag === "high" && " H"}
                  {flag === "low" && " L"}
                </td>
                <td
                  style={{
                    padding: "4px",
                    width: "15%",
                    textAlign: "center",
                  }}
                >
                  {sub.unit || "—"}
                </td>
                <td style={{ padding: "4px", width: "30%" }}>
                  {(sub.reference || "—")
                    .split(/\s*\/\s*/)
                    .map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Comments */}
      {test.comments && (
        <div style={{ marginTop: "10px", fontSize: "10px" }}>
          <div style={{ fontWeight: "bold" }}>Comment:</div>
          <div style={{ whiteSpace: "pre-line" }}>{test.comments}</div>
        </div>
      )}

      {/* End of report */}
      <div
        style={{
          textAlign: "center",
          fontWeight: "bold",
          margin: "14px 0 4px",
        }}
      >
        *** End Of Report ***
      </div>

      {/* Disclaimer */}
      <div
        style={{
          border: "1px solid #000",
          padding: "6px 8px",
          fontSize: "9px",
          lineHeight: "1.4",
        }}
      >
        <div style={{ fontWeight: "bold" }}>Disclaimer:</div>
        All Results released pertain to the specimen submitted to the lab
        <ol style={{ margin: "2px 0 0 16px", padding: 0 }}>
          <li>
            Test results are dependent on the quality of the sample received by
            the lab
          </li>
          <li>
            Tests are performed as per schedule given in the test listing and in
            any unforeseen circumstances, report delivery may be delayed
          </li>
          <li>Test results may show interlaboratory variations</li>
          <li>
            All dispute and claims are subjected to local jurisdiction only.
            Clinical correlation advised.
          </li>
          <li>Test results are not valid for medico legal purposes</li>
          <li>
            For all queries, feedbacks, suggestions, and complaints, please
            contact customer care support +0124 665 0000
          </li>
        </ol>
      </div>

      {/* Signature */}
      <div style={{ marginTop: "auto", paddingTop: "20px" }}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ textAlign: "right", fontSize: "10px" }}>
            <div
              style={{
                fontFamily: "'Brush Script MT', cursive",
                fontSize: "20px",
                marginBottom: "2px",
              }}
            >
              Ahilya
            </div>
            <div style={{ fontWeight: "bold" }}>
              Dr. Ahilya Balasaheb Dhadas
            </div>
            <div>MD. Pathology</div>
            <div>Consultant Pathologist</div>
            <div>MMC RG-No. 2013030578</div>
          </div>
        </div>

        <div
          style={{
            marginTop: "10px",
            fontSize: "9px",
            borderTop: "1px solid #000",
            paddingTop: "4px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div>
              Verify this report by scanning the QR code on top. In case of any
              discrepancy please report to 01246650000
            </div>
            <div>
              This sample is processed at{" "}
              <b>
                Nasik Speciality Laboratories; Flat No.1 & 2, C-Wing, Nishigandha
                Apartment, Untwadi Road, Nasik
              </b>
            </div>
          </div>
          <div style={{ whiteSpace: "nowrap", paddingLeft: "8px" }}>
            Page {pageNum} of {totalPages}
          </div>
        </div>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "4px 4px",
  fontSize: "11px",
  fontWeight: "bold",
};

function InfoRow({
  l1,
  v1,
  l2,
  v2,
}: {
  l1: string;
  v1: string;
  l2: string;
  v2: string;
}) {
  const cell: React.CSSProperties = { padding: "3px 6px", verticalAlign: "top" };
  return (
    <tr>
      <td style={{ ...cell, width: "18%" }}>{l1}</td>
      <td style={{ ...cell, width: "32%" }}>: {v1}</td>
      <td style={{ ...cell, width: "18%" }}>{l2}</td>
      <td style={{ ...cell, width: "32%" }}>{v2}</td>
    </tr>
  );
}

function computeFlag(
  result: string | undefined,
  reference: string | undefined
): "high" | "low" | "normal" | null {
  if (!result || !reference) return null;
  const num = parseFloat(result);
  if (Number.isNaN(num)) return null;
  const range = reference.match(/([\d.]+)\s*-\s*([\d.]+)/);
  if (range) {
    const lo = parseFloat(range[1]);
    const hi = parseFloat(range[2]);
    if (num < lo) return "low";
    if (num > hi) return "high";
    return "normal";
  }
  const lt = reference.match(/<\s*([\d.]+)/);
  if (lt) return num >= parseFloat(lt[1]) ? "high" : "normal";
  const gt = reference.match(/>\s*([\d.]+)/);
  if (gt) return num <= parseFloat(gt[1]) ? "low" : "normal";
  return null;
}
