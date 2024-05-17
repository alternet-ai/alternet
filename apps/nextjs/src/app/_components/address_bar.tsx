import React, { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Lightbulb, LightbulbOff, Sparkle, Sparkles, Wind } from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@acme/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
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
  const pathname = usePathname();
  const pageId = useMemo(() => pathname.split("/")[1], [pathname]);

  const [address, setAddress] = useState(currentUrl);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const session = useSession();

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

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!pageId || session.status !== "authenticated") return;
      try {
        const response = await fetch(`/api/get-suggestions?id=${pageId}`);
        const data = (await response.json()) as { suggestions: string[] };
        setSuggestions(data.suggestions);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };

    void fetchSuggestions();
  }, [pageId, session.status]);

  const toastAndChangeModel = () => {
    if (MODELS[modelIndex] === "claude-3-haiku-20240307") {
      toast.info("fast loading & good quality");
    } else if (MODELS[modelIndex] === "claude-3-sonnet-20240229") {
      toast.info("slow loading & excellent quality");
    } else if (MODELS[modelIndex] === "claude-3-opus-20240229") {
      toast.info("very fast loading & poor quality - good for quick edits");
    } else {
      toast.error("Could not find next model");
    }
    changeModel();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setAddress(suggestion);
    onAddressEntered(suggestion);
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="absolute right-16 top-1/2 -translate-y-1/2"
            disabled={!suggestions.length}
          >
            <Lightbulb className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent style={{ maxWidth: "100vw" }}>
          {suggestions.map((suggestion, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              style={{ wordBreak: "break-word" }}
            >
              {suggestion}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

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
