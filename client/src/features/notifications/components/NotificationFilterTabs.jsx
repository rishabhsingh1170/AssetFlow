import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Tabs from "../../../components/ui/Tabs";
import { setFilter } from "../notification.slice";

const FILTER_TABS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];

export const NotificationFilterTabs = () => {
  const dispatch = useDispatch();
  const filter = useSelector((state) => state.notifications.filter);

  return (
    <Tabs
      tabs={FILTER_TABS}
      activeTab={filter}
      onChange={(value) => dispatch(setFilter(value))}
      variant="pills"
    />
  );
};

export default NotificationFilterTabs;
