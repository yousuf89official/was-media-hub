import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/safeClient";

export const useActivityLogger = () => {
  const location = useLocation();

  useEffect(() => {
    const logActivity = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from("user_activity_logs")
          .insert({
            user_id: user.id,
            activity_type: "page_view",
            page_path: location.pathname,
            metadata: { search: location.search }
          });
      }
    };

    logActivity();
  }, [location.pathname, location.search]);
};
