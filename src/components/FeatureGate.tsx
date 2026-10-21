import React, { ReactNode } from 'react';
import { useExperience } from '../context/ExperienceContext.tsx';

interface FeatureGateProps {
  featureId: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({ featureId, fallback = null, children }) => {
  const { isFeatureEnabled } = useExperience();

  if (!isFeatureEnabled(featureId)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
