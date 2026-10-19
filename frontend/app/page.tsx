"use client";
<<<<<<< HEAD
import RequiredLabel from "@/components/ui/RequiredLabel";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Icon, IconName } from "@/components/ui/icons";
import { Matching } from "@/features/peer-connections/components/Matching";
import { Connections } from "@/features/peer-connections/components/Connections";
import StudyPlan from "@/features/study-plan/components/StudyPlan";
import StudyMeetings from "@/features/study-meetings/StudyMeetings";
import usePeerStudyRealtime from "@/features/study-meetings/usePeerStudyRealtime";
=======

import { FormEvent, useEffect, useRef, useState } from "react";
import { Icon, IconName } from "@/components/ui/icons";
import { Matching } from "@/features/peer-connections/components/Matching";
import { Connections } from "@/features/peer-connections/components/Connections";
import StudySessions from "@/features/study-sessions/components/ProductSessions";
import StudyPlan from "@/features/study-plan/components/StudyPlan";
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
import StudyCheckin from "@/features/checkin/components/StudyCheckin";
import InstructorModeration from "@/features/moderation/components/InstructorModeration";
import Overview from "@/features/overview/components/ProductOverview";
import Avatar from "@/components/ui/Avatar";
<<<<<<< HEAD
import NotificationBell from "@/features/notifications/components/NotificationBell";
import Toast from "@/components/ui/Toast";
import AiAnalytics from "@/features/moderation/components/AiAnalytics";
import Landing from "@/features/landing/components/Landing";
import OnboardingTour from "@/features/onboarding/OnboardingTour";
import { api, ApiError, COOKIE_SESSION_TOKEN, subscribeToUnauthorized } from "@/lib/api";
import type { Intent, ProfileMeResponse, ProfileMeUpdate } from "@/lib/types";
import type {NotificationTarget, PlanNavigationTarget} from "@/lib/home-types";
import type {PeerUnread} from "@/lib/study-meetings";

type Page = "dashboard" | "matching" | "connections" | "study-meetings" | "sessions" | "plan" | "checkin" | "profile" | "moderation" | "analytics" | "architecture";
type AuthMode = "login" | "register" | "forgot" | "reset";
const SESSION_HINT_KEY = "peerbridge_has_session";
type ProfileFormState = {
  display_name: string;
  learning_style: Record<string, string>;
  study_year: string;
  school: string;
  major: string;
  bio: string;
  subjects: string;
  learning_goals: string;
  can_help_with: string;
};

