import {
  createContext,
  useContext,
  ReactNode,
  Suspense,
  lazy,
  useMemo,
} from "react";
import {
  DEFAULT_CTA,
  DEFAULT_HERO,
  DEFAULT_SETTINGS,
} from "@/utils/contentDefaults";

export interface SiteContentContextType {
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

export const SiteContentContext = createContext<
  SiteContentContextType | undefined
>(undefined);

const BackendProvider = lazy(() => import("./SiteContentProviderBackend"));

const isBackendConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  return Boolean(url && key);
};

const SiteContentProviderFallback = ({ children }: { children: ReactNode }) => {
  const value = useMemo<SiteContentContextType>(() => {
    const settings = Object.entries(DEFAULT_SETTINGS).map(([key, val]) => ({
      key,
      value: val,
    }));

    const sections = [
      { section_key: "hero", content: DEFAULT_HERO },
      { section_key: "cta", content: DEFAULT_CTA },
      {
        section_key: "features",
        content: { title: "Powerful Features for Modern Teams" },
      },
    ];

    return {
      settings,
      images: [],
      features: [],
      sections,
      isLoading: false,
      getSetting: (key: string) => settings.find((s) => s.key === key)?.value,
      getImage: () => undefined,
      getSection: (key: string) =>
        sections.find((s) => s.section_key === key)?.content,
      refetch: () => {},
    };
  }, []);

  return (
    <SiteContentContext.Provider value={value}>
      {children}
    </SiteContentContext.Provider>
  );
};

export const SiteContentProvider = ({ children }: { children: ReactNode }) => {
  if (!isBackendConfigured()) {
    return <SiteContentProviderFallback>{children}</SiteContentProviderFallback>;
  }

  return (
    <Suspense fallback={null}>
      <BackendProvider>{children}</BackendProvider>
    </Suspense>
  );
};

export const useSiteContent = () => {
  const context = useContext(SiteContentContext);
  if (context === undefined) {
    throw new Error("useSiteContent must be used within SiteContentProvider");
  }
  return context;
};

