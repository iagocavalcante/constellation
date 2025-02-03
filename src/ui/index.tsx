import React from "react";
import { useMediaQuery } from "react-responsive";

import { createThemes, defaultTheme } from "@/ui/themes";
import { Theme, ThemeName } from "@/ui/types";
import { BLUE_HUE, GREEN_HUE, RED_HUE } from "@/ui/util/color-generation";

export { atoms } from "@/ui/atoms";
export * as tokens from "@/ui/tokens";
export * from "@/ui/types";
export * from "@/ui/util/flatten";
export * from "@/ui/util/platform";
export * from "@/ui/util/theme-selector";

/*
 * Context
 */
export const Context = React.createContext<{
  themeName: ThemeName;
  theme: Theme;
}>({
  themeName: "light",
  theme: defaultTheme,
});

export function ThemeProvider({
  children,
  theme: themeName,
}: React.PropsWithChildren<{ theme: ThemeName }>) {
  const themes = React.useMemo(() => {
    return createThemes({
      hues: {
        primary: BLUE_HUE,
        negative: RED_HUE,
        positive: GREEN_HUE,
      },
    });
  }, []);
  const theme = themes[themeName];

  return (
    <Context.Provider
      value={React.useMemo(
        () => ({
          themeName: themeName,
          theme: theme,
        }),
        [theme, themeName],
      )}
    >
      {children}
    </Context.Provider>
  );
}

export function useTheme() {
  return React.useContext(Context).theme;
}

export function useBreakpoints() {
  const gtPhone = useMediaQuery({ minWidth: 500 });
  const gtMobile = useMediaQuery({ minWidth: 800 });
  const gtTablet = useMediaQuery({ minWidth: 1300 });
  return {
    gtPhone,
    gtMobile,
    gtTablet,
  };
}
