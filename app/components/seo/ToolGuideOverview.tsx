'use client';

import React from 'react';
import { useTranslation } from '../../lib/i18n';

interface ToolGuideOverviewProps {
  toolKey: string;
}

export const ToolGuideOverview: React.FC<ToolGuideOverviewProps> = ({ toolKey }) => {
  const { t } = useTranslation();

  const title = t(`tools.${toolKey}.guide.title`);
  if (!title || title === `tools.${toolKey}.guide.title`) {
    return null;
  }

  const intro = t(`tools.${toolKey}.guide.intro`);
  const steps: string[] = [];
  for (let i = 1; i <= 6; i++) {
    const step = t(`tools.${toolKey}.guide.step${i}`);
    if (step && step !== `tools.${toolKey}.guide.step${i}`) {
      steps.push(step);
    } else {
      break;
    }
  }

  const privacyTitle = t(`tools.${toolKey}.guide.privacyTitle`);
  const privacyIntro = t(`tools.${toolKey}.guide.privacyIntro`);
  const privacyBullet1 = t(`tools.${toolKey}.guide.privacyBullet1`);
  const privacyBullet2 = t(`tools.${toolKey}.guide.privacyBullet2`);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-sm text-theme-muted leading-relaxed">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-theme-main">{title}</h2>
        {intro && <p>{intro}</p>}
        {steps.length > 0 && (
          <ol className="list-decimal list-inside space-y-2 pl-2">
            {steps.map((step, idx) => {
              const colonIdx = step.indexOf(':');
              if (colonIdx !== -1) {
                const label = step.substring(0, colonIdx + 1);
                const rest = step.substring(colonIdx + 1);
                return (
                  <li key={idx}>
                    <strong>{label}</strong>{rest}
                  </li>
                );
              }
              return <li key={idx}>{step}</li>;
            })}
          </ol>
        )}
      </div>

      <div className="space-y-4">
        {privacyTitle && <h2 className="text-lg font-bold text-theme-main">{privacyTitle}</h2>}
        {privacyIntro && <p>{privacyIntro}</p>}
        {privacyBullet1 && (
          <p>
            {privacyBullet1.includes(':') ? (
              <>
                <strong>{privacyBullet1.split(':')[0]}:</strong>
                {privacyBullet1.substring(privacyBullet1.indexOf(':') + 1)}
              </>
            ) : (
              privacyBullet1
            )}
          </p>
        )}
        {privacyBullet2 && (
          <p>
            {privacyBullet2.includes(':') ? (
              <>
                <strong>{privacyBullet2.split(':')[0]}:</strong>
                {privacyBullet2.substring(privacyBullet2.indexOf(':') + 1)}
              </>
            ) : (
              privacyBullet2
            )}
          </p>
        )}
      </div>
    </div>
  );
};