const emptyProfileForm: ProfileFormState = {
  display_name: "",
  learning_style: {},
  study_year: "",
  school: "",
  major: "",
  bio: "",
  subjects: "",
  learning_goals: "",
=======
import NotificationBell from "@/components/common/NotificationBell";
import AiAnalytics from "@/features/moderation/components/AiAnalytics";
import AdminDashboard from "@/features/admin/components/AdminDashboard";
import AdminSessions from "@/features/admin/components/AdminSessions";
import Landing from "@/components/common/Landing";
import AvailabilityPicker, { SlotKey, pickerFromWindows, windowsFromPicker } from "@/components/ui/AvailabilityPicker";
import { api, ApiError, subscribeToUnauthorized } from "@/lib/api";
import type { Intent, ProfileMeResponse, ProfileMeUpdate, Role } from "@/lib/types";

type Page = "dashboard" | "matching" | "connections" | "sessions" | "plan" | "checkin" | "profile" | "moderation" | "analytics" | "architecture" | "admin" | "admin-sessions";
type AuthMode = "login" | "register";
type ProfileFormState = {
  display_name: string;
  school: string;
  major: string;
  bio: string;
  free_days: number[];
  free_slots: SlotKey[];
  // false: giữ nguyên khung giờ đã lưu (hoặc mặc định buổi tối) khi lưu hồ sơ.
  availability_touched: boolean;
  subjects: string;
  learning_goals: string;
  needs_help_with: string;
  can_help_with: string;
};

const TOKEN_KEY = "peerbridge_token";
const emptyProfileForm: ProfileFormState = {
  display_name: "",
  school: "",
  major: "",
  bio: "",
  free_days: [],
  free_slots: [],
  availability_touched: false,
  subjects: "",
  learning_goals: "",
  needs_help_with: "",
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  can_help_with: "",
};

// Thanh điều hướng chính
<<<<<<< HEAD
const navStudent: Array<[Page, IconName, string]> = [["dashboard","home","Tổng quan"],["matching","search","Tìm bạn"],["plan","calendar","Kế hoạch"],["study-meetings","users","Học cùng"],["checkin","check","Check-in"]];
// Các trang phụ nằm trong menu tài khoản.
const menuStudent: Array<[Page, IconName, string]> = [["connections","users","Kết nối của tôi"],["profile","user","Hồ sơ của tôi"]];

export default function Home() {
  const [page, setPage] = useState<Page>("dashboard");
  const [planTarget, setPlanTarget] = useState<PlanNavigationTarget | null>(null);
  const [studyMeetingTarget, setStudyMeetingTarget] = useState<number | null>(null);
  const [studyPeerTarget, setStudyPeerTarget] = useState<number | null>(null);
  const planRequest = useRef(0);
  const unreadRequest = useRef(0);
  const restoreRequest = useRef(0);
  const checkingSession = useRef(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [toast, setToast] = useState("");
  const [tourOpen, setTourOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [resetToken, setResetToken] = useState("");
=======
const navStudent: Array<[Page, IconName, string]> = [["dashboard","home","Tổng quan"],["matching","search","Tìm bạn"],["plan","calendar","Kế hoạch"],["checkin","check","Check-in"],["sessions","message","Phiên học"]];
// Các trang phụ nằm trong menu tài khoản.
const menuStudent: Array<[Page, IconName, string]> = [["connections","users","Kết nối của tôi"],["profile","user","Hồ sơ của tôi"]];
// Admin: giám sát phiên học, log kiểm duyệt (HITL) và chi phí AI.
const navAdmin: Array<[Page, IconName, string]> = [["admin","chart","Tổng quan"],["admin-sessions","message","Phiên học"],["moderation","shield","Kiểm duyệt"]];
const menuAdmin: Array<[Page, IconName, string]> = [];
const ADMIN_PAGES: Page[] = ["admin", "admin-sessions", "moderation"];

export default function Home() {
  const [page, setPage] = useState<Page>("dashboard");
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [toast, setToast] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  const [authReady, setAuthReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [token, setToken] = useState("");
<<<<<<< HEAD
  const [peerUnread, setPeerUnread] = useState<PeerUnread>({total: 0, by_pair: {}});
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  const [profileBundle, setProfileBundle] = useState<ProfileMeResponse | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileFormState>(emptyProfileForm);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
<<<<<<< HEAD
  const nav = navStudent;
=======
  const [isAdmin, setIsAdmin] = useState(false);
  const nav = isAdmin ? navAdmin : navStudent;
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  const studentName = profileBundle?.profile.display_name || "Bạn";
  const studentInitials = initials(studentName);
  const studentMeta = profileMeta(profileBundle);

<<<<<<< HEAD
  function go(next: Page, target?: NotificationTarget) {
    if (next === "sessions") next = "plan"; // Old notification links no longer open the retired room.
    setPlanTarget(next === "plan" && target && "pair_id" in target && Number.isSafeInteger(target.pair_id) && target.pair_id > 0 ? {...target, request_id: ++planRequest.current} : null);
    setStudyMeetingTarget(next === "study-meetings" && target && "meeting_id" in target && Number.isSafeInteger(target.meeting_id) && target.meeting_id > 0 ? target.meeting_id : null);
    setStudyPeerTarget(next === "study-meetings" && target && "peer_match_id" in target && Number.isSafeInteger(target.peer_match_id) && target.peer_match_id > 0 ? target.peer_match_id : null);
    setPage(next);
    setMobileOpen(false);
    window.history.replaceState(null, "", `#${next}`);
  }
  function notify(message: string) { setToast(message); }
  const clearToast = useCallback(() => setToast(""), []);

  function openAuth(mode: AuthMode) {
    restoreRequest.current++;
    if (mode !== "reset" && resetToken) {
      const url = new URL(window.location.href);
      url.searchParams.delete("reset_token");
      setResetToken("");
      window.history.replaceState(null, "", url.pathname + url.search);
    }
    setAuthMode(mode);
    setShowAuth(true);
    setAuthError("");
    setAuthNotice("");
    window.history.replaceState(null, "", `#${mode}`);
  }

  function storeToken(nextToken: string) {
    setToken(nextToken);
  }

  async function sessionHasEnded(): Promise<boolean> {
    try {
      await api.restoreSession();
      return false;
    } catch (error) {
      return error instanceof ApiError && error.status === 401;
    }
  }

  async function confirmBrowserSession(userId: number) {
    let session;
    try {
      session = await api.restoreSession();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        throw new Error("Trình duyệt chưa lưu phiên đăng nhập. Hãy cho phép dữ liệu trang web rồi thử lại.");
      }
      throw error;
    }
    if (session.user_id !== userId) throw new Error("Phiên đăng nhập chưa được cập nhật. Hãy tải lại trang rồi thử lại.");
  }

  function signOut(message = "Bạn đã đăng xuất.") {
    setTourOpen(false);
    restoreRequest.current++;
    window.localStorage.removeItem(SESSION_HINT_KEY);
    void api.logout().catch(() => undefined);
    unreadRequest.current++;
    setToken("");
    setPeerUnread({total: 0, by_pair: {}});
    setProfileBundle(null);
=======
  function go(next: Page) {
    setPage(next);
    setMobileOpen(false);
    window.history.replaceState(null, "", next === "sessions" && activeSessionId !== null ? `#sessions/${activeSessionId}` : `#${next}`);
  }
  function selectSession(id: number | null) {
    setActiveSessionId(id);
    window.history.replaceState(null, "", id === null ? "#sessions" : `#sessions/${id}`);
  }
  function notify(message: string) { setToast(message); window.setTimeout(() => setToast(""), 2600); }

  function storeToken(nextToken: string) {
    setToken(nextToken);
    window.localStorage.setItem(TOKEN_KEY, nextToken);
  }

  function signOut(message = "Bạn đã đăng xuất.") {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setProfileBundle(null);
    setIsAdmin(false);
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    setProfileForm(emptyProfileForm);
    setProfileError("");
    setAuthMode("login");
    setAuthError("");
    setAuthNotice(message);
    setPage("dashboard");
<<<<<<< HEAD
    setPlanTarget(null);
    setShowAuth(true);
    window.history.replaceState(null, "", "#login");
    setMobileOpen(false);
  }

  async function loadProfile(activeToken: string, isCurrent: () => boolean = () => true) {
    setProfileLoading(true);
    setProfileError("");
    try {
      const data = await api.profile(activeToken);
      if (!isCurrent()) return false;
      setProfileBundle(data);
      setProfileForm(profileToForm(data));
      window.localStorage.setItem(SESSION_HINT_KEY, "1");
      setAuthError("");
      return true;
    } catch (error) {
      if (!isCurrent()) return false;
      const message = errorMessage(error);
      if (error instanceof ApiError && error.status === 401 && await sessionHasEnded()) {
        if (isCurrent()) signOut("Phiên đăng nhập không còn hiệu lực. Vui lòng đăng nhập lại.");
        return false;
      }
      if (isCurrent()) {
        setProfileError(message);
        window.setTimeout(() => { if (isCurrent()) void loadProfile(activeToken, isCurrent); }, 3000);
=======
    setActiveSessionId(null);
    window.history.replaceState(null, "", "#dashboard");
    setMobileOpen(false);
  }

  async function loadProfile(activeToken: string) {
    setProfileLoading(true);
    setProfileError("");
    try {
      const [data, me] = await Promise.all([api.profile(activeToken), api.whoami(activeToken).catch(() => null)]);
      const admin = Boolean(me?.is_admin);
      setIsAdmin(admin);
      setPage(current => admin ? (ADMIN_PAGES.includes(current) ? current : "admin") : (ADMIN_PAGES.includes(current) ? "dashboard" : current));
      setProfileBundle(data);
      setProfileForm(profileToForm(data));
      setAuthError("");
      return true;
    } catch (error) {
      const message = errorMessage(error);
      if (error instanceof ApiError && error.status === 401) {
        signOut("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else {
        setProfileError(message);
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
      }
      return false;
    } finally {
      setProfileLoading(false);
      setAuthReady(true);
    }
  }

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
<<<<<<< HEAD
    restoreRequest.current++;
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    const form = new FormData(event.currentTarget);
    setAuthLoading(true);
    setAuthError("");
    setAuthNotice("");
    try {
      const data = await api.login({
        email: stringField(form, "email"),
        password: stringField(form, "password", false),
      });
<<<<<<< HEAD
      await confirmBrowserSession(data.user_id);
      storeToken(COOKIE_SESSION_TOKEN);
      const loaded = await loadProfile(COOKIE_SESSION_TOKEN);
      if (loaded) {
        go(new URLSearchParams(window.location.search).has("invite") ? "matching" : page);
        notify("Đăng nhập thành công.");
      }
=======
      storeToken(data.access_token);
      const loaded = await loadProfile(data.access_token);
      if (loaded) notify("Đăng nhập thành công.");
    } catch (error) {
      setAuthError(errorMessage(error));
    } finally {
      setAuthLoading(false);
    }
  }

  async function demoLogin(slug: string) {
    setAuthLoading(true);
    setAuthError("");
    setAuthNotice("");
    try {
      const data = await api.demoLogin(slug);
      storeToken(data.access_token);
      if (await loadProfile(data.access_token)) notify("Đã vào tài khoản thử.");
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    } catch (error) {
      setAuthError(errorMessage(error));
    } finally {
      setAuthLoading(false);
    }
  }

  async function submitRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
<<<<<<< HEAD
    restoreRequest.current++;
    const form = new FormData(event.currentTarget);
    if (stringField(form, "password", false) !== stringField(form, "confirm_password", false)) {
      setAuthError("Mật khẩu xác nhận chưa trùng khớp.");
      return;
    }
=======
    const form = new FormData(event.currentTarget);
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    setAuthLoading(true);
    setAuthError("");
    setAuthNotice("");
    try {
      const data = await api.register({
        email: stringField(form, "email"),
        password: stringField(form, "password", false),
<<<<<<< HEAD
        display_name: stringField(form, "profile_display_name"),
        intent: "conversation",
      });
      await confirmBrowserSession(data.user_id);
      storeToken(COOKIE_SESSION_TOKEN);
      const loaded = await loadProfile(COOKIE_SESSION_TOKEN);
      if (loaded) {
        if (new URLSearchParams(window.location.search).has("invite")) {
          go("matching");
          notify("Bạn có thể xem lời mời và gửi yêu cầu kết nối.");
        } else {
          go("profile");
          setTourOpen(true);
          notify("Chọn mục tiêu và giờ rảnh để tìm người đồng hành nhé.");
        }
=======
        display_name: stringField(form, "display_name"),
        age: numberField(form, "age"),
        city: stringField(form, "city"),
        intent: "conversation",
      });
      storeToken(data.access_token);
      const loaded = await loadProfile(data.access_token);
      if (loaded) {
        go("profile");
        notify("Chọn mục tiêu và giờ rảnh để tìm người đồng hành nhé.");
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
      }
    } catch (error) {
      setAuthError(errorMessage(error));
    } finally {
      setAuthLoading(false);
    }
  }

<<<<<<< HEAD
  async function submitForgot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setAuthLoading(true);
    setAuthError("");
    setAuthNotice("");
    try {
      const result = await api.requestPasswordReset(stringField(form, "email"));
      setAuthNotice(result.message);
    } catch (error) { setAuthError(errorMessage(error)); }
    finally { setAuthLoading(false); }
  }

  async function submitReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = stringField(form, "new_password", false);
    if (password !== stringField(form, "confirm_password", false)) {
      setAuthError("Mật khẩu xác nhận chưa trùng khớp.");
      return;
    }
    setAuthLoading(true);
    setAuthError("");
    try {
      await api.confirmPasswordReset(resetToken, password);
      window.localStorage.removeItem(SESSION_HINT_KEY);
      setToken("");
      setProfileBundle(null);
      setResetToken("");
      const url = new URL(window.location.href);
      url.searchParams.delete("reset_token");
      window.history.replaceState(null, "", url.pathname + url.search + "#login");
      setAuthMode("login");
      setShowAuth(true);
      setAuthNotice("Đã đổi mật khẩu. Hãy đăng nhập lại.");
    } catch (error) { setAuthError(errorMessage(error)); }
    finally { setAuthLoading(false); }
  }

=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setProfileSaving(true);
    setProfileError("");
    try {
<<<<<<< HEAD
      if (!parseLearningGoal(profileForm.learning_goals)) throw new Error("Nhập mục tiêu theo mẫu: Muốn học SQL trong 4 tuần.");
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
      const payload = buildProfilePayload(profileForm, profileBundle);
      const updated = await api.updateProfile(token, payload);
      setProfileBundle(updated);
      setProfileForm(profileToForm(updated));
<<<<<<< HEAD
      notify("Đã lưu hồ sơ và mục tiêu. Sẵn sàng tìm bạn đồng hành!");
=======
      notify("Đã lưu mục tiêu và giờ rảnh. Sẵn sàng tìm bạn đồng hành!");
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
      go("matching");
    } catch (error) {
      const message = errorMessage(error);
      setProfileError(message);
<<<<<<< HEAD
      if (error instanceof ApiError && error.status === 401 && await sessionHasEnded()) signOut("Phiên đăng nhập không còn hiệu lực. Vui lòng đăng nhập lại.");
=======
      if (error instanceof ApiError && error.status === 401) signOut("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    } finally {
      setProfileSaving(false);
    }
  }

  useEffect(() => {
    const restoreNavigation = () => {
<<<<<<< HEAD
      const linkToken = new URLSearchParams(window.location.search).get("reset_token");
      if (linkToken) {
        setResetToken(linkToken);
        setAuthMode("reset");
        setShowAuth(true);
        return;
      }
      if (new URLSearchParams(window.location.search).has("invite")) {
        setPage("matching");
        setShowAuth(true);
        return;
      }
      const savedPage = window.location.hash.slice(1);
      if (savedPage === "login" || savedPage === "register") {
        setAuthMode(savedPage);
        setShowAuth(true);
        return;
      }
      if (savedPage === "profile" || savedPage === "matching" || savedPage === "connections" || savedPage === "plan" || savedPage === "checkin" || savedPage === "study-meetings") setPage(savedPage);
      const sessionRoute = /^sessions(?:\/([1-9]\d*))?$/.exec(savedPage);
      if (sessionRoute) {
        setPage("plan");
        window.history.replaceState(null, "", "#plan");
=======
      const savedPage = window.location.hash.slice(1);
      if (savedPage === "profile" || savedPage === "matching" || savedPage === "connections" || savedPage === "plan" || savedPage === "checkin"
        || savedPage === "admin" || savedPage === "admin-sessions" || savedPage === "moderation") setPage(savedPage);
      const sessionRoute = /^sessions(?:\/([1-9]\d*))?$/.exec(savedPage);
      if (sessionRoute) {
        setPage("sessions");
        const id = sessionRoute[1] ? Number(sessionRoute[1]) : null;
        setActiveSessionId(id !== null && Number.isSafeInteger(id) ? id : null);
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
      }
    };
    restoreNavigation();
    window.addEventListener("hashchange", restoreNavigation);
    window.addEventListener("popstate", restoreNavigation);
<<<<<<< HEAD
    const savedToken = window.localStorage.getItem("peerbridge_token");
    if (!savedToken && !window.localStorage.getItem(SESSION_HINT_KEY)) setAuthReady(true);
    const requestId = ++restoreRequest.current;
    let retryTimer: number | undefined;
    const restore = async () => {
      try {
        if (savedToken) {
          await api.upgradeSession(savedToken);
          window.localStorage.removeItem("peerbridge_token");
        } else {
          await api.restoreSession();
        }
        if (requestId !== restoreRequest.current) return;
        setToken(COOKIE_SESSION_TOKEN);
        const loaded = await loadProfile(COOKIE_SESSION_TOKEN, () => requestId === restoreRequest.current);
        if (loaded && (window.location.hash === "#login" || window.location.hash === "#register")) go(new URLSearchParams(window.location.search).has("invite") ? "matching" : "dashboard");
      } catch (error) {
        if (requestId !== restoreRequest.current) return;
        if (!(error instanceof ApiError && error.status === 401) && (savedToken || window.localStorage.getItem(SESSION_HINT_KEY))) {
          setAuthReady(true);
          retryTimer = window.setTimeout(() => { void restore(); }, 3000);
          return;
        }
        window.localStorage.removeItem("peerbridge_token");
        if (error instanceof ApiError && error.status === 401) window.localStorage.removeItem(SESSION_HINT_KEY);
        if (window.location.hash && window.location.hash !== "#login" && window.location.hash !== "#register") openAuth("login");
        setAuthReady(true);
      }
    };
    void restore();
    return () => {
      restoreRequest.current++;
      if (retryTimer) window.clearTimeout(retryTimer);
=======
    const savedToken = window.localStorage.getItem(TOKEN_KEY);
    if (!savedToken) {
      setAuthReady(true);
    } else {
      setToken(savedToken);
      void loadProfile(savedToken);
    }
    return () => {
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
      window.removeEventListener("hashchange", restoreNavigation);
      window.removeEventListener("popstate", restoreNavigation);
    };
  }, []);

  useEffect(() => {
    if (!token) return;
    return subscribeToUnauthorized((expiredToken) => {
<<<<<<< HEAD
      if (expiredToken !== token || checkingSession.current) return;
      checkingSession.current = true;
      const requestId = restoreRequest.current;
      void sessionHasEnded().then(ended => {
        if (ended && requestId === restoreRequest.current) signOut("Phiên đăng nhập không còn hiệu lực. Vui lòng đăng nhập lại.");
      }).finally(() => { checkingSession.current = false; });
    });
  }, [token]);

  const refreshPeerUnread = useCallback(async () => {
    if (!token) return;
    const requestId = ++unreadRequest.current;
    try {
      const unread = await api.peerStudyUnread(token);
      if (requestId === unreadRequest.current) setPeerUnread(unread);
    }
    catch { /* Số tin chưa đọc sẽ được tải lại ở lần cập nhật tiếp theo. */ }
  }, [token]);
  const peerRealtime = usePeerStudyRealtime(token, refreshPeerUnread);

  useEffect(() => {
    if (!token) return;
    void refreshPeerUnread();
    const interval = window.setInterval(() => void refreshPeerUnread(), peerRealtime.connected ? 30000 : 5000);
    return () => window.clearInterval(interval);
  }, [token, refreshPeerUnread, peerRealtime.connected]);

=======
      if (expiredToken === token && window.localStorage.getItem(TOKEN_KEY) === expiredToken) {
        signOut("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }
    });
  }, [token]);

>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  useEffect(() => {
    // Cài như app (PWA): đăng ký service worker khi trình duyệt hỗ trợ.
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => { /* không bắt buộc */ });
  }, []);

  if (!authReady) {
    return <div className="splash" aria-busy="true"><span className="brand-mark"><span>P</span><span>B</span></span><b>PeerBridge</b></div>;
  }

<<<<<<< HEAD
  if (!token || !profileBundle || resetToken) {
    if (!showAuth && !authNotice && !authError) {
      return <Landing onStart={() => openAuth("register")} onLogin={() => openAuth("login")} />;
    }
    return <AuthScreen mode={authMode} setMode={openAuth} loading={authLoading} error={authError} notice={authNotice} onLogin={submitLogin} onRegister={submitRegister} onForgot={submitForgot} onReset={submitReset}
      onBack={() => { setShowAuth(false); setAuthError(""); setAuthNotice(""); window.history.replaceState(null, "", window.location.pathname + window.location.search); }} />;
  }

  const home: Page = "dashboard";
=======
  if (token && !profileBundle) {
    return <main className="auth-screen"><section className="panel" role="alert">
      <h1>Chưa tải được hồ sơ</h1><p>{profileError || "Đang kết nối lại với máy chủ…"}</p>
      <button className="primary" disabled={profileLoading} onClick={() => void loadProfile(token)}>{profileLoading ? "Đang tải…" : "Thử tải lại hồ sơ"}</button>
      <button className="secondary" disabled={profileLoading} onClick={() => signOut()}>Đăng xuất</button>
    </section></main>;
  }

  if (!token || !profileBundle) {
    if (!showAuth && !authNotice && !authError) {
      return <Landing onStart={() => { setAuthMode("register"); setShowAuth(true); }} onLogin={() => { setAuthMode("login"); setShowAuth(true); }} />;
    }
    return <AuthScreen mode={authMode} setMode={setAuthMode} loading={authLoading} error={authError} notice={authNotice} onLogin={submitLogin} onRegister={submitRegister} onDemo={demoLogin}
      onBack={() => { setShowAuth(false); setAuthError(""); setAuthNotice(""); }} />;
  }

  const home: Page = isAdmin ? "admin" : "dashboard";
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  const avatarText = studentInitials;
  return <div className="app">
    <header className="appbar">
      <button className="brand" onClick={() => go(home)} aria-label="PeerBridge, về trang chính">
        <span className="brand-mark"><span>P</span><span>B</span></span><span>PeerBridge</span>
      </button>
      <nav className="appnav" aria-label="Điều hướng chính">
<<<<<<< HEAD
        {nav.map(([id, icon, label]) => <button key={id} className={page === id ? "active" : ""} aria-current={page === id ? "page" : undefined} onClick={() => go(id)}><Icon name={icon}/><span>{label}</span>{id === "study-meetings" && peerUnread.total > 0 && <span className="peer-unread-badge" aria-label={`${peerUnread.total} tin nhắn chưa đọc`}>{peerUnread.total > 99 ? "99+" : peerUnread.total}</span>}</button>)}
      </nav>
      <div className="appbar-actions">
        <NotificationBell token={token} go={go} />
        <AccountMenu avatarUrl={profileBundle.profile.avatar_url} avatarSeed={profileBundle.profile.user_id} name={studentName} meta={studentMeta} initials={avatarText}
          items={menuStudent} active={page} onGo={go} onSignOut={() => signOut()} />
      </div>
    </header>
    <main id="main" className={page === "study-meetings" ? "study-meetings-main" : undefined}>
      {page === "dashboard" && <Overview key={token} token={token} go={go} />}
      {page === "matching" && <Matching key={token} token={token} notify={notify} onConnections={() => go("connections")} />}
      {page === "connections" && <Connections key={token} token={token} userId={profileBundle.profile.user_id} notify={notify} onMatching={() => go("matching")} onPlan={() => go("plan")} />}
      {page === "plan" && <StudyPlan key={token} token={token} userId={profileBundle.profile.user_id} onConnections={() => go("connections")} onCoach={() => go("study-meetings")} navigationTarget={planTarget} onOpenMeeting={target => {go("study-meetings");setStudyMeetingTarget(target.meeting_id ?? null);}} />}
      {page === "study-meetings" && <StudyMeetings key={token} token={token} userId={profileBundle.profile.user_id} initialMeetingId={studyMeetingTarget} initialPeerId={studyPeerTarget} unread={peerUnread} onUnreadChange={refreshPeerUnread} realtimeConnected={peerRealtime.connected} realtimeMessage={peerRealtime.lastMessage} onCheckin={() => go("checkin")} />}
      {page === "checkin" && <StudyCheckin key={token} token={token} onConnections={() => go("connections")} onPlan={() => go("plan")} />}
      {page === "profile" && <Profile token={token} onAvatarUpdated={url => setProfileBundle({...profileBundle, profile: {...profileBundle.profile, avatar_url: url}})} bundle={profileBundle} form={profileForm} setForm={setProfileForm} loading={profileLoading} saving={profileSaving} error={profileError} onSubmit={submitProfile} />}
    </main>
    <nav className="tabbar" aria-label="Điều hướng nhanh">
      {nav.map(([id, icon, label]) => <button key={id} className={page === id ? "active" : ""} aria-current={page === id ? "page" : undefined} onClick={() => go(id)}><Icon name={icon}/><span>{label}</span>{id === "study-meetings" && peerUnread.total > 0 && <span className="peer-unread-badge" aria-label={`${peerUnread.total} tin nhắn chưa đọc`}>{peerUnread.total > 99 ? "99+" : peerUnread.total}</span>}</button>)}
    </nav>
    {!tourOpen && <button type="button" className="tour-replay" onClick={() => setTourOpen(true)}>🦉 Xem lại hướng dẫn</button>}
    {tourOpen && <OnboardingTour onClose={() => setTourOpen(false)}/>}
    <Toast message={toast} onClose={clearToast}/>
  </div>;
}

function AccountMenu({ avatarUrl, avatarSeed, name, meta, initials, items, active, onGo, onSignOut }: {
  avatarUrl?: string; avatarSeed: number; name: string; meta: string; initials: string; items: Array<[Page, IconName, string]>; active: Page;
=======
        {nav.map(([id, icon, label]) => <button key={id} className={page === id ? "active" : ""} aria-current={page === id ? "page" : undefined} onClick={() => go(id)}><Icon name={icon}/><span>{label}</span></button>)}
      </nav>
      <div className="appbar-actions">
        <NotificationBell token={token} go={go} />
        <AccountMenu avatarSeed={profileBundle.profile.user_id} name={studentName} meta={isAdmin ? "Admin" : studentMeta} initials={avatarText}
          items={isAdmin ? menuAdmin : menuStudent} active={page} onGo={go} onSignOut={() => signOut()} />
      </div>
    </header>
    <main id="main">
      {isAdmin ? <>
        {page === "admin" && <AdminDashboard key={token} token={token} onSessions={() => go("admin-sessions")} onModeration={() => go("moderation")} />}
        {page === "admin-sessions" && <AdminSessions key={token} token={token} onModeration={() => go("moderation")} />}
        {page === "moderation" && <InstructorModeration key={token} token={token} />}
      </> : <>
      {page === "dashboard" && <Overview key={token} token={token} go={go} />}
      {page === "matching" && <Matching key={token} token={token} notify={notify} onConnections={() => go("connections")} />}
      {page === "connections" && <Connections key={token} token={token} userId={profileBundle.profile.user_id} notify={notify} onMatching={() => go("matching")} onPlan={() => go("plan")} onSessions={() => go("sessions")} />}
      {page === "plan" && <StudyPlan key={token} token={token} userId={profileBundle.profile.user_id} onConnections={() => go("connections")} />}
      {page === "checkin" && <StudyCheckin key={token} token={token} onConnections={() => go("connections")} onPlan={() => go("plan")} />}
      {page === "sessions" && <StudySessions key={`${token}:${profileBundle.profile.user_id}`} token={token} userId={profileBundle.profile.user_id} sessionId={activeSessionId} onSessionChange={selectSession} onConnections={() => go("connections")} onCheckin={() => go("checkin")} />}
      {page === "profile" && <Profile bundle={profileBundle} form={profileForm} setForm={setProfileForm} loading={profileLoading} saving={profileSaving} error={profileError} onSubmit={submitProfile} />}
      </>}
    </main>
    <nav className="tabbar" aria-label="Điều hướng nhanh">
      {nav.map(([id, icon, label]) => <button key={id} className={page === id ? "active" : ""} aria-current={page === id ? "page" : undefined} onClick={() => go(id)}><Icon name={icon}/><span>{label}</span></button>)}
    </nav>
    <div className={`toast ${toast ? "show" : ""}`} role="status"><Icon name="check" />{toast}</div>
  </div>;
}

function AccountMenu({ avatarSeed, name, meta, initials, items, active, onGo, onSignOut }: {
  avatarSeed: number; name: string; meta: string; initials: string; items: Array<[Page, IconName, string]>; active: Page;
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  onGo: (p: Page) => void; onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const close = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);
  return <div className="account" ref={box}>
<<<<<<< HEAD
    <button className="account-button" aria-label={`Tài khoản: ${name}`} aria-expanded={open} onClick={() => setOpen(o => !o)}><Avatar seed={avatarSeed} src={avatarUrl}/></button>
    {open && <div className="account-menu" role="menu">
      <div className="account-head"><Avatar seed={avatarSeed} src={avatarUrl}/><div><b>{name}</b><small>{meta}</small></div></div>
=======
    <button className="account-button" aria-label={`Tài khoản: ${name}`} aria-expanded={open} onClick={() => setOpen(o => !o)}><Avatar seed={avatarSeed}/></button>
    {open && <div className="account-menu" role="menu">
      <div className="account-head"><Avatar seed={avatarSeed}/><div><b>{name}</b><small>{meta}</small></div></div>
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
      {items.map(([id, icon, label]) => <button key={id} role="menuitem" className={active === id ? "active" : ""} onClick={() => { setOpen(false); onGo(id); }}><Icon name={icon}/>{label}</button>)}
      <button role="menuitem" className="signout" onClick={() => { setOpen(false); onSignOut(); }}><Icon name="arrow"/>Đăng xuất</button>
    </div>}
  </div>;
}

function AuthScreen({
  mode,
  setMode,
  loading,
  error,
  notice,
  onLogin,
  onRegister,
<<<<<<< HEAD
  onForgot,
  onReset,
  onBack,
=======
  onBack,
  onDemo,
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
}: {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  loading: boolean;
  error: string;
  notice: string;
  onLogin: (event: FormEvent<HTMLFormElement>) => void;
  onRegister: (event: FormEvent<HTMLFormElement>) => void;
<<<<<<< HEAD
  onForgot: (event: FormEvent<HTMLFormElement>) => void;
  onReset: (event: FormEvent<HTMLFormElement>) => void;
  onBack?: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [confirmValue, setConfirmValue] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [nameEditable, setNameEditable] = useState(false);
  const confirmRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    confirmRef.current?.setCustomValidity(confirmValue && confirmValue !== passwordValue ? "Mật khẩu xác nhận chưa trùng khớp." : "");
  }, [passwordValue, confirmValue]);
  useEffect(() => { setPasswordValue(""); setConfirmValue(""); setDisplayName(""); setNameEditable(false); setShowPassword(false); }, [mode]);
  const isLogin = mode === "login";
  const isRegister = mode === "register";
  const passwordMismatch = Boolean(confirmValue && confirmValue !== passwordValue);
=======
  onBack?: () => void;
  onDemo?: (slug: string) => void;
}) {
  const isLogin = mode === "login";
  const [demo, setDemo] = useState<{ slug: string; name: string }[]>([]);
  useEffect(() => {
    api.demoInfo().then(d => setDemo(d.enabled ? d.accounts : [])).catch(() => setDemo([]));
  }, []);
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  return <main className="auth-screen">
    <section className="auth-intro" aria-hidden="true">
      <span className="auth-logo"><span className="brand-mark"><span>P</span><span>B</span></span>PeerBridge</span>
      <h2>Tự học bớt cô đơn khi có một người cùng nhịp.</h2>
      <p>Ghép cặp với bạn cùng mục tiêu, lập kế hoạch tuần, chụp một tấm ảnh mỗi buổi học để bạn kia biết bạn vẫn đang cố gắng.</p>
<<<<<<< HEAD
      <div className="auth-story">
        <div className="auth-story-card auth-story-goal">
          <div className="auth-story-people"><span>🦊</span><span>🐸</span><b>Học cùng nhịp</b></div>
          <strong>IELTS Speaking <mark>trong 8 tuần</mark></strong>
          <small>Mỗi người một mục tiêu, cùng giữ nhịp học.</small>
        </div>
        <div className="auth-story-card auth-story-checkin">
          <span className="auth-story-tag">📸 Check-in hôm nay</span>
          <strong>Bảo Trâm đã bắt đầu học</strong>
          <small>Luyện nghe · 20 phút</small>
        </div>
        <div className="auth-story-card auth-story-plan">
          <span className="auth-story-tag">Kế hoạch tuần</span>
          <strong>2/3 việc đã xong</strong>
          <span className="auth-story-progress"><i /></span>
        </div>
      </div>
    </section>
    <section className="auth-card panel animate-in">
      {onBack && (isLogin || isRegister) && <button type="button" className="auth-back" onClick={onBack}><Icon name="arrow" />Về trang giới thiệu</button>}
      <div className="auth-brand">
        <span className="brand-mark"><span>P</span><span>B</span></span>
        <div><b>{isLogin ? "Chào mừng bạn quay lại" : isRegister ? "Tạo tài khoản" : mode === "forgot" ? "Quên mật khẩu" : "Đặt mật khẩu mới"}</b><small>{isLogin ? "Đăng nhập để tiếp tục buổi học." : isRegister ? "Mất chưa tới một phút." : mode === "forgot" ? "Nhận liên kết đặt lại qua email." : "Liên kết có hiệu lực trong 30 phút."}</small></div>
      </div>
      {(isLogin || isRegister) ? <div className="auth-tabs" aria-label="Chọn hành động">
        <button type="button" className={isLogin ? "active" : ""} onClick={() => setMode("login")}>Đăng nhập</button>
        <button type="button" className={isRegister ? "active" : ""} onClick={() => setMode("register")}>Đăng ký</button>
      </div> : <button type="button" className="auth-return" onClick={() => setMode("login")}>← Về đăng nhập</button>}
=======
      <ul className="auth-points">
        <li><Icon name="users" />Ghép cặp theo mục tiêu và giờ rảnh</li>
        <li><Icon name="calendar" />Kế hoạch tuần vừa sức cho từng người</li>
        <li><Icon name="check" />Check-in bằng ảnh, AI ghi nhận giúp</li>
      </ul>
    </section>
    <section className="auth-card panel animate-in">
      {onBack && <button type="button" className="auth-back" onClick={onBack}><Icon name="arrow" />Về trang giới thiệu</button>}
      <div className="auth-brand">
        <span className="brand-mark"><span>P</span><span>B</span></span>
        <div><b>{isLogin ? "Chào mừng bạn quay lại" : "Tạo tài khoản"}</b><small>{isLogin ? "Đăng nhập để tiếp tục buổi học." : "Mất chưa tới một phút."}</small></div>
      </div>
      <div className="auth-tabs" aria-label="Chọn hành động">
        <button type="button" className={isLogin ? "active" : ""} onClick={() => setMode("login")}>Đăng nhập</button>
        <button type="button" className={!isLogin ? "active" : ""} onClick={() => setMode("register")}>Đăng ký</button>
      </div>
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
      {notice && <p className="form-success"><Icon name="check" />{notice}</p>}
      {error && <p className="form-error">{error}</p>}
      {isLogin ? (
        <form className="auth-form" onSubmit={onLogin}>
<<<<<<< HEAD
          <label><RequiredLabel>Email</RequiredLabel><input name="email" type="email" placeholder="ban@example.com" autoComplete="section-login username" required /></label>
          <label>
            <RequiredLabel>Mật khẩu</RequiredLabel>
            <div style={{ position: "relative", marginTop: "6px" }}>
              <input name="password" type={showPassword ? "text" : "password"} placeholder="Mật khẩu" autoComplete="section-login current-password" required style={{ paddingRight: "42px", marginTop: 0 }} />
              <button type="button" onClick={() => setShowPassword(p => !p)} aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#6f807c", padding: "4px" }}>
                <Icon name={showPassword ? "eye-off" : "eye"} style={{ width: "18px", height: "18px" }} />
              </button>
            </div>
          </label>
          <button className="primary wide" disabled={loading}>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</button>
        </form>
      ) : isRegister ? (
        <form className="auth-form" onSubmit={onRegister}>
          <label><RequiredLabel>Tên hiển thị</RequiredLabel><input name="profile_display_name" type="text" placeholder="Nguyễn Linh Anh" maxLength={60} autoComplete="off" data-lpignore="true" data-1p-ignore="true" readOnly={!nameEditable} onFocus={() => setNameEditable(true)} value={displayName} onChange={event => setDisplayName(event.target.value)} required /></label>
          <label><RequiredLabel>Email</RequiredLabel><input name="email" type="email" placeholder="ban@example.com" autoComplete="section-register username" required /></label>
          <label>
            <RequiredLabel>Mật khẩu</RequiredLabel>
            <div style={{ position: "relative", marginTop: "6px" }}>
              <input name="password" type={showPassword ? "text" : "password"} minLength={8} maxLength={128} placeholder="Tối thiểu 8 ký tự" autoComplete="section-register new-password" required style={{ paddingRight: "42px", marginTop: 0 }} value={passwordValue} onChange={event => setPasswordValue(event.target.value)} />
              <button type="button" onClick={() => setShowPassword(p => !p)} aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#6f807c", padding: "4px" }}>
                <Icon name={showPassword ? "eye-off" : "eye"} style={{ width: "18px", height: "18px" }} />
              </button>
            </div>
          </label>
          <label><RequiredLabel>Xác nhận mật khẩu</RequiredLabel><input ref={confirmRef} name="confirm_password" type={showPassword ? "text" : "password"} minLength={8} maxLength={128} placeholder="Nhập lại mật khẩu" autoComplete="section-register new-password" required value={confirmValue} onChange={event => setConfirmValue(event.target.value)} aria-invalid={passwordMismatch}/></label>
          {passwordMismatch && <small className="auth-match-error" role="alert">Mật khẩu xác nhận chưa trùng khớp.</small>}
          <button className="primary wide" disabled={loading}>{loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}</button>
        </form>
      ) : mode === "forgot" ? (
        <form className="auth-form" onSubmit={onForgot}>
          <label><RequiredLabel>Email đã đăng ký</RequiredLabel><input name="email" type="email" placeholder="ban@example.com" autoComplete="section-recovery username" required /></label>
          <button className="primary wide" disabled={loading}>{loading ? "Đang gửi..." : "Gửi liên kết đặt lại"}</button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={onReset}>
          <label><RequiredLabel>Mật khẩu mới</RequiredLabel><input name="new_password" type={showPassword ? "text" : "password"} minLength={8} maxLength={128} autoComplete="section-reset new-password" required value={passwordValue} onChange={event => setPasswordValue(event.target.value)}/></label>
          <label><RequiredLabel>Xác nhận mật khẩu mới</RequiredLabel><input ref={confirmRef} name="confirm_password" type={showPassword ? "text" : "password"} minLength={8} maxLength={128} autoComplete="section-reset new-password" required value={confirmValue} onChange={event => setConfirmValue(event.target.value)} aria-invalid={passwordMismatch}/></label>
          {passwordMismatch && <small className="auth-match-error" role="alert">Mật khẩu xác nhận chưa trùng khớp.</small>}
          <button className="primary wide" disabled={loading}>{loading ? "Đang lưu..." : "Đặt lại mật khẩu"}</button>
=======
          <label>Email<input name="email" type="email" placeholder="ban@example.com" autoComplete="email" required /></label>
          <label>Mật khẩu<input name="password" type="password" placeholder="Tối thiểu 8 ký tự" autoComplete="current-password" required /></label>
          <button className="primary wide" disabled={loading}>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</button>
          {onDemo && demo.length > 0 && <div className="demo-login">
            <small>Dùng thử không cần đăng ký (mở hai cửa sổ để đóng vai hai bạn học):</small>
            <div>{demo.map(a => <button key={a.slug} type="button" className="secondary" disabled={loading} onClick={() => onDemo(a.slug)}>Vào thử: {a.name.split(" (")[0]}</button>)}</div>
          </div>}
        </form>
      ) : (
        <form className="auth-form" onSubmit={onRegister}>
          <label>Tên hiển thị<input name="display_name" placeholder="Nguyễn Linh Anh" maxLength={60} required /></label>
          <label>Email<input name="email" type="email" placeholder="ban@example.com" autoComplete="email" required /></label>
          <label>Mật khẩu<input name="password" type="password" minLength={8} maxLength={128} placeholder="Tối thiểu 8 ký tự" autoComplete="new-password" required /></label>
          <div className="form-row">
            <label>Tuổi<input name="age" type="number" min={18} max={100} defaultValue={20} required /></label>
            <label>Thành phố<input name="city" defaultValue="Hà Nội" maxLength={80} required /></label>
          </div>
          <button className="primary wide" disabled={loading}>{loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}</button>
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
        </form>
      )}
    </section>
  </main>;
}

function stringField(form: FormData, name: string, trim = true) {
  const value = form.get(name);
  if (typeof value !== "string") return "";
  return trim ? value.trim() : value;
}

<<<<<<< HEAD
function errorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      return "Không kết nối được máy chủ. Hãy thử lại sau.";
    }
    return error.message;
  }
  return "Không thể kết nối máy chủ.";
}

