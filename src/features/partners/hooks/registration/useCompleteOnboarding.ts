import { useState } from 'react';
import { partnersApi } from '../../services';
import { parseApiError } from 'utils/parseApiError';

export function useCompleteOnboarding() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeOnboarding = async () => {
    setLoading(true);
    setError(null);
    try {
      await partnersApi.completeOnboarding();
    } catch (err: unknown) {
      setError(parseApiError(err, 'Failed to complete onboarding'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { completeOnboarding, loading, error };
}
