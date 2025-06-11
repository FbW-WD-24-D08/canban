import { Outlet } from "react-router";
import { Sidebar } from "../organisms/sidebar.org";

export default function DashboardLayout() {
  return (
    <>
      <Sidebar>
        <Outlet />
      </Sidebar>
    </>
  );
}
