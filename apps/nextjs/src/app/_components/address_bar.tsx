import React, { useEffect, useState } from "react";
import { Sparkle, Sparkles } from "lucide-react";

import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { toast } from "@acme/ui/toast";

interface AddressBarProps {
  currentUrl: string;
  onAddressEntered: (address: string) => void;
  disabled: boolean;
  model: string;
  changeModel: () => void;
}

const AddressBar: React.FC<AddressBarProps> = ({
  currentUrl,
  onAddressEntered,
  disabled,
  model,
  changeModel,
}) => {
  const [address, setAddress] = useState(currentUrl);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddressEntered(address);
  };

  useEffect(() => {
    setAddress(currentUrl);
  }, [currentUrl]);

  const toastAndChangeModel = () => {
    if (model === "claude-3-sonnet-20240229") {
      toast.info(
        `switched to genius & slow model`
      );
    } else {
      toast.info("switched to fast & smart model");
    }
    changeModel();
  };

  return (
    <form onSubmit={handleAddressSubmit} className="relative flex flex-1">
      <Input
        type="text"
        placeholder="Search or enter address"
        className="mx-4 flex-1 pr-12"
        value={address}
        onChange={handleAddressChange}
        disabled={disabled}
      />

      <Button
        type="button"
        variant="ghost"
        className="absolute right-6 top-1/2 -translate-y-1/2"
        onClick={toastAndChangeModel}
      >
        {model === "claude-3-sonnet-20240229" ? (
          <Sparkle className="h-6 w-6" />
        ) : (
          <Sparkles className="h-6 w-6" />
        )}
      </Button>
    </form>
  );
};

export default AddressBar;
