"use client";
import React, { useState } from "react";

type ResultItem = {
  rule: string;
  status: "pass" | "fail";
  evidence: string;
  reasoning: string;
  confidence: number;
};

export default function PdfRuleChecker() {
  const [formData, setFormData] = useState({
    fileName: "",
    fileObj: null as File | null,
    rules: ["", "", ""],
    results: [] as ResultItem[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRuleChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.map((r, i) => (i === index ? value : r)),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setFormData((prev) => ({ ...prev, fileName: "", fileObj: null }));
      return;
    }
    setFormData((prev) => ({ ...prev, fileName: file.name, fileObj: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.fileObj) {
      setError("Please upload a PDF file.");
      return;
    }

    if (formData.rules.some((r) => !r.trim())) {
      setError("Please fill all 3 rules.");
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("file", formData.fileObj);
      fd.append("rules", JSON.stringify(formData.rules));

      const res = await fetch(process.env.NEXT_PUBLIC_API_DEV as string, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (data.results) {
        setFormData((prev) => ({ ...prev, results: data.results }));
      } else {
        setError("No results returned.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            PDF Rule Checker
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload a PDF and check it against your rule.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-xl border border-gray-200 p-8 space-y-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <label className="text-sm font-semibold text-gray-700">
                Upload PDF
              </label>

              <div>
                <label
                  htmlFor="file"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 cursor-pointer"
                >
                  Choose File
                </label>

                <input
                  id="file"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="mt-2 text-sm text-gray-600 italic">
                  {formData.fileName || "No file chosen"}
                </div>

                <p className="mt-1 text-xs text-gray-400">
                  Max 20MB — PDF only.
                </p>
                {formData.fileObj && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        fileName: "",
                        fileObj: null,
                        results: [],
                      }))
                    }
                    className="mt-3 text-sm text-red-600 hover:underline"
                  >
                    Remove File
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-700">Rules</label>

            <div className="space-y-3">
              {formData.rules.map((r, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <span className="w-6 text-gray-600 text-sm">{i + 1}.</span>
                  <input
                    type="text"
                    placeholder={`Enter rule ${i + 1}`}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                    value={formData.rules[i]}
                    onChange={(e) => handleRuleChange(i, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400">
              Tip: Be clear and specific for the best LLM results.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow disabled:opacity-60"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Checking…
                </>
              ) : (
                "Check Document"
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                setFormData({
                  fileName: "",
                  fileObj: null,
                  rules: ["", "", ""],
                  results: [],
                })
              }
              className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              Reset
            </button>

            <div className="ml-auto text-sm text-gray-500">
              <span className="font-semibold">{formData.results.length}</span>{" "}
              results
            </div>
          </div>

          {error && (
            <div className="mt-4 text-sm font-medium text-red-600">{error}</div>
          )}
        </form>

        <section className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium text-gray-800">Results</h2>
            <div className="text-sm text-gray-500">Verified & validated</div>
          </div>

          <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rule
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Evidence
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reasoning
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {formData.results.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-6 text-center text-sm text-gray-400"
                      colSpan={5}
                    >
                      — no results yet —
                    </td>
                  </tr>
                ) : (
                  formData.results.map((res, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 align-top">
                        <div className="text-sm text-gray-700">{res.rule}</div>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            res.status === "pass"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {res.status === "pass" ? "Pass" : "Fail"}
                        </span>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <div className="text-xs font-mono text-gray-700">
                          {res.evidence &&
                          res.evidence !== "No evidence found" ? (
                            <span title={res.evidence}>{res.evidence}</span>
                          ) : (
                            <span className="text-gray-400">
                              No evidence found
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <div className="text-sm text-gray-600">
                          {res.reasoning}
                        </div>
                      </td>

                      <td className="px-4 py-3 align-top text-right">
                        <div className="text-sm text-gray-700 font-medium">
                          {res.confidence}%
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 text-xs text-gray-400">
            Note: Evidence is strictly validated against page/line text on the
            server. If the server can't verify a claimed Page/Line, it will show
            "No evidence found".
          </div>
        </section>
      </div>
    </div>
  );
}
