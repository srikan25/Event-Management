import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useEvent } from "../context/EventContext";
import CreateEventModal from "./CreateEventModal";
import EditEventModal from "./EditEventModal";
import ChangePasswordModal from "./ChangePasswordModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { isOrganizer } from "../utils/authRole";

function AppHeader() {
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { events, activeEvent, selectEvent, loadingEvents } = useEvent();

  const [createEventOpen, setCreateEventOpen] = useState(false);

  const [editEventOpen, setEditEventOpen] = useState(false);

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const organizer = isOrganizer();

  const handleEventSelect = (event) => {
    selectEvent(event);
    setMenuOpen(false);
  };

  const handleThemeToggle = () => {
    setDarkMode((prev) => !prev);
  };

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
  };

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);

    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <>
      <header className="main-header">
        <button
          type="button"
          className="header-button"
          onClick={() => {
            setMenuOpen((prev) => !prev);
            setProfileOpen(false);
          }}
          aria-label="Open menu"
        >
          ☰
        </button>

        <div className="header-event-title">
          <h1 className="header-title">
            {activeEvent?.name || "Event Manager"}
          </h1>
          {activeEvent && (
            <button
              type="button"
              className="event-edit-icon"
              onClick={() => setEditEventOpen(true)}
              aria-label="Edit event"
            >
              <FontAwesomeIcon icon={faPenToSquare} />
            </button>
          )}
        </div>

        <button
          type="button"
          className="profile-header-button"
          onClick={() => {
            setProfileOpen((prev) => !prev);
            setMenuOpen(false);
          }}
          aria-label="Open profile"
        >
          {user?.user_metadata?.name?.slice(0, 2)?.toUpperCase() || "O"}
        </button>
      </header>

      {menuOpen && (
        <>
          <div className="menu-overlay" onClick={() => setMenuOpen(false)} />

          <aside className="side-menu">
            <div className="theme-row">
              <span>Theme</span>

              <button
                type="button"
                className="theme-switch"
                onClick={handleThemeToggle}
              >
                {darkMode ? "Dark" : "Light"}
              </button>
            </div>

            <div className="menu-section">
              <h2>Events</h2>

              <div className="events-list">
                {loadingEvents ? (
                  <p className="events-message">Loading events...</p>
                ) : events.length > 0 ? (
                  events.map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      className={`event-menu-item ${
                        activeEvent?.id === event.id ? "active-event" : ""
                      }`}
                      onClick={() => handleEventSelect(event)}
                    >
                      <span>{event.name}</span>

                      {activeEvent?.id === event.id && (
                        <span className="event-check">✓</span>
                      )}
                    </button>
                  ))
                ) : (
                  <p className="events-message">No events yet</p>
                )}
              </div>
            </div>

            <button
              type="button"
              className="create-event-button"
              onClick={() => {
                setMenuOpen(false);
                setCreateEventOpen(true);
              }}
              disabled={!organizer}
            >
              + Create New Event
            </button>
          </aside>
        </>
      )}

      {profileOpen && (
        <>
          <div className="menu-overlay" onClick={() => setProfileOpen(false)} />

          <div className="profile-menu">
            <div className="profile-avatar-large">
              {user?.user_metadata?.name?.slice(0, 2)?.toUpperCase()?.trim() ||
                "O"}
            </div>

            <strong>{user?.user_metadata?.name || "Organizer"}</strong>

            <span className="profile-email">{user?.email}</span>

            <button
              type="button"
              className="profile-action-button"
              onClick={() => {
                setProfileOpen(false);
                setChangePasswordOpen(true);
              }}
              disabled={!organizer}
            >
              Change Password
            </button>

            <button
              type="button"
              className="profile-logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </>
      )}

      <CreateEventModal
        open={createEventOpen}
        onClose={() => setCreateEventOpen(false)}
      />

      <EditEventModal
        open={editEventOpen}
        onClose={() => setEditEventOpen(false)}
      />

      <ChangePasswordModal
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </>
  );
}

export default AppHeader;
