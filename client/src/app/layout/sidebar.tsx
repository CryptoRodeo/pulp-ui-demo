import type React from "react";
import { NavLink } from "react-router-dom";

import { Paths } from "@app/Routes";
import {
  Nav,
  NavList,
  PageSidebar,
  PageSidebarBody,
} from "@patternfly/react-core";
import { css } from "@patternfly/react-styles";
import nav from "@patternfly/react-styles/css/components/Nav/nav";

const LINK_CLASS = nav.navLink;
const ACTIVE_LINK_CLASS = nav.modifiers.current;

export const SidebarApp: React.FC = () => {
  const renderPageNav = () => {
    return (
      <Nav id="nav-sidebar" aria-label="Nav">
        <NavList>
          <li className={nav.navItem}>
            <NavLink
              to={Paths.landing}
              end
              className={({ isActive }) => {
                return css(LINK_CLASS, isActive ? ACTIVE_LINK_CLASS : "");
              }}
            >
              Home
            </NavLink>
          </li>
          <li className={nav.navItem}>
            <NavLink
              to={Paths.trustedLibraries}
              className={({ isActive }) => {
                return css(LINK_CLASS, isActive ? ACTIVE_LINK_CLASS : "");
              }}
            >
              Trusted Libraries
            </NavLink>
          </li>
          <li className={nav.navItem}>
            <NavLink
              to={Paths.redHatAIComponents}
              className={({ isActive }) => {
                return css(LINK_CLASS, isActive ? ACTIVE_LINK_CLASS : "");
              }}
            >
              Red Hat AI Components
            </NavLink>
          </li>
        </NavList>
      </Nav>
    );
  };

  return (
    <PageSidebar>
      <PageSidebarBody>{renderPageNav()}</PageSidebarBody>
    </PageSidebar>
  );
};
