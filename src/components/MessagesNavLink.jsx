import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { NavLink } from "react-router-dom";

import { buyerService } from "../services/buyerService";

export default function MessagesNavLink({
  label,
  className = "",
  onClick,
  active = false,
  showUnreadCount = true,
}) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!showUnreadCount) return undefined;

    let active = true;
    const refreshUnreadCount = async () => {
      try {
        const conversations = await buyerService.getConversations();
        if (active) {
          setUnreadCount(conversations.reduce(
            (total, conversation) => total + (conversation.messages_non_lus || 0),
            0
          ));
        }
      } catch {
        // Le lien reste disponible si le compteur ne peut pas être actualisé.
      }
    };

    refreshUnreadCount();
    const interval = window.setInterval(refreshUnreadCount, 20_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [showUnreadCount]);

  const content = (
    <>
      <MessageCircle size={17} aria-hidden="true" />
      <span>{label}</span>
      {unreadCount > 0 ? (
        <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-ink">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </>
  );

  const ariaLabel = unreadCount ? `${label}, ${unreadCount} message(s) non lu(s)` : label;
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${className} ${active ? "bg-primary text-white" : ""}`}
        aria-label={ariaLabel}
        aria-current={active ? "page" : undefined}
      >
        {content}
      </button>
    );
  }

  return (
    <NavLink
      to="/messages"
      className={({ isActive }) => `${className} ${isActive ? "bg-primary text-white" : ""}`}
      aria-label={ariaLabel}
    >
      {content}
    </NavLink>
  );
}
