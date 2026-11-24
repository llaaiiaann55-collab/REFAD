import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [lang, setLang] = useState('ar');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState(101);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  // Toggle Language
  const toggleLanguage = () => {
    const nextLang = lang === 'ar' ? 'en' : 'ar';
    setLang(nextLang);
    document.documentElement.lang = nextLang;
    document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr';
  };

  // Toast notifier
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch current user and notifications
  const fetchAuthAndData = async () => {
    try {
      const [userRes, usersRes, notifsRes] = await Promise.all([
        fetch('/api/auth/current'),
        fetch('/api/users'),
        fetch('/api/notifications')
      ]);
      if (userRes.ok) {
        const u = await userRes.json();
        setCurrentUser(u);
      }
      if (usersRes.ok) {
        const ul = await usersRes.json();
        setUsers(ul);
      }
      if (notifsRes.ok) {
        const n = await notifsRes.json();
        setNotifications(n);
      }
    } catch (err) {
      console.warn("Could not connect to backend, running in fallback mode:", err);
      // Fallback local user state if server is starting
      if (!currentUser) {
        setCurrentUser({
          id: 1,
          name_ar: "سارة العتيبي",
          name_en: "Sarah Al-Otaibi",
          role: "nurse",
          employee_id: "NUR-4091",
          department: "وحدة العناية القلبية (CCU)",
          avatar: "👩‍⚕️"
        });
      }
    }
  };

  useEffect(() => {
    fetchAuthAndData();
  }, []);

  // Switch role handler
  const switchRole = async (userId) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        showToast(
          lang === 'ar' 
            ? `تم التبديل بنجاح إلى: ${data.user.name_ar} (${data.user.role === 'nurse' ? 'الممرضة المسلمة' : data.user.role === 'receiving_nurse' ? 'الممرضة المستلمة' : 'مشرف التمريض'})` 
            : `Switched role to: ${data.user.name_en}`,
          'info'
        );
        fetchAuthAndData();
      }
    } catch (err) {
      console.error("Role switch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateTo = (tab, patientId = null) => {
    if (patientId) {
      setSelectedPatientId(patientId);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const markNotificationRead = async (notifId) => {
    try {
      await fetch(`/api/notifications/${notifId}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: 1 } : n));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        dir,
        toggleLanguage,
        activeTab,
        navigateTo,
        selectedPatientId,
        setSelectedPatientId,
        currentUser,
        users,
        switchRole,
        notifications,
        markNotificationRead,
        toasts,
        showToast,
        refreshData: fetchAuthAndData,
        isLoading
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
