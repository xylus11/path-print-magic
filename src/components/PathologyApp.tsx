import { useMemo, useState } from "react";
import { PATHOLOGY_TESTS, type PathologyTest } from "../lib/pathology-tests";
import { PrintableReport } from "./PrintableReport";

type Patient = {
  name: string;
  age: string;
  gender: string;
  refBy: string;
};

type Step = "patient" | "tests" | "values" | "print";

export function PathologyApp() {
  const [step, setStep] = useState<Step>("patient");
  const [patient, setPatient] = useState<Patient>({
    name: "",
    age: "",
    gender: "Male",
    refBy: "Self",
  });
  const [selected, setSelected] = useState<PathologyTest[]>([]);
  const [search, setSearch] = useState("");
  // values[testId][subTestName] = string
  const [values, setValues] = useState<Record<string, Record<string, string>>>({});

  const totalCost = useMemo(
    () => selected.reduce((sum, t) => sum + t.cost, 0),
    [selected]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return PATHOLOGY_TESTS;
    return PATHOLOGY_TESTS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.subTests?.some((s) => s.name.toLowerCase().includes(q))
    );
  }, [search]);

  const toggleTest = (t: PathologyTest) => {
    setSelected((prev) =>
      prev.find((p) => p.id === t.id)
        ? prev.filter((p) => p.id !== t.id)
        : [...prev, t]
    );
  };

  const setValue = (testId: string, sub: string, v: string) => {
    setValues((prev) => ({
      ...prev,
      [testId]: { ...(prev[testId] ?? {}), [sub]: v },
    }));
  };

  if (step === "print") {
    return (
      <PrintableReport
        patient={patient}
        tests={selected}
        values={values}
        totalCost={totalCost}
        onBack={() => setStep("values")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Lovable Pathology Lab
            </h1>
            <p className="text-xs text-slate-500">
              Diagnostic Report Generator
            </p>
          </div>
          <nav className="flex items-center gap-2 text-xs">
            <StepDot active={step === "patient"} done={step !== "patient"} label="Patient" />
            <span className="text-slate-300">—</span>
            <StepDot
              active={step === "tests"}
              done={step === "values"}
              label="Tests"
            />
            <span className="text-slate-300">—</span>
            <StepDot active={step === "values"} done={false} label="Values" />
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {step === "patient" && (
          <PatientForm
            patient={patient}
            setPatient={setPatient}
            onNext={() => setStep("tests")}
          />
        )}

        {step === "tests" && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white rounded-lg border p-4">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search pathology tests (e.g. CBC, Thyroid, Lipid)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="bg-white rounded-lg border divide-y max-h-[60vh] overflow-y-auto">
                {filtered.map((t) => {
                  const isSel = !!selected.find((s) => s.id === t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTest(t)}
                      className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-slate-50 ${
                        isSel ? "bg-blue-50" : ""
                      }`}
                    >
                      <div>
                        <div className="font-medium text-slate-900">{t.name}</div>
                        <div className="text-xs text-slate-500">
                          {t.category} • {t.subTests?.length ?? 0} parameter(s)
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-900">
                          ₹{t.cost}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            isSel
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {isSel ? "Added" : "Add"}
                        </span>
                      </div>
                    </button>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="p-6 text-center text-sm text-slate-500">
                    No tests match "{search}"
                  </div>
                )}
              </div>
            </div>

            <aside className="bg-white rounded-lg border p-4 h-fit sticky top-4">
              <h2 className="font-semibold text-slate-900 mb-3">
                Selected Tests ({selected.length})
              </h2>
              {selected.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Search and add tests from the list.
                </p>
              ) : (
                <ul className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                  {selected.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate pr-2">{t.name}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-medium">₹{t.cost}</span>
                        <button
                          onClick={() => toggleTest(t)}
                          className="text-red-500 hover:text-red-700"
                          aria-label="Remove"
                        >
                          ×
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="border-t pt-3 flex items-center justify-between mb-3">
                <span className="font-semibold">Total Cost</span>
                <span className="text-xl font-bold text-blue-700">
                  ₹{totalCost}
                </span>
              </div>
              <button
                disabled={selected.length === 0}
                onClick={() => setStep("values")}
                className="w-full bg-blue-600 text-white py-2.5 rounded-md font-medium disabled:opacity-40 hover:bg-blue-700"
              >
                Proceed to Enter Values
              </button>
              <button
                onClick={() => setStep("patient")}
                className="w-full mt-2 text-sm text-slate-600 hover:text-slate-900"
              >
                ← Back to patient
              </button>
            </aside>
          </div>
        )}

        {step === "values" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border p-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Enter Test Values
                </h2>
                <p className="text-xs text-slate-500">
                  {patient.name} • {patient.age} yrs • {patient.gender}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Total Cost</div>
                <div className="text-lg font-bold text-blue-700">
                  ₹{totalCost}
                </div>
              </div>
            </div>

            {selected.map((t) => (
              <div key={t.id} className="bg-white rounded-lg border">
                <div className="px-4 py-3 border-b bg-slate-50">
                  <h3 className="font-semibold text-slate-900">{t.name}</h3>
                  <p className="text-xs text-slate-500">
                    {t.category} • Sample: {t.sampleType}
                  </p>
                </div>
                <div className="divide-y">
                  {(t.subTests ?? []).map((sub) => (
                    <div
                      key={sub.name}
                      className="px-4 py-2 grid grid-cols-12 gap-3 items-center text-sm"
                    >
                      <div className="col-span-5 font-medium text-slate-800">
                        {sub.name}
                      </div>
                      <input
                        type="text"
                        value={values[t.id]?.[sub.name] ?? ""}
                        onChange={(e) =>
                          setValue(t.id, sub.name, e.target.value)
                        }
                        placeholder="Result"
                        className="col-span-3 px-2 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <div className="col-span-2 text-slate-500 text-xs">
                        {sub.unit || "—"}
                      </div>
                      <div className="col-span-2 text-slate-500 text-xs">
                        {sub.reference || "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between bg-white rounded-lg border p-4 sticky bottom-4">
              <button
                onClick={() => setStep("tests")}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                ← Back to test selection
              </button>
              <button
                onClick={() => setStep("print")}
                className="bg-green-600 text-white px-6 py-2.5 rounded-md font-medium hover:bg-green-700"
              >
                Print Report →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StepDot({
  active,
  done,
  label,
}: {
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full ${
        active
          ? "bg-blue-600 text-white"
          : done
            ? "bg-blue-100 text-blue-700"
            : "bg-slate-100 text-slate-500"
      }`}
    >
      {label}
    </span>
  );
}

function PatientForm({
  patient,
  setPatient,
  onNext,
}: {
  patient: Patient;
  setPatient: (p: Patient) => void;
  onNext: () => void;
}) {
  const valid = patient.name.trim() && patient.age.trim();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onNext();
      }}
      className="max-w-xl mx-auto bg-white rounded-lg border p-6 space-y-4"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Patient Information
        </h2>
        <p className="text-sm text-slate-500">
          Enter patient details to begin a new report.
        </p>
      </div>
      <Field label="Patient Name">
        <input
          type="text"
          required
          autoFocus
          value={patient.name}
          onChange={(e) => setPatient({ ...patient, name: e.target.value })}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Age (years)">
          <input
            type="number"
            required
            min={0}
            value={patient.age}
            onChange={(e) => setPatient({ ...patient, age: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </Field>
        <Field label="Gender">
          <select
            value={patient.gender}
            onChange={(e) => setPatient({ ...patient, gender: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </Field>
      </div>
      <Field label="Referred By">
        <input
          type="text"
          value={patient.refBy}
          onChange={(e) => setPatient({ ...patient, refBy: e.target.value })}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Field>
      <button
        type="submit"
        disabled={!valid}
        className="w-full bg-blue-600 text-white py-2.5 rounded-md font-medium disabled:opacity-40 hover:bg-blue-700"
      >
        Next: Select Tests →
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}
