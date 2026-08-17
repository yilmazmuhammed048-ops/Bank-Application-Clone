import ZiratMobile from "./components/mockups/zirat/ZiratMobile";
import AdminApp from "./admin/AdminApp";

export default function App() {
  const path = window.location.pathname;

  if (path === "/admin" || path === "/admin/") {
  return <AdminApp />;
}

  return <ZiratMobile />;
}
