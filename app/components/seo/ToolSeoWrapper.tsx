'use client';

import React from 'react';
import { ToolTechnicalWorkflow } from './ToolTechnicalWorkflow';
import { ToolGuideOverview } from './ToolGuideOverview';
import { ToolFaqAccordion } from './ToolFaqAccordion';

interface ToolSeoWrapperProps {
  toolKey: string;
  showWorkflow?: boolean;
  showGuide?: boolean;
  showFaq?: boolean;
}

export const ToolSeoWrapper: React.FC<ToolSeoWrapperProps> = ({
  toolKey,
  showWorkflow = true,
  showGuide = true,
  showFaq = true,
}) => {
  return (
    <div className="space-y-8">
      {showWorkflow && <ToolTechnicalWorkflow toolKey={toolKey} />}
      {(showGuide || showFaq) && (
        <div className="pt-10 border-t border-theme-subtle space-y-8">
          {showGuide && <ToolGuideOverview toolKey={toolKey} />}
          {showFaq && <ToolFaqAccordion toolKey={toolKey} />}
        </div>
      )}
    </div>
  );
};
