import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, ArrowLeftRight } from "lucide-react";
import Button from "../../../components/ui/Button";

const ACTIONS = [
  { label: "Register asset", icon: Plus, path: "/assets" },
  { label: "Book a resource", icon: Calendar, path: "/resource-booking" },
  { label: "Request transfer", icon: ArrowLeftRight, path: "/allocation-transfer" },
];

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap gap-2.5">
      {ACTIONS.map(({ label, icon: Icon, path }) => (
        <Button
          key={path}
          variant="secondary"
          size="sm"
          onClick={() => navigate(path)}
          className="gap-2"
        >
          <Icon size={14} />
          {label}
        </Button>
      ))}
    </div>
  );
};

export default QuickActions;
