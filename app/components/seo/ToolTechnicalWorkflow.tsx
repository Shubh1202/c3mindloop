'use client';

import React from 'react';
import { useTranslation } from '../../lib/i18n';

interface ToolTechnicalWorkflowProps {
  toolKey: string;
}

export const ToolTechnicalWorkflow: React.FC<ToolTechnicalWorkflowProps> = ({ toolKey }) => {
  const { t } = useTranslation();

  const feat1Title = t(`tools.${toolKey}.feat1Title`);
  const feat1Desc = t(`tools.${toolKey}.feat1Desc`);
  const feat2Title = t(`tools.${toolKey}.feat2Title`);
  const feat2Desc = t(`tools.${toolKey}.feat2Desc`);
  const feat3Title = t(`tools.${toolKey}.feat3Title`);
  const feat3Desc = t(`tools.${toolKey}.feat3Desc`);

  if (!feat1Title || feat1Title === `tools.${toolKey}.feat1Title`) {
    return null;
  }

  return (
    <div className="pt-8 border-t border-theme-subtle grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono text-theme-muted">
      <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
        <h2 className="text-sm font-semibold text-theme-main font-sans">{feat1Title}</h2>
        <p className="leading-relaxed">{feat1Desc}</p>
      </div>
      <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
        <h2 className="text-sm font-semibold text-theme-main font-sans">{feat2Title}</h2>
        <p className="leading-relaxed">{feat2Desc}</p>
      </div>
      <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
        <h2 className="text-sm font-semibold text-theme-main font-sans">{feat3Title}</h2>
        <p className="leading-relaxed">{feat3Desc}</p>
      </div>
    </div>
  );
};
