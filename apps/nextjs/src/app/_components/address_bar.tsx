import React, { useEffect, useState } from "react";

import { Input } from "@acme/ui/input";

interface AddressBarProps {
  currentUrl: string;
  onAddressEntered: (address: string) => void;
  disabled: boolean;
}

const AddressBar: React.FC<AddressBarProps> = ({
  currentUrl,
  onAddressEntered,
  disabled,
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

  return (
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
  );
};

export default AddressBar;
