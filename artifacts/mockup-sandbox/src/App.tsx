import ZiratMobile from "./components/mockups/zirat/ZiratMobile";
import AdminApp from "./admin/AdminApp";

export default function App() {
  const path = window.location.pathname;

  if (path.endsWith("/admin")) {
    return <AdminApp />;
  }

  return <ZiratMobile />;
}
