import { useCallback, useEffect, useState } from 'react';
import { partnersApi } from '../../services';
import type { PublicPartnerProfile, UpdateMyPublicProfilePayload } from '../../types';
import { parseApiError } from 'utils/parseApiError';

/**
 * The signed-in Advisor's own public profile (any publish state) and saving
 * their edits to it. ⚠ GET/PUT /partners/profile/public are pending backend;
 * the mock serves them today.
 */
export function useMyPublicProfile() {
  const [profile, setProfile] = useState<PublicPartnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    partnersApi
      .getMyPublicProfile()
      .then((res) => {
        if (!cancelled) setProfile(res.data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(parseApiError(err, "Couldn't load your profile."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  /** Saves and returns the updated profile; throws so the caller can show the error. */
  const save = useCallback(async (payload: UpdateMyPublicProfilePayload) => {
    setSaving(true);
    try {
      const res = await partnersApi.updateMyPublicProfile(payload);
      setProfile(res.data);
      return res.data;
    } finally {
      setSaving(false);
    }
  }, []);

  return { profile, loading, error, saving, save, reload: () => setReloadKey((k) => k + 1) };
}
