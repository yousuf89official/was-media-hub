import { ReactNode } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useSiteImages } from "@/hooks/useSiteImages";
import { useLandingFeatures } from "@/hooks/useLandingFeatures";
import { useLandingSections } from "@/hooks/useLandingSections";
import { SiteContentContext } from "@/contexts/SiteContentContext";

export const SiteContentProviderBackend = ({
  children,
}: {
  children: ReactNode;
}) => {
  const {
    data: settings = [],
    isLoading: settingsLoading,
    refetch: refetchSettings,
  } = useSiteSettings();
  const {
    data: images = [],
    isLoading: imagesLoading,
    refetch: refetchImages,
  } = useSiteImages();
  const {
    data: features = [],
    isLoading: featuresLoading,
    refetch: refetchFeatures,
  } = useLandingFeatures();
  const {
    data: sections = [],
    isLoading: sectionsLoading,
    refetch: refetchSections,
  } = useLandingSections();

  const isLoading =
    settingsLoading || imagesLoading || featuresLoading || sectionsLoading;

  const getSetting = (key: string) => {
    const setting = settings.find((s: any) => s.key === key);
    return setting?.value;
  };

  const getImage = (name: string) => images.find((i: any) => i.name === name);

  const getSection = (key: string) => {
    const section = sections.find((s: any) => s.section_key === key);
    return section?.content;
  };

  const refetch = () => {
    refetchSettings();
    refetchImages();
    refetchFeatures();
    refetchSections();
  };

  return (
    <SiteContentContext.Provider
      value={{
        settings,
        images,
        features,
        sections,
        isLoading,
        getSetting,
        getImage,
        getSection,
        refetch,
      }}
    >
      {children}
    </SiteContentContext.Provider>
  );
};

export default SiteContentProviderBackend;
