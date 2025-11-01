import { createContext, useContext, ReactNode } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useSiteImages } from "@/hooks/useSiteImages";
import { useLandingFeatures } from "@/hooks/useLandingFeatures";
import { useLandingSections } from "@/hooks/useLandingSections";

interface SiteContentContextType {
  settings: any[];
  images: any[];
  features: any[];
  sections: any[];
  isLoading: boolean;
  getSetting: (key: string) => any;
  getImage: (name: string) => any;
  getSection: (key: string) => any;
  refetch: () => void;
}

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);

export const SiteContentProvider = ({ children }: { children: ReactNode }) => {
  const { data: settings = [], isLoading: settingsLoading, refetch: refetchSettings } = useSiteSettings();
  const { data: images = [], isLoading: imagesLoading, refetch: refetchImages } = useSiteImages();
  const { data: features = [], isLoading: featuresLoading, refetch: refetchFeatures } = useLandingFeatures();
  const { data: sections = [], isLoading: sectionsLoading, refetch: refetchSections } = useLandingSections();

  const isLoading = settingsLoading || imagesLoading || featuresLoading || sectionsLoading;

  const getSetting = (key: string) => {
    const setting = settings.find((s) => s.key === key);
    return setting?.value;
  };

  const getImage = (name: string) => {
    return images.find((i) => i.name === name);
  };

  const getSection = (key: string) => {
    const section = sections.find((s) => s.section_key === key);
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

export const useSiteContent = () => {
  const context = useContext(SiteContentContext);
  if (context === undefined) {
    throw new Error("useSiteContent must be used within SiteContentProvider");
  }
  return context;
};
