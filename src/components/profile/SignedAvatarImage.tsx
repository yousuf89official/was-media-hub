import { AvatarImage } from "@/components/ui/avatar";
import { useSignedAvatarUrl } from "@/utils/storageUrls";

interface SignedAvatarImageProps {
  src?: string | null;
  alt?: string;
}

/** Avatar image that resolves private profile-picture objects to signed URLs. */
export function SignedAvatarImage({ src, alt }: SignedAvatarImageProps) {
  const signedUrl = useSignedAvatarUrl(src);
  return <AvatarImage src={signedUrl || undefined} alt={alt} />;
}

export default SignedAvatarImage;
