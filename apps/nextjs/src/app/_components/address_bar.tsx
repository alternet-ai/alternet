import React, { useEffect, useState } from "react";
import { Sparkle, Sparkles, Wind } from "lucide-react";

import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { toast } from "@acme/ui/toast";
import { MODELS } from "../static/constants";

interface AddressBarProps {
  currentUrl: string;
  onAddressEntered: (address: string) => void;
  disabled: boolean;
  modelIndex: number;
  changeModel: () => void;
}

const AddressBar: React.FC<AddressBarProps> = ({
  currentUrl,
  onAddressEntered,
  disabled,
  modelIndex,
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
    if (MODELS[modelIndex] === "claude-3-haiku-20240307") {
      toast.info("fast loading & good quality");
    } else if (MODELS[modelIndex] === "claude-3-sonnet-20240229") {
      toast.info(
        "slow loading & excellent quality"
      );
    } else if (MODELS[modelIndex] === "claude-3-opus-20240229") {
      toast.info("very fast loading & poor quality - good for quick edits")
    } else {
      toast.error("Could not find next model");
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
        {(() => {
          switch (MODELS[modelIndex]) {
            case "claude-3-sonnet-20240229":
              return <Sparkle className="h-6 w-6" />;
            case "claude-3-haiku-20240307":
              return <Wind className="h-6 w-6" />;
            case "claude-3-opus-20240229":
              return <Sparkles className="h-6 w-6" />;
            default:
              return null;
          }
        })()}
      </Button>
    </form>
  );
};

export default AddressBar;
