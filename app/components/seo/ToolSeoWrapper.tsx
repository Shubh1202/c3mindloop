'use client';

import React from 'react';
import { ToolTechnicalWorkflow } from './ToolTechnicalWorkflow';
import { ToolGuideOverview } from './ToolGuideOverview';
import { ToolFaqAccordion } from './ToolFaqAccordion';
import { RelatedToolsSection } from './RelatedToolsSection';

interface ToolSeoWrapperProps {
  toolKey: string;
  showWorkflow?: boolean;
  showGuide?: boolean;
  showFaq?: boolean;
  relatedToolIds?: string[];
  children?: React.ReactNode;
}

export const ToolSeoWrapper: React.FC<ToolSeoWrapperProps> = ({
  toolKey,
  showWorkflow = true,
  showGuide = true,
  showFaq = true,
  relatedToolIds,
  children,
}) => {
  return (
    <div className="space-y-8">
      {showWorkflow && <ToolTechnicalWorkflow toolKey={toolKey} />}
      
      {/* Custom rich developer documentation / cheatsheets / tables if provided */}
      {children}

      {(showGuide || showFaq) && (
        <div className="pt-10 border-t border-theme-subtle space-y-8">
          {showGuide && <ToolGuideOverview toolKey={toolKey} />}
          {showFaq && <ToolFaqAccordion toolKey={toolKey} />}
        </div>
      )}

      {/* Contextual related tools interlinking */}
      {relatedToolIds && relatedToolIds.length > 0 && (
        <RelatedToolsSection
          currentToolId={toolKey}
          relatedIds={relatedToolIds}
        />
      )}
    </div>
  );
};
