import React, { ReactNode } from "react";
import { SemanticICONS } from "semantic-ui-react";
import { createMedia } from "@artsy/fresnel";
import MobileMenu from "./MobileMenu/MobileMenu";
import DesktopMenu from "./DesktopMenu/DesktopMenu";

export interface MenuItem {
  type: string;
  position?: "left" | "right";
  icon?: SemanticICONS;
  name: string;
  text?: string;
  node?: ReactNode;
  subMenu?: Array<MenuItem>;
  onClick?;
}

const AppMedia = createMedia({
  breakpoints: {
    mobile: 320,
    tablet: 890,
    computer: 992,
    largeScreen: 1200,
    widescreen: 1920,
  },
});
const { Media, MediaContextProvider } = AppMedia;

const MainMenu = () => {
  return (
    <MediaContextProvider>
      <Media at="mobile">
        <MobileMenu />
      </Media>

      <Media greaterThan="mobile">
        <DesktopMenu />
      </Media>
    </MediaContextProvider>
  );
};

export default MainMenu;