const GOAL_PATTERN = "[Mm]uốn học[.]?\\s+.+\\s+trong\\s+[1-9][0-9]*\\s+(ngày|tuần|tháng|năm)[.]?";
function parseLearningGoal(value: string) {
  const match = value.trim().match(/^muốn học\.?\s+(.+?)\s+trong\s+([1-9]\d*)\s+(ngày|tuần|tháng|năm)\.?$/i);
  return match ? { topic: match[1].trim(), duration: Number(match[2]), unit: match[3] } : null;
}
const STYLE_OPTIONS = [
  { label: "Vai trò khi học", options: ["Thích giải thích", "Thích nghe", "Cân bằng"] },
  { label: "Nhịp học", options: ["Học dồn theo đợt", "Học đều mỗi ngày"] },
  { label: "Phong cách phản hồi", options: ["Thích được hỏi lại, tranh luận", "Thích tự làm rồi mới hỏi", "Linh hoạt"] },
  { label: "Môi trường học", options: ["Im lặng, tập trung", "Nói chuyện, trao đổi nhiều"] },
  { label: "Khi gặp khó", options: ["Tự research trước", "Hỏi ngay", "Tùy tình huống"] },
];
=======
function numberField(form: FormData, name: string) {
  const value = Number.parseInt(stringField(form, name), 10);
  return Number.isFinite(value) ? value : 18;
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Không thể kết nối máy chủ.";
}
>>>>>>> 29066618049be865e9daa585fed068c149bc780f

