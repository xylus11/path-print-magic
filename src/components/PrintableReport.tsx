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

export function PrintableReport({
  patient,
  tests,
  values,
  totalCost,
  onBack,
}: Props) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = `Pathology Report - ${patient.name}`;
    return () => {
      document.title = prevTitle;
    };
  }, [patient.name]);

  const reportDate = new Date().toLocaleString();
  const reportId = `LPL-${Date.now().toString().slice(-8)}`;

  return (
    <div className="min-h-screen bg-slate-100">
      <style>{`
        @media print {
          @page { size: A4; margin: 14mm; }
          .no-print { display: none !important; }
          body { background: white !important; }
          .report-page {
            box-shadow: none !important;
            margin: 0 !important;
            page-break-after: always;
            min-height: auto !important;
          }
          .report-page:last-child { page-break-after: auto; }
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

      <div className="max-w-4xl mx-auto py-8 space-y-8 print:py-0 print:space-y-0">
        {tests.map((test, idx) => (
          <ReportPage
            key={test.id}
            test={test}
            patient={patient}
            values={values[test.id] ?? {}}
            reportDate={reportDate}
            reportId={reportId}
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
  reportDate,
  reportId,
  pageNum,
  totalPages,
}: {
  test: PathologyTest;
  patient: Patient;
  values: Record<string, string>;
  reportDate: string;
  reportId: string;
  pageNum: number;
  totalPages: number;
}) {
  return (
    <div className="report-page bg-white shadow-lg mx-4 p-10 print:p-0 print:m-0 print:shadow-none">
      {/* Letterhead */}
      <div className="border-b-2 border-blue-700 pb-4 mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-800">
            LOVABLE PATHOLOGY LAB
          </h1>
          <p className="text-xs text-slate-600">
            NABL Accredited • Diagnostic & Research Center
          </p>
          <p className="text-xs text-slate-500">
            123 Health Avenue, Med City • +91 98765 43210
          </p>
        </div>
        <div className="text-right text-xs text-slate-600">
          <div>
            <span className="font-semibold">Report ID:</span> {reportId}
          </div>
          <div>
            <span className="font-semibold">Date:</span> {reportDate}
          </div>
          <div className="mt-1 text-slate-400">
            Page {pageNum} of {totalPages}
          </div>
        </div>
      </div>

      {/* Patient strip */}
      <div className="grid grid-cols-4 gap-3 text-xs border border-slate-300 rounded mb-5">
        <InfoCell label="Patient Name" value={patient.name} />
        <InfoCell label="Age / Gender" value={`${patient.age} yrs / ${patient.gender}`} />
        <InfoCell label="Referred By" value={patient.refBy || "—"} />
        <InfoCell label="Sample Type" value={test.sampleType} />
      </div>

      {/* Test heading */}
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
          {test.name}
        </h2>
        <p className="text-xs text-slate-500">
          Department: {test.category}
          {test.method ? ` • Method: ${test.method}` : ""}
        </p>
      </div>

      {/* Results table — all sub-tests on the same page */}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-y-2 border-slate-700 text-left text-xs uppercase tracking-wide">
            <th className="py-2 px-2 w-1/2">Investigation</th>
            <th className="py-2 px-2">Result</th>
            <th className="py-2 px-2">Unit</th>
            <th className="py-2 px-2">Biological Ref. Interval</th>
          </tr>
        </thead>
        <tbody>
          {(test.subTests ?? []).map((sub) => {
            const result = values[sub.name];
            const flag = computeFlag(result, sub.reference);
            return (
              <tr key={sub.name} className="border-b border-slate-200">
                <td className="py-2 px-2 font-medium text-slate-800">
                  {sub.name}
                </td>
                <td className="py-2 px-2 font-semibold">
                  <span className={flag === "high" ? "text-red-600" : flag === "low" ? "text-orange-600" : ""}>
                    {result || "—"}
                  </span>
                  {flag === "high" && <span className="ml-1 text-red-600">↑</span>}
                  {flag === "low" && <span className="ml-1 text-orange-600">↓</span>}
                </td>
                <td className="py-2 px-2 text-slate-600">{sub.unit || "—"}</td>
                <td className="py-2 px-2 text-slate-600">
                  {sub.reference || "—"}
                </td>
              </tr>
            );
          })}
          {(!test.subTests || test.subTests.length === 0) && (
            <tr>
              <td colSpan={4} className="py-4 text-center text-slate-500">
                No parameters defined.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-6 text-[10px] text-slate-500 italic">
        * Results relate only to the sample tested. Please correlate clinically.
      </div>

      <div className="mt-12 flex justify-between items-end text-xs">
        <div>
          <div className="border-t border-slate-400 pt-1 w-40 text-center">
            Lab Technician
          </div>
        </div>
        <div>
          <div className="border-t border-slate-400 pt-1 w-48 text-center">
            Dr. R. Sharma, M.D. (Pathology)
            <div className="text-[10px] text-slate-500">Consultant Pathologist</div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-2 border-t border-slate-300 text-center text-[10px] text-slate-500">
        --- End of Report ---
      </div>
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-2 border-r border-slate-200 last:border-r-0">
      <div className="text-[10px] uppercase text-slate-500">{label}</div>
      <div className="font-semibold text-slate-800">{value}</div>
    </div>
  );
}

function computeFlag(
  result: string | undefined,
  reference: string | undefined
): "high" | "low" | "normal" | null {
  if (!result || !reference) return null;
  const num = parseFloat(result);
  if (Number.isNaN(num)) return null;

  // Match patterns: "10 - 20", "< 200", "> 40"
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
