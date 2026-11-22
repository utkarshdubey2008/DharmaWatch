import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  MessageSquareQuote,
  FolderArchive,
  Layout,
  Image,
  Users,
  ShieldCheck,
  RefreshCw,
  History,
  BarChart3,
  Mail,
  Settings,
  ExternalLink,
  LogOut,
  Bell,
  Menu,
  X,
  ShieldAlert,
  FileCheck,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, isLoading, logout } = useAdminAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Load unread notifications
  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      try {
        const token = localStorage.getItem('dw_admin_token');
        const res = await fetch('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (e) {}
    };
    fetchNotifs();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="inline-block w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
            Loading editorial workspace...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('dw_admin_token');
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch (e) {}
  };

  interface NavItem {
    label: string;
    path: string;
    icon: any;
    exact?: boolean;
    highlight?: boolean;
    adminOnly?: boolean;
  }

  interface NavGroup {
    group: string;
    items: NavItem[];
  }

  const navGroups: NavGroup[] = [
    {
      group: 'Editorial & Newsroom',
      items: [
        { label: 'Overview', path: '/admin', icon: LayoutDashboard, exact: true },
        { label: 'All Articles', path: '/admin/articles', icon: FileText },
        { label: 'Write New Article', path: '/admin/articles/new', icon: PlusCircle, highlight: true },
        { label: 'Investigative Projects', path: '/admin/investigations', icon: ShieldAlert },
        { label: 'Legal & Field Cases', path: '/admin/case-files', icon: FolderArchive },
        { label: 'Opinions Desk', path: '/admin/opinions', icon: MessageSquareQuote },
        { label: 'Media Fact-Checks', path: '/admin/articles?category=fact-check', icon: ShieldCheck },
        { label: 'Homepage Curation', path: '/admin/homepage', icon: Layout },
      ],
    },
    {
      group: 'Assets & Authors',
      items: [
        { label: 'Media Library', path: '/admin/media', icon: Image },
        { label: 'Authors', path: '/admin/authors', icon: Users },
        { label: 'Users & Roles', path: '/admin/users', icon: ShieldCheck, adminOnly: true },
      ],
    },
    {
      group: 'Governance & Analytics',
      items: [
        { label: 'Corrections Register', path: '/admin/corrections', icon: RefreshCw },
        { label: 'Audit Log', path: '/admin/audit-log', icon: History },
        { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
        { label: 'Subscribers', path: '/admin/subscribers', icon: Mail },
        { label: 'Compliance Reports', path: '/admin/compliance', icon: FileCheck },
        { label: 'Settings', path: '/admin/settings', icon: Settings, adminOnly: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex font-sans text-zinc-900">
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-zinc-200 shrink-0">
        {/* Newsroom Brand Header */}
        <div className="p-4 border-b border-zinc-200">
          <Link to="/" className="flex items-center gap-1.5 hover:opacity-90">
            <span className="font-sans font-black text-sm text-zinc-900 uppercase tracking-tight">
              DHARMA
            </span>
            <span className="font-sans font-black text-sm text-red-600 uppercase tracking-tight">
              WATCH
            </span>
            <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-100 border border-zinc-200 px-1.5 py-0.2 rounded ml-1">
              CMS
            </span>
          </Link>
          <div className="text-[11px] text-zinc-500 font-medium mt-1">
            Editorial Command Desk
          </div>
        </div>

        {/* Current User Quick Badge */}
        <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-zinc-200 border border-zinc-300 text-zinc-800 flex items-center justify-center font-bold text-xs shrink-0">
            {user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-zinc-900 truncate leading-tight">
              {user.fullName}
            </div>
            <div className="mt-0.5">
              <span className="text-[10px] font-semibold uppercase text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded inline-block">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Nav Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-5">
          {navGroups.map((group) => {
            const filteredItems = group.items.filter((it) => !it.adminOnly || user.role === 'admin');
            if (filteredItems.length === 0) return null;

            return (
              <div key={group.group}>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-3 mb-1.5">
                  {group.group}
                </div>
                <div className="space-y-0.5">
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.exact}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded transition-colors ${
                            isActive
                              ? 'bg-red-50 text-red-700 font-semibold'
                              : item.highlight
                              ? 'text-red-600 hover:bg-red-50/70 font-semibold'
                              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer: View Live Site & Logout */}
        <div className="p-3 border-t border-zinc-200 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors font-medium"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" /> View Public Site
            </span>
            <span className="text-[10px] text-zinc-400">↗</span>
          </a>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded transition-colors text-left font-medium"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Newsroom Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Newsroom Control Header */}
        <header className="h-14 bg-white border-b border-zinc-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden p-1.5 text-zinc-600 hover:text-zinc-900"
              aria-label="Toggle navigation"
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Newsroom Greeting & Title */}
            <div>
              <div className="text-[11px] text-zinc-500 font-medium">
                Active Session • {user.fullName.split(' ')[0]}
              </div>
              <div className="font-bold text-sm text-zinc-900 hidden sm:block tracking-tight">
                DharmaWatch Editorial Desk
              </div>
            </div>
          </div>

          {/* Top Actions: Quick Links, Notifications, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Action Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/admin/articles/new"
                className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition-colors shadow-xs"
              >
                + New Article
              </Link>
              <Link
                to="/admin/articles/new?type=opinion"
                className="px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded transition-colors"
              >
                + Opinion
              </Link>
              <Link
                to="/admin/case-files/new"
                className="px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded transition-colors"
              >
                + Case File
              </Link>
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifPopover(!showNotifPopover)}
                className="relative p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
                title="Editorial Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full" />
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifPopover && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-zinc-200 shadow-xl rounded-lg z-50 p-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                    <span className="font-semibold text-zinc-900">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[11px] text-red-600 hover:underline font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-zinc-100 max-h-64 overflow-y-auto mt-2">
                    {notifications.length === 0 ? (
                      <div className="py-4 text-center text-zinc-500 text-xs">No new notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`py-2 ${n.is_read ? 'opacity-60' : 'font-medium'}`}>
                          <div className="text-zinc-900">{n.title}</div>
                          <div className="text-[11px] text-zinc-500">{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Live site link */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 rounded"
            >
              <span>Public Site</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2 text-zinc-500 hover:text-red-600 hover:bg-zinc-100 rounded transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Mobile Sidebar Overlay Drawer */}
        {isMobileOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-zinc-900/40 backdrop-blur-xs flex">
            <div className="w-64 bg-white border-r border-zinc-200 h-full flex flex-col p-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <span className="font-black text-sm tracking-tight text-red-600">
                  DHARMAWATCH CMS
                </span>
                <button onClick={() => setIsMobileOpen(false)} className="p-1 text-zinc-500 hover:text-zinc-900">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto py-4 space-y-4">
                {navGroups.map((grp) => (
                  <div key={grp.group}>
                    <div className="text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">
                      {grp.group}
                    </div>
                    {grp.items.map((it) => (
                      <Link
                        key={it.path}
                        to={it.path}
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center gap-2 py-2 px-2 text-xs font-medium text-zinc-700 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <it.icon className="w-4 h-4" />
                        <span>{it.label}</span>
                      </Link>
                    ))}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Active Child Workspace Route */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
