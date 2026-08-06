import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/safeClient";

const AVATAR_BUCKET = "profile-pictures";

/**
 * Extracts the object path from a stored Supabase storage URL.
 * Returns the input unchanged when it already looks like a plain path.
 */
export const extractStoragePath = (
  url?: string | null,
  bucket: string = AVATAR_BUCKET
): string | null => {
  if (!url) return null;
  if (url.startsWith("data:") || url.startsWith("blob:")) return null;
  const marker = `/${bucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) {
    return url.startsWith("http") ? null : url;
  }
  return url.slice(index + marker.length).split("?")[0];
};

/**
 * Resolves a private profile-picture object into a short-lived signed URL.
 * Falls back to the original value for data/blob previews.
 */
export const useSignedAvatarUrl = (url?: string | null) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!url) {
      setSignedUrl(null);
      return;
    }

    if (url.startsWith("data:") || url.startsWith("blob:")) {
      setSignedUrl(url);
      return;
    }

    const path = extractStoragePath(url);
    if (!path || !supabase) {
      setSignedUrl(null);
      return;
    }

    supabase.storage
      .from(AVATAR_BUCKET)
      .createSignedUrl(path, 60 * 60)
      .then(({ data }) => {
        if (!cancelled) setSignedUrl(data?.signedUrl ?? null);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return signedUrl;
};
