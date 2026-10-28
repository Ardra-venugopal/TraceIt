
import React, { useState, useEffect } from "react";
import { authService } from "../../services/authService";
import NotificationCard from "../../components/cards/NotificationCard";
import { BellRing, CheckSquare } from "lucide-react";

const API_URL = "http://localhost:5000/api/notifications";

export default function StudentNotifications() {
  const currentUser = authService.getCurrentUser();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    const loadNotifications = async () => {
      try {
        const token = localStorage.getItem("traceit_token");

        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load notifications."
          );
        }

        setNotifications(
          data.map((notification) => ({
            ...notification,
            read: Boolean(notification.read),
          }))
        );
      } catch (error) {
        console.error("Load notifications error:", error.message);
      }
    };

    loadNotifications();
  }, [currentUser?.id]);

  const handleMarkRead = async (id) => {
    try {
      const token = localStorage.getItem("traceit_token");

      const response = await fetch(`${API_URL}/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to mark as read.");
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Mark notification read error:", error.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem("traceit_token");

      const response = await fetch(`${API_URL}/read-all`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to mark all as read.");
      }

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (error) {
      console.error("Mark all notifications error:", error.message);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-sans font-extrabold text-3xl text-charcoal tracking-tight flex items-center gap-2">
            <BellRing className="w-8 h-8 text-terracotta" />
            <span>Notifications</span>
          </h1>

          <p className="text-sm text-dusty-blue mt-1">
            Stay updated on potential matches and claim statuses.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-terracotta hover:underline flex items-center gap-1"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkRead}
            />
          ))
        ) : (
          <div className="bg-surface-white border border-subtle p-12 rounded-card text-center text-sm text-dusty-blue">
            No notifications yet.
          </div>
        )}
      </div>
    </div>
  );
}
