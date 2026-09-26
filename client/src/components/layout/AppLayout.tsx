import { Outlet } from "react-router-dom";

import TopNav from "./TopNav";

function AppLayout() {
  return (
    <div className="app-shell">
      <TopNav />

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;