function splitList(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinList(items: string[]) {
  return items.join(", ");
}

function profileToForm(bundle: ProfileMeResponse): ProfileFormState {
  return {
    display_name: bundle.profile.display_name ?? "",
<<<<<<< HEAD
    learning_style: bundle.profile.learning_style ?? {},
    study_year: bundle.profile.study_year ?? "",
    school: bundle.profile.school ?? "",
    major: bundle.profile.major ?? "",
    bio: bundle.profile.bio ?? "",
    subjects: joinList(bundle.profile.subjects ?? []),
    learning_goals: joinList(bundle.profile.learning_goals ?? []),
=======
    school: bundle.profile.school ?? "",
    major: bundle.profile.major ?? "",
    bio: bundle.profile.bio ?? "",
    free_days: pickerFromWindows(bundle.availability).days,
    free_slots: pickerFromWindows(bundle.availability).slots,
    availability_touched: false,
    subjects: joinList(bundle.profile.subjects ?? []),
    learning_goals: joinList(bundle.profile.learning_goals ?? []),
    needs_help_with: joinList(bundle.needs_help_with.map((item) => item.topic)),
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    can_help_with: joinList(bundle.can_help_with.map((item) => item.topic)),
  };
}

function buildProfilePayload(form: ProfileFormState, bundle: ProfileMeResponse | null): ProfileMeUpdate {
  const existingNeeds = new Map((bundle?.needs_help_with ?? []).map((item) => [item.topic.trim().toLowerCase(), item]));
  const existingOffers = new Map((bundle?.can_help_with ?? []).map((item) => [item.topic.trim().toLowerCase(), item]));
  return {
    profile: {
      display_name: form.display_name.trim(),
      bio: form.bio.trim(),
<<<<<<< HEAD
      learning_style: form.learning_style,
      study_year: form.study_year,
      school: form.school.trim(),
      major: form.major.trim(),
      subjects: splitList(form.subjects),
      learning_goals: [form.learning_goals.trim()],
    },
    needs_help_with: splitList(parseLearningGoal(form.learning_goals)?.topic ?? "").map((topic) => {
=======
      school: form.school.trim(),
      major: form.major.trim(),
      subjects: splitList(form.subjects),
      learning_goals: splitList(form.learning_goals),
    },
    needs_help_with: splitList(form.needs_help_with).map((topic) => {
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
      const existing = existingNeeds.get(topic.toLowerCase());
      return {
        topic,
        description: existing?.description ?? "",
        current_level: existing?.current_level ?? "",
        target_outcome: existing?.target_outcome ?? "",
      };
    }),
    can_help_with: splitList(form.can_help_with).map((topic) => {
      const existing = existingOffers.get(topic.toLowerCase());
      return {
        topic,
        description: existing?.description ?? "",
        proficiency_level: existing?.proficiency_level ?? "",
        max_sessions_per_week: existing?.max_sessions_per_week ?? 3,
      };
    }),
<<<<<<< HEAD
    availability: (bundle?.availability ?? []).map(({day_of_week, start_time, end_time, timezone}) => ({day_of_week, start_time, end_time, timezone})),
=======
    availability: (!form.availability_touched && bundle?.availability.length
      ? bundle.availability.map(w => ({ day_of_week: w.day_of_week, start_time: w.start_time.slice(0, 5), end_time: w.end_time.slice(0, 5) }))
      : windowsFromPicker(form.free_days, form.free_slots)
    ).map(w => ({ ...w, timezone: "Asia/Ho_Chi_Minh" })),
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  };
}

function profileMeta(bundle: ProfileMeResponse | null) {
  if (!bundle) return "Sinh viên";
  const details = [bundle.profile.major, bundle.profile.school].filter(Boolean);
  return details.join(" · ") || "Sinh viên";
}

function profileCompletion(bundle: ProfileMeResponse, form: ProfileFormState) {
  const filled = [
    form.display_name,
    form.school,
    form.major,
    form.bio,
<<<<<<< HEAD
    Object.keys(form.learning_style).length === 5 ? "complete" : "",
    form.learning_goals,
    form.study_year,
=======
    form.subjects,
    form.learning_goals,
    form.needs_help_with,
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    form.can_help_with,
  ].filter((value) => value.trim()).length;
  return Math.round((filled / 8) * 100);
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "PB";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function PageTitle({ eyebrow, title, text, actions }: { eyebrow: string; title: string; text: string; actions?: React.ReactNode }) {
<<<<<<< HEAD
  return <div className="page-title"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>{actions && <div className="page-actions">{actions}</div>}</div>;
}


function Profile({
  token, onAvatarUpdated,
=======
  return <div className="page-title"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{text && <p>{text}</p>}</div>{actions && <div className="page-actions">{actions}</div>}</div>;
}


function Sessions({ role, notify }: { role:Role; notify:(m:string)=>void }) {
  const [message,setMessage]=useState(""); const [messages,setMessages]=useState(["Chào Trang, mình vẫn chưa hiểu cách xoay cây AVL.","Mình thử bắt đầu từ điều kiện mất cân bằng nhé. Bạn nhớ balance factor được tính thế nào không?"]);
  function submit(e:FormEvent){e.preventDefault();if(!message.trim())return;setMessages([...messages,message]);setMessage("");notify("Tin nhắn đã gửi qua WebSocket");}
  return <div className="page session-page animate-in"><PageTitle eyebrow={role==="STUDENT"?"Study room · Đang hoạt động":"Quan sát phiên học"} title="Cây nhị phân & phép duyệt" text="CS201 · Phiên PB-1024 · 19:30–20:30" actions={<span className="room-status"><i/> {role==="STUDENT"?"Minh Trang đang trực tuyến":"Đang theo dõi realtime"}</span>} />
    <div className="study-layout"><section className="study-room panel"><div className="study-header"><div className="peer-pair"><span className="avatar">LA</span><span className="avatar teal">MT</span><div><b>Linh Anh & Minh Trang</b><small>2 người tham gia</small></div></div><span className="session-timer"><Icon name="clock"/> 00:24:18</span></div><div className="messages">{messages.map((m,i)=><div className={`message ${i%2===0?"mine":""}`} key={`${m}-${i}`}><div className="message-author">{i%2===0?"Bạn":"Minh Trang"}<span>{i===0?"19:34":"19:36"}</span></div><p>{m}</p></div>)}<div className="ai-guidance"><span><Icon name="spark"/></span><div><b>Gợi ý từ PeerGuide</b><p>Thử tính chiều cao của cây con trái và phải trước. Hiệu của hai giá trị đó nói lên điều gì về độ cân bằng?</p><small><Icon name="book"/> Dựa trên Bài giảng 06 · Cây cân bằng, trang 14</small></div></div></div><form className="composer" onSubmit={submit}><button type="button">＋</button><input value={message} onChange={e=>setMessage(e.target.value)} placeholder="Nhập tin nhắn hoặc câu hỏi của bạn..."/><button className="send-button" aria-label="Gửi"><Icon name="send"/></button></form></section>
      <aside className="session-aside"><section className="panel safety-panel"><span className="safety-mark"><Icon name="shield"/></span><h3>Không gian học an toàn</h3><p>PeerGuide giúp cuộc trao đổi tập trung vào cách tư duy, không đưa đáp án hoàn chỉnh.</p><div className="safety-status"><span><i/> AI Moderator</span><b>Đang hoạt động</b></div></section><section className="panel agenda"><h3>Mục tiêu phiên học</h3><label><input type="checkbox" defaultChecked/> Hiểu balance factor</label><label><input type="checkbox"/> Phân biệt xoay trái/phải</label><label><input type="checkbox"/> Tự giải một bài AVL</label><div className="progress"><span style={{width:"33%"}}/></div><small>1/3 mục tiêu hoàn thành</small></section></aside></div>
  </div>;
}

function Profile({
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  bundle,
  form,
  setForm,
  loading,
  saving,
  error,
  onSubmit,
}: {
<<<<<<< HEAD
  token: string;
  onAvatarUpdated: (url: string) => void;
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  bundle: ProfileMeResponse;
  form: ProfileFormState;
  setForm: (next: ProfileFormState) => void;
  loading: boolean;
  saving: boolean;
  error: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
<<<<<<< HEAD
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const avatarInput = useRef<HTMLInputElement>(null);
  async function uploadAvatar(file?: File) {
    if (!file) return;
    setAvatarBusy(true); setAvatarError("");
    try { const result = await api.uploadAvatar(token, file); onAvatarUpdated(result.avatar_url); }
    catch (error) { setAvatarError(errorMessage(error)); }
    finally { setAvatarBusy(false); if (avatarInput.current) avatarInput.current.value = ""; }
  }
=======
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  const completion = profileCompletion(bundle, form);
  const name = form.display_name || bundle.profile.display_name || "Bạn";
  const meta = profileMeta(bundle);
  const update = (field: keyof ProfileFormState, value: string) => setForm({ ...form, [field]: value });
<<<<<<< HEAD
  return <div className="page narrow animate-in"><PageTitle eyebrow="Hồ sơ học tập" title="Cho bạn học biết bạn cần gì" text="Chọn điều bạn muốn đạt được. Mình sẽ tìm một người cùng giữ nhịp."/>
    <div className="profile-grid">
      <section className="panel profile-card">
        <Avatar seed={bundle.profile.user_id} size={96} src={bundle.profile.avatar_url}/>
        <input ref={avatarInput} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={e => uploadAvatar(e.target.files?.[0])}/>
        <button type="button" className="avatar-change" disabled={avatarBusy} onClick={() => avatarInput.current?.click()}>{avatarBusy ? "Đang tải ảnh…" : "Đổi ảnh đại diện"}</button>
        <small className="avatar-help">JPG, PNG hoặc WebP</small>
        {avatarError && <p role="alert" className="form-error">{avatarError}</p>}
=======
  return <div className="page narrow animate-in"><PageTitle eyebrow="" title="Hồ sơ của tôi" text=""/>
    <div className="profile-grid">
      <section className="panel profile-card">
        <Avatar seed={bundle.profile.user_id} size={96}/>
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
        <h2>{name}</h2>
        <p>{meta}</p>
        <span className="profile-chip">Hồ sơ hoàn thiện {completion}%</span>
        <div className="profile-stats">
          <div><b>{bundle.needs_help_with.length}</b><span>Cần hỗ trợ</span></div>
          <div><b>{bundle.can_help_with.length}</b><span>Có thể hỗ trợ</span></div>
<<<<<<< HEAD
          <div><b>{form.study_year || "—"}</b><span>Năm học</span></div>
=======
          <div><b>{bundle.availability.length}</b><span>Lịch rảnh</span></div>
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
        </div>
      </section>
      <form className="panel profile-form" onSubmit={onSubmit}>
        {loading && <p className="status-line">Đang tải hồ sơ từ backend...</p>}
        {error && <p className="form-error">{error}</p>}
<<<<<<< HEAD
        <section className="profile-section" aria-labelledby="personal-heading">
          <h2 id="personal-heading">Thông tin cá nhân</h2>
          <p>Thông tin cơ bản để bạn học biết về bạn.</p>
          <div className="form-row">
            <label><RequiredLabel>Họ và tên</RequiredLabel><input value={form.display_name} onChange={e => update("display_name", e.target.value)} maxLength={80} required /></label>
            <label>Trường<input value={form.school} onChange={e => update("school", e.target.value)} maxLength={120} /></label>
          </div>
          <div className="form-row">
            <label><RequiredLabel>Năm học</RequiredLabel><select required value={form.study_year} onChange={e => update("study_year", e.target.value)}><option value="">Chọn năm học</option>{["Năm 1", "Năm 2", "Năm 3", "Năm 4", "Năm 5", "Năm 6 trở lên", "Đã tốt nghiệp"].map(year => <option key={year}>{year}</option>)}</select></label>
            <label>Chuyên ngành<input value={form.major} onChange={e => update("major", e.target.value)} maxLength={120} /></label>
          </div>
        </section>
        <section className="profile-section" aria-labelledby="learning-heading">
          <h2 id="learning-heading">Mục tiêu học tập</h2>
          <p>Mục tiêu và cách học giúp tìm người đồng hành phù hợp.</p>
          <div className="profile-field"><label><RequiredLabel>Mục tiêu học tập của tôi</RequiredLabel><input required value={form.learning_goals} maxLength={240} aria-describedby="goal-help" aria-invalid={Boolean(form.learning_goals && !parseLearningGoal(form.learning_goals))} onChange={e => { update("learning_goals", e.target.value); e.target.setCustomValidity(parseLearningGoal(e.target.value) ? "" : "Nhập theo mẫu: Muốn học SQL trong 4 tuần"); }} onInvalid={e => e.currentTarget.setCustomValidity("Nhập theo mẫu: Muốn học SQL trong 4 tuần")} placeholder="Muốn học SQL trong 4 tuần" pattern={GOAL_PATTERN} /></label>
          <small id="goal-help" className={form.learning_goals && !parseLearningGoal(form.learning_goals) ? "goal-invalid" : "profile-hint"}>{form.learning_goals && !parseLearningGoal(form.learning_goals) ? "Chưa đúng mẫu. " : ""}Mẫu: Muốn học [chủ đề cần hỗ trợ] trong [số ngày / tuần / tháng / năm]. Phần giữa “Muốn học” và “trong” được dùng làm chủ đề ghép cặp. Ví dụ: Muốn học SQL trong 4 tuần.</small></div>
          <label>Tôi có thể hỗ trợ<input value={form.can_help_with} onChange={e => update("can_help_with", e.target.value)} placeholder="Python, SQL cơ bản" /></label>
          <div className="profile-field"><label htmlFor="profile-bio">Giới thiệu</label>
            <textarea id="profile-bio" rows={3} value={form.bio} onChange={e => update("bio", e.target.value)} maxLength={800} placeholder="Chia sẻ một chút về bạn, sở thích hoặc trải nghiệm học tập…" />
          </div>
          <div className="profile-field"><h3>Phong cách học</h3><small className="profile-hint">Chọn một phương án mỗi dòng để tìm bạn hợp cách học.</small>
            <div className="style-suggestions">{STYLE_OPTIONS.map(group => <fieldset className="style-choice" key={group.label}><legend>{group.label}</legend><div>{group.options.map(option => <button type="button" key={option} aria-pressed={form.learning_style[group.label] === option} onClick={() => setForm({...form, learning_style: {...form.learning_style, [group.label]: option}})}>{option}</button>)}</div></fieldset>)}</div>
          </div>
        </section>
        <div className="form-footer"><span><Icon name="shield"/> Chỉ chia sẻ thông tin học tập cần thiết</span><button className="primary" disabled={saving}>{saving ? "Đang lưu..." : "Lưu & tìm bạn đồng hành"}</button></div>
=======
        <div className="profile-goal-first"><label>Mục tiêu học tập của tôi<input required value={form.learning_goals} onChange={e=>update("learning_goals",e.target.value)} placeholder="Học tiếng Anh giao tiếp trong 7 tuần"/></label></div>
        <label>Tôi cần hỗ trợ<input value={form.needs_help_with} onChange={(event) => update("needs_help_with", event.target.value)} placeholder="VD: RAG Pipeline, Agent và ReAct (cách nhau bằng dấu phẩy)" /></label>
        <label>Tôi có thể hỗ trợ<input value={form.can_help_with} onChange={(event) => update("can_help_with", event.target.value)} placeholder="VD: Prompt Engineering và Tool Calling, Triển khai Agent lên Cloud" /></label>
        <fieldset className="availability-picker"><legend>🗓️ Bạn thường rảnh khi nào?</legend><AvailabilityPicker days={form.free_days} slots={form.free_slots} onChange={(days, slots) => setForm({ ...form, free_days: days, free_slots: slots, availability_touched: true })}/></fieldset>
        <details className="profile-extra" open={!form.display_name}><summary>Thông tin cá nhân</summary>
        <div className="form-row">
          <label>Họ và tên<input value={form.display_name} onChange={(event) => update("display_name", event.target.value)} maxLength={80} required /></label>
          <label>Trường<input value={form.school} onChange={(event) => update("school", event.target.value)} maxLength={120} /></label>
        </div>
        <div className="form-row">
          <label>Chuyên ngành<input value={form.major} onChange={(event) => update("major", event.target.value)} maxLength={120} /></label>
          <label>Môn học quan tâm<input value={form.subjects} onChange={(event) => update("subjects", event.target.value)} placeholder="LLM, Agent, RAG" /></label>
        </div>
        <label>Giới thiệu<textarea value={form.bio} onChange={(event) => update("bio", event.target.value)} maxLength={800} /></label>
        </details>
        <div className="form-footer"><span/><button className="primary" disabled={saving}>{saving ? "Đang lưu..." : "Lưu"}</button></div>
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
      </form>
    </div>
  </div>;
}

<<<<<<< HEAD
function Architecture(){return <div className="page animate-in"><PageTitle eyebrow="" title="Kiến trúc PeerBridge" text="Giao diện, logic nghiệp vụ, AI và dữ liệu được tách lớp rõ ràng." actions={<a className="outline button-link" href="/peerbridge-architecture.svg" download>Tải sơ đồ</a>}/><section className="panel architecture-panel"><img src="/peerbridge-architecture.svg" alt="Sơ đồ kiến trúc PeerBridge"/></section><div className="principles"><div><b>01</b><h3>Giao diện tách biệt</h3><p>Next.js chỉ gọi backend qua REST và WebSocket, cài được như app trên điện thoại.</p></div><div><b>02</b><h3>Logic ở backend</h3><p>FastAPI giữ phân quyền, ghép cặp, kế hoạch, check-in và thông báo.</p></div><div><b>03</b><h3>AI có rào chắn</h3><p>LangGraph điều phối; AI Vision chỉ nhận diện nội dung học trong kế hoạch, có trần chi phí mỗi ngày.</p></div><div><b>04</b><h3>Dữ liệu không mất</h3><p>SQLite được sao lưu liên tục (Litestream) và tự khôi phục khi server khởi động lại.</p></div></div></div>}
=======
function Architecture(){return <div className="page animate-in"><PageTitle eyebrow="" title="Kiến trúc PeerBridge" text="Giao diện, logic nghiệp vụ, AI và dữ liệu được tách lớp rõ ràng." actions={<a className="outline button-link" href="/peerbridge-architecture.svg" download>Tải sơ đồ</a>}/><section className="panel architecture-panel"><img src="/peerbridge-architecture.svg" alt="Sơ đồ kiến trúc PeerBridge"/></section><div className="principles"><div><b>01</b><h3>Giao diện tách biệt</h3><p>Next.js chỉ gọi backend qua REST và WebSocket, cài được như app trên điện thoại.</p></div><div><b>02</b><h3>Logic ở backend</h3><p>FastAPI giữ phân quyền, ghép cặp, kế hoạch, check-in và thông báo.</p></div><div><b>03</b><h3>AI có rào chắn</h3><p>LangGraph điều phối; AI Vision chỉ chọn concept trong kế hoạch, có trần chi phí mỗi ngày.</p></div><div><b>04</b><h3>Dữ liệu không mất</h3><p>SQLite được sao lưu liên tục (Litestream) và tự khôi phục khi server khởi động lại.</p></div></div></div>}
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
