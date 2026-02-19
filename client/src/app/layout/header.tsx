import React, { useReducer, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  Brand,
  Dropdown,
  DropdownItem,
  DropdownList,
  Icon,
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadLogo,
  MastheadMain,
  MenuToggle,
  type MenuToggleElement,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from "@patternfly/react-core";

import EllipsisVIcon from "@patternfly/react-icons/dist/esm/icons/ellipsis-v-icon";
import HelpIcon from "@patternfly/react-icons/dist/esm/icons/help-icon";
import ExternalLinkAltIcon from "@patternfly/react-icons/dist/js/icons/external-link-alt-icon";

import { ThemeSelector } from "@app/components/ThemeSelector";
import useBranding from "@app/hooks/useBranding";
import { ThemeContext } from "@app/components/ThemeContext";

import { AboutApp } from "./about";
import "./header.css";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
const sectionLogoByPath: Record<
  string,
  { src: string; alt: string; height: string; to: string }
> = {
  "/": {
    src: `${BASE}/images/packages.svg`,
    alt: "Packages",
    height: "44px",
    to: "/",
  },
  "/trusted-libraries": {
    src: `${BASE}/images/trusted-libraries.svg`,
    alt: "Trusted Libraries",
    height: "44px",
    to: "/trusted-libraries",
  },
  "/redhat-ai-components": {
    src: `${BASE}/images/rhai.svg`,
    alt: "Red Hat AI Components",
    height: "44px",
    to: "/redhat-ai-components",
  },
};

function getSectionKey(pathname: string): string {
  if (pathname.startsWith("/trusted-libraries")) return "/trusted-libraries";
  if (pathname.startsWith("/redhat-ai-components")) return "/redhat-ai-components";
  return "/";
}

export const HeaderApp: React.FC = () => {
  const { isDark } = React.useContext(ThemeContext);
  const location = useLocation();
  const sectionKey = getSectionKey(location.pathname);
  const sectionLogo = sectionLogoByPath[sectionKey] ?? sectionLogoByPath["/"];

  const {
    masthead: { rightBrand, supportUrl },
  } = useBranding();

  const [isAboutModalOpen, toggleIsAboutModalOpen] = useReducer(
    (state) => !state,
    false,
  );
  const [isHelpDropdownOpen, setIsHelpDropdownOpen] = useState(false);
  const [isKebabDropdownOpen, setIsKebabDropdownOpen] = useState(false);

  const onHelpDropdownToggle = () => {
    setIsHelpDropdownOpen(!isHelpDropdownOpen);
  };

  const onKebabDropdownToggle = () => {
    setIsKebabDropdownOpen(!isKebabDropdownOpen);
  };

  return (
    <>
      <AboutApp isOpen={isAboutModalOpen} onClose={toggleIsAboutModalOpen} />

      <Masthead>
        <MastheadMain>
          <MastheadBrand className="header-masthead-brand">
            <MastheadLogo component={(props) => <Link {...props} to={sectionLogo.to} />}>
              <span className="header-section-logo">
                <Brand
                  src={sectionLogo.src}
                  alt={sectionLogo.alt}
                  heights={{ default: sectionLogo.height }}
                />
              </span>
            </MastheadLogo>
          </MastheadBrand>
        </MastheadMain>
        <MastheadContent>
          <Toolbar id="toolbar" isFullHeight isStatic>
            <ToolbarContent>
              {/* toolbar items to always show */}
              <ToolbarGroup
                id="header-toolbar-tasks"
                variant="action-group-plain"
                align={{ default: "alignEnd" }}
              />

              {/* toolbar items to show at desktop sizes */}
              <ToolbarGroup
                id="header-toolbar-desktop"
                variant="action-group-plain"
                gap={{ default: "gapNone", md: "gapMd" }}
                visibility={{
                  default: "hidden",
                  "2xl": "visible",
                  xl: "visible",
                  lg: "visible",
                  md: "hidden",
                }}
              >
                <ToolbarItem>
                  <ThemeSelector />
                </ToolbarItem>
                <ToolbarItem>
                  <Dropdown
                    isOpen={isHelpDropdownOpen}
                    onSelect={onHelpDropdownToggle}
                    onOpenChange={(isOpen: boolean) =>
                      setIsHelpDropdownOpen(isOpen)
                    }
                    popperProps={{ position: "right" }}
                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                      <MenuToggle
                        ref={toggleRef}
                        onClick={onHelpDropdownToggle}
                        isExpanded={isHelpDropdownOpen}
                        variant="plain"
                        aria-label="About"
                      >
                        <HelpIcon />
                      </MenuToggle>
                    )}
                  >
                    <DropdownList>
                      {supportUrl && (
                        <DropdownItem
                          key="support"
                          component="a"
                          to={supportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Support{" "}
                          <Icon isInline iconSize="sm">
                            <ExternalLinkAltIcon />
                          </Icon>
                        </DropdownItem>
                      )}
                      <DropdownItem
                        key="about"
                        onClick={toggleIsAboutModalOpen}
                      >
                        About
                      </DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </ToolbarItem>
              </ToolbarGroup>

              {/* toolbar items to show at mobile sizes */}
              <ToolbarGroup
                id="header-toolbar-mobile"
                variant="action-group-plain"
                gap={{ default: "gapNone", md: "gapMd" }}
                visibility={{ lg: "hidden" }}
              >
                <ToolbarItem>
                  <ThemeSelector />
                </ToolbarItem>
                <ToolbarItem>
                  <Dropdown
                    isOpen={isKebabDropdownOpen}
                    onSelect={onKebabDropdownToggle}
                    onOpenChange={(isOpen: boolean) =>
                      setIsKebabDropdownOpen(isOpen)
                    }
                    popperProps={{ position: "right" }}
                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                      <MenuToggle
                        ref={toggleRef}
                        onClick={onKebabDropdownToggle}
                        isExpanded={isKebabDropdownOpen}
                        variant="plain"
                        aria-label="About"
                      >
                        <EllipsisVIcon />
                      </MenuToggle>
                    )}
                  >
                    <DropdownList>
                      {supportUrl && (
                        <DropdownItem
                          key="support"
                          component="a"
                          to={supportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Support{" "}
                          <Icon isInline iconSize="sm">
                            <ExternalLinkAltIcon />
                          </Icon>
                        </DropdownItem>
                      )}
                      <DropdownItem
                        key="about"
                        onClick={toggleIsAboutModalOpen}
                      >
                        About
                      </DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </ToolbarItem>
              </ToolbarGroup>

              {rightBrand ? (
                <ToolbarGroup>
                  <ToolbarItem>
                    <Brand
                      src={rightBrand.src}
                      alt={rightBrand.alt}
                      heights={{ default: rightBrand.height }}
                    />
                  </ToolbarItem>
                </ToolbarGroup>
              ) : null}
            </ToolbarContent>
          </Toolbar>
        </MastheadContent>
      </Masthead>
    </>
  );
};
