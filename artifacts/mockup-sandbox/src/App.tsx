import ZiratMobile from "./components/mockups/zirat/ZiratMobile";
import AdminApp from "./admin/AdminApp";

export default function App() {
  const path = window.location.pathname;
  const hash = window.location.hash;

  const isAdmin =
    path === "/admin" ||
    path === "/admin/" ||
    hash === "#admin";

  if (isAdmin) {
    return <AdminApp />;
  }

  return <ZiratMobile />;
}
