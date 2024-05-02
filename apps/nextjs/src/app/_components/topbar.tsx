import React, { useEffect, useState } from "react";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
  RotateCw,
} from "lucide-react";

import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { ThemeToggle } from "@acme/ui/theme";

interface TopBarProps {
  isPortrait: boolean;
  currentUrl: string;
  onAddressEntered: (address: string) => void;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onBookmark: () => void;
  onGoHome: () => void;
  onOpenHistory: () => void;
  disabled: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
  isPortrait,
  currentUrl,
  onAddressEntered,
  onBack,
  onForward,
  onRefresh,
  onBookmark,
  onGoHome,
  onOpenHistory,
  disabled,
}) => {
  const [address, setAddress] = useState('');

  useEffect(() => {
    setAddress(currentUrl);
  }, [currentUrl]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddressEntered(address);
  };

  if (isPortrait) {
    return (
      <div className="flex items-center justify-between border-b bg-background p-2">
        <form onSubmit={handleAddressSubmit} className="flex flex-1">
          <Input
            type="text"
            placeholder="dream play create"
            className="mx-4 flex-1"
            value={address}
            onChange={handleAddressChange}
            disabled={disabled}
          />
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border-b bg-background p-2">
      <div className="flex space-x-2">
        <Button variant="ghost" onClick={onBack} disabled={disabled}>
          <ChevronLeft />
        </Button>
        <Button variant="ghost" onClick={onForward} disabled={disabled}>
          <ChevronRight />
        </Button>
        <Button variant="ghost" onClick={onRefresh} disabled={disabled}>
          <RotateCw />
        </Button>
        <Button variant="ghost" onClick={onGoHome} disabled={disabled}>
          <Home />
        </Button>
      </div>
      <form onSubmit={handleAddressSubmit} className="flex flex-1">
        <Input
          type="text"
          placeholder="Search or enter address"
          className="mx-4 flex-1"
          value={address}
          onChange={handleAddressChange}
          disabled={disabled}
        />
      </form>
      <div className="flex space-x-2">
        <ThemeToggle />
        <Button variant="ghost" onClick={onBookmark} >
          <Bookmark />
        </Button>
        <Button variant="ghost" onClick={onOpenHistory} >
          <Clock />
        </Button>
      </div>
    </div>
  );
};

export default TopBar;
