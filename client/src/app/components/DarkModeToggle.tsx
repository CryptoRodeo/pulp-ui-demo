import type React from "react";
import { useState } from "react";
import {
  Select,
  SelectGroup,
  SelectList,
  SelectOption,
  MenuToggle,
  Icon,
  Spinner,
} from "@patternfly/react-core";
import { useDarkMode, type ThemeMode } from "@app/hooks/useDarkMode";
import {
  OutlinedMoonIcon,
  OutlinedSunIcon,
  DesktopIcon,
} from "@patternfly/react-icons";

const ColorSchemeGroupLabel = (
  <div
    className="pf-v6-c-menu__group-title"
    id="theme-selector-color-scheme-title"
  >
    Color scheme
  </div>
);

export const DarkModeToggle: React.FC = () => {
  const { mode, setMode, modes } = useDarkMode();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeChange = (
    _event?: React.MouseEvent,
    selectedMode?: string | number,
  ) => {
    if (selectedMode) {
      setMode(selectedMode as ThemeMode);
      setIsOpen(false);
    }
  };

  const getThemeDisplayText = (themeMode: ThemeMode) => {
    switch (themeMode) {
      case modes.LIGHT:
        return "Light";
      case modes.DARK:
        return "Dark";
      default:
        return "System";
    }
  };

  const getThemeIcon = (themeMode: ThemeMode) => {
    switch (themeMode) {
      case modes.LIGHT:
        return <OutlinedSunIcon />;
      case modes.DARK:
        return <OutlinedMoonIcon />;
      case modes.SYSTEM:
        return <DesktopIcon />;
      default:
        return <Spinner size="sm" />;
    }
  };

  return (
    <Select
      isOpen={isOpen}
      selected={mode}
      onSelect={handleThemeChange}
      onOpenChange={(open) => setIsOpen(open)}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => setIsOpen(!isOpen)}
          isExpanded={isOpen}
          icon={<Icon size="lg">{getThemeIcon(mode)}</Icon>}
          aria-label={`Theme selection, current: ${getThemeDisplayText(mode)}`}
        />
      )}
      shouldFocusToggleOnSelect
      onOpenChangeKeys={["Escape"]}
      popperProps={{
        position: "right",
        enableFlip: true,
        preventOverflow: true,
      }}
    >
      <SelectGroup label={ColorSchemeGroupLabel}>
        <SelectList aria-labelledby="theme-selector-color-scheme-title">
          <SelectOption
            value={modes.SYSTEM}
            icon={<DesktopIcon />}
            description="Follow system preference"
          >
            System
          </SelectOption>
          <SelectOption
            value={modes.LIGHT}
            icon={<OutlinedSunIcon />}
            description="Always use light mode"
          >
            Light
          </SelectOption>
          <SelectOption
            value={modes.DARK}
            icon={<OutlinedMoonIcon />}
            description="Always use dark mode"
          >
            Dark
          </SelectOption>
        </SelectList>
      </SelectGroup>
    </Select>
  );
};
