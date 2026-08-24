import AppHeader from "../components/AppHeader";

function AppLayout({ children }) {
  return (
    <div className="main-app">
      <AppHeader />

      <main className="main-content">{children}</main>
    </div>
  );
}

export default AppLayout;
