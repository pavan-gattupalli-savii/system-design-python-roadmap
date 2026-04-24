import { useState, useEffect } from "react";
import { BREAKPOINTS } from "../constants/theme";

/** Returns true when the viewport width is below the mobile breakpoint. */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < BREAKPOINTS.mobile : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < BREAKPOINTS.mobile);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}
