'use client';

import React from 'react';

export const AtsResumeDocs: React.FC = () => {
  return (
    <div className="space-y-10 text-theme-main">
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          ATS Parsing Constraints: Why Formatting Determines Candidate Visibility
        </h2>
        <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
          Applicant Tracking Systems (such as Workday, Greenhouse, and Lever) strip visual presentation to parse plain text tokens into candidate profiles:
        </p>

        <div className="overflow-x-auto rounded-lg border border-theme-subtle bg-surface">
          <table className="w-full text-left text-xs sm:text-sm font-mono divide-y divide-theme-subtle">
            <thead className="bg-neutral-900/60 text-theme-muted text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Resume Feature</th>
                <th className="px-4 py-2.5 font-semibold">ATS Compatibility</th>
                <th className="px-4 py-2.5 font-semibold">Parser Impact / Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-subtle text-theme-muted">
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-theme-main">Single-Column Linear Flow</td>
                <td className="px-4 py-2.5 text-green-400 font-semibold">100% Compatible</td>
                <td className="px-4 py-2.5">Text streams in natural reading order without column jumping</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-theme-main">Multi-Column / Tables / Icons</td>
                <td className="px-4 py-2.5 text-red-400 font-semibold">High Risk</td>
                <td className="px-4 py-2.5">Columns scramble together into garbled sentences during text extraction</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-theme-main">Standard Headings (Experience, Skills)</td>
                <td className="px-4 py-2.5 text-green-400 font-semibold">100% Compatible</td>
                <td className="px-4 py-2.5">Parsers map job titles, dates, and skill taxonomies accurately</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-theme-main">Vector PDF Generation</td>
                <td className="px-4 py-2.5 text-green-400 font-semibold">100% Compatible</td>
                <td className="px-4 py-2.5">Selectable text preserves unicode characters and font glyphs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
