"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ContactRound,
  ExternalLink,
  FolderKanban,
  GraduationCap,
  Home,
  LogOut,
  MessageSquare,
  Monitor,
  Moon,
  Pencil,
  Plus,
  Save,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  Tablet,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

const SUPABASE_URL = "https://yoqrjrqhnghdentkqhxs.supabase.co";
const SUPABASE_KEY = "sb_publishable__PJ-SXvQ8Jz2SUF3rqdRTA_hd-DREP-";
const SESSION_KEY = "portfolio_admin_session";
const THEME_KEY = "portfolio_theme";
const VISIT_SESSION_KEY = "portfolio_visit_recorded_v1";
const FEEDBACK_SESSION_KEY = "portfolio_feedback_sent_v1";
const VISIT_MARKER = "__portfolio_visit_v1__";
const SKILL_TYPE = "Skill";
const SKILL_META_TYPE = "SkillMeta";
const SKILL_META_TITLE = "__skills_initialized__";

type Theme = "dark" | "light";
type MobileView = "home" | "works" | "skills" | "feedback" | "contact";

type Activity = {
  id: number;
  title: string;
  type: string;
  description: string;
  tools: string;
  learnings: string;
  evidenceUrl: string;
  thumbnailUrl: string;
  completedOn: string;
  createdAt: string;
};

type ActivityRow = {
  id: number;
  title: string;
  type: string;
  description: string | null;
  tools: string | null;
  learnings: string | null;
  evidence_url: string | null;
  thumbnail_url: string | null;
  completed_on: string;
  created_at: string;
};

type ActivityForm = Omit<Activity, "id" | "createdAt">;

type Session = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user?: { email?: string };
};

type ActivityComment = {
  id: number;
  activity_id: number;
  visitor_name: string;
  comment: string;
  created_at: string;
};

type SiteFeedback = {
  id: number;
  visitor_name: string;
  feedback: string;
  created_at: string;
};

type PortfolioSkill = {
  id: number;
  name: string;
  level: string;
  createdAt: string;
  isDefault?: boolean;
};

type SkillForm = {
  name: string;
  level: string;
};

type VisitDetails = {
  sessionId: string;
  device: string;
  browser: string;
  viewport: string;
  source: string;
  path: string;
};

type VisitLog = SiteFeedback & {
  details: VisitDetails;
};

const DEFAULT_SKILLS: PortfolioSkill[] = [
  { id: -1, name: "HTML", level: "Learning", createdAt: "", isDefault: true },
  { id: -2, name: "CSS", level: "Learning", createdAt: "", isDefault: true },
  { id: -3, name: "C++", level: "Familiar", createdAt: "", isDefault: true },
  { id: -4, name: "Figma", level: "Familiar", createdAt: "", isDefault: true },
  { id: -5, name: "GitHub", level: "Familiar", createdAt: "", isDefault: true },
  {
    id: -6,
    name: "Problem Solving",
    level: "Familiar",
    createdAt: "",
    isDefault: true,
  },
];

const emptyActivityForm: ActivityForm = {
  title: "",
  type: "Activity",
  description: "",
  tools: "",
  learnings: "",
  evidenceUrl: "",
  thumbnailUrl: "",
  completedOn: new Date().toISOString().slice(0, 10),
};

const emptySkillForm: SkillForm = {
  name: "",
  level: "Learning",
};

function fromRow(row: ActivityRow): Activity {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    description: row.description ?? "",
    tools: row.tools ?? "",
    learnings: row.learnings ?? "",
    evidenceUrl: row.evidence_url ?? "",
    thumbnailUrl: row.thumbnail_url ?? "",
    completedOn: row.completed_on,
    createdAt: row.created_at,
  };
}

function toActivityRow(form: ActivityForm) {
  return {
    title: form.title.trim(),
    type: form.type,
    description: form.description.trim(),
    tools: form.tools.trim(),
    learnings: form.learnings.trim(),
    thumbnail_url: form.thumbnailUrl.trim(),
    evidence_url: form.evidenceUrl.trim(),
    completed_on: form.completedOn,
  };
}

function fromSkillRow(row: ActivityRow): PortfolioSkill {
  return {
    id: row.id,
    name: row.title,
    level: row.description || "Learning",
    createdAt: row.created_at,
  };
}

function toSkillRow(form: SkillForm) {
  return {
    title: form.name.trim(),
    type: SKILL_TYPE,
    description: form.level,
    tools: "",
    learnings: "",
    thumbnail_url: "",
    evidence_url: "",
    completed_on: new Date().toISOString().slice(0, 10),
  };
}

function displayDate(value: string, withTime = false) {
  const date = new Date(withTime ? value : value + "T00:00:00");
  if (Number.isNaN(date.getTime())) return "Unknown date";

  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(date);
}

function apiHeaders(session?: Session | null) {
  return {
    apikey: SUPABASE_KEY,
    "Content-Type": "application/json",
    ...(session ? { Authorization: "Bearer " + session.access_token } : {}),
  };
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 12000,
) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

function detectBrowser(userAgent: string) {
  if (/Edg\//i.test(userAgent)) return "Edge";
  if (/CriOS|Chrome/i.test(userAgent)) return "Chrome";
  if (/FxiOS|Firefox/i.test(userAgent)) return "Firefox";
  if (/Safari/i.test(userAgent)) return "Safari";
  return "Other browser";
}

function detectDevice(userAgent: string, width: number) {
  if (/iPad|Tablet/i.test(userAgent) || (width >= 600 && width <= 1024)) {
    return "Tablet";
  }
  if (/Mobi|Android|iPhone/i.test(userAgent) || width < 600) return "Mobile";
  return "Desktop";
}

function parseVisit(row: SiteFeedback): VisitLog | null {
  try {
    const details = JSON.parse(row.feedback) as Partial<VisitDetails>;
    if (!details.sessionId || !details.device || !details.browser) return null;

    return {
      ...row,
      details: {
        sessionId: String(details.sessionId),
        device: String(details.device),
        browser: String(details.browser),
        viewport: String(details.viewport || "Unknown"),
        source: String(details.source || "Direct"),
        path: String(details.path || "/"),
      },
    };
  } catch {
    return null;
  }
}

async function optimizeImage(file: File) {
  if (file.type === "image/webp" && file.size <= 700 * 1024) {
    return { blob: file as Blob, extension: "webp" };
  }

  return await new Promise<{ blob: Blob; extension: string }>((resolve) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      const maxWidth = 1400;
      const scale = Math.min(1, maxWidth / image.naturalWidth);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");

      if (!context) {
        URL.revokeObjectURL(objectUrl);
        resolve({
          blob: file,
          extension: file.name.split(".").pop()?.toLowerCase() || "jpg",
        });
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          resolve(
            blob
              ? { blob, extension: "webp" }
              : {
                  blob: file,
                  extension:
                    file.name.split(".").pop()?.toLowerCase() || "jpg",
                },
          );
        },
        "image/webp",
        0.82,
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        blob: file,
        extension: file.name.split(".").pop()?.toLowerCase() || "jpg",
      });
    };

    image.src = objectUrl;
  });
}

function DeviceIcon({ device }: { device: string }) {
  if (device === "Mobile") return <Smartphone size={17} aria-hidden="true" />;
  if (device === "Tablet") return <Tablet size={17} aria-hidden="true" />;
  return <Monitor size={17} aria-hidden="true" />;
}

export default function Portfolio() {
  const [items, setItems] = useState<Activity[]>([]);
  const [skills, setSkills] = useState<PortfolioSkill[]>(DEFAULT_SKILLS);
  const [activityForm, setActivityForm] =
    useState<ActivityForm>(emptyActivityForm);
  const [skillForm, setSkillForm] = useState<SkillForm>(emptySkillForm);
  const [editingActivityId, setEditingActivityId] = useState<number | null>(
    null,
  );
  const [editingSkillId, setEditingSkillId] = useState<number | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [comments, setComments] = useState<ActivityComment[]>([]);
  const [feedback, setFeedback] = useState<SiteFeedback[]>([]);
  const [visits, setVisits] = useState<VisitLog[]>([]);
  const [commentDrafts, setCommentDrafts] = useState<
    Record<number, { name: string; text: string }>
  >({});
  const [activityOpen, setActivityOpen] = useState(false);
  const [skillOpen, setSkillOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("home");
  const [theme, setTheme] = useState<Theme>("dark");
  const [loading, setLoading] = useState(true);
  const [skillsReady, setSkillsReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState("");
  const [notice, setNotice] = useState("");
  const [loginError, setLoginError] = useState("");

  async function loadPortfolioContent() {
    try {
      const response = await fetchWithTimeout(
        SUPABASE_URL +
          "/rest/v1/activities?select=*&order=created_at.desc,id.desc",
        { headers: apiHeaders(), cache: "no-store" },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load.");

      const rows = data as ActivityRow[];
      const regularRows = rows.filter(
        (row) => row.type !== SKILL_TYPE && row.type !== SKILL_META_TYPE,
      );
      const skillRows = rows
        .filter((row) => row.type === SKILL_TYPE)
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
      const hasMarker = rows.some(
        (row) =>
          row.type === SKILL_META_TYPE && row.title === SKILL_META_TITLE,
      );

      setItems(regularRows.map(fromRow));
      setSkills(
        skillRows.length > 0
          ? skillRows.map(fromSkillRow)
          : hasMarker
            ? []
            : DEFAULT_SKILLS,
      );
      setSkillsReady(hasMarker);
    } catch {
      setNotice("Hindi ma-load ang portfolio data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function loadComments() {
    try {
      const response = await fetchWithTimeout(
        SUPABASE_URL +
          "/rest/v1/activity_comments?select=*&order=created_at.asc&limit=200",
        { headers: apiHeaders(), cache: "no-store" },
      );
      const data = await response.json();
      if (response.ok) setComments(data as ActivityComment[]);
    } catch {
      /* Comments stay optional if the connection is unavailable. */
    }
  }

  async function loadAdminData(activeSession: Session) {
    try {
      const feedbackUrl =
        SUPABASE_URL +
        "/rest/v1/site_feedback?select=*&visitor_name=neq." +
        VISIT_MARKER +
        "&order=created_at.desc&limit=100";
      const visitsUrl =
        SUPABASE_URL +
        "/rest/v1/site_feedback?select=*&visitor_name=eq." +
        VISIT_MARKER +
        "&order=created_at.desc&limit=100";

      const [feedbackResponse, visitsResponse] = await Promise.all([
        fetchWithTimeout(feedbackUrl, {
          headers: apiHeaders(activeSession),
          cache: "no-store",
        }),
        fetchWithTimeout(visitsUrl, {
          headers: apiHeaders(activeSession),
          cache: "no-store",
        }),
      ]);

      if (feedbackResponse.ok) {
        setFeedback((await feedbackResponse.json()) as SiteFeedback[]);
      }

      if (visitsResponse.ok) {
        const rows = (await visitsResponse.json()) as SiteFeedback[];
        setVisits(
          rows
            .map(parseVisit)
            .filter((entry): entry is VisitLog => entry !== null),
        );
      }
    } catch {
      setNotice("Admin records could not be refreshed.");
    }
  }

  async function ensureSkillsSeeded(activeSession: Session) {
    const response = await fetchWithTimeout(
      SUPABASE_URL +
        "/rest/v1/activities?select=*&type=in.(Skill,SkillMeta)&order=created_at.asc",
      { headers: apiHeaders(activeSession), cache: "no-store" },
    );
    const rows = (await response.json()) as ActivityRow[];

    if (!response.ok) {
      throw new Error("Skills could not be prepared for editing.");
    }

    const hasMarker = rows.some(
      (row) =>
        row.type === SKILL_META_TYPE && row.title === SKILL_META_TITLE,
    );
    const savedSkills = rows.filter((row) => row.type === SKILL_TYPE);

    if (!hasMarker) {
      const today = new Date().toISOString().slice(0, 10);
      const payload = [
        ...(savedSkills.length === 0
          ? DEFAULT_SKILLS.map((skill) => ({
              ...toSkillRow({ name: skill.name, level: skill.level }),
              completed_on: today,
            }))
          : []),
        {
          title: SKILL_META_TITLE,
          type: SKILL_META_TYPE,
          description: "Keeps an intentionally empty skill list from resetting.",
          tools: "",
          learnings: "",
          thumbnail_url: "",
          evidence_url: "",
          completed_on: today,
        },
      ];

      const seedResponse = await fetchWithTimeout(
        SUPABASE_URL + "/rest/v1/activities",
        {
          method: "POST",
          headers: {
            ...apiHeaders(activeSession),
            Prefer: "return=minimal",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!seedResponse.ok) {
        throw new Error("Skills could not be prepared for editing.");
      }
    }

    setSkillsReady(true);
    await loadPortfolioContent();
  }

  async function restoreSession(storedValue: string) {
    try {
      const saved = JSON.parse(storedValue) as Session;
      let activeSession = saved;

      if (saved.refresh_token) {
        const response = await fetchWithTimeout(
          SUPABASE_URL + "/auth/v1/token?grant_type=refresh_token",
          {
            method: "POST",
            headers: apiHeaders(),
            body: JSON.stringify({ refresh_token: saved.refresh_token }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          activeSession = {
            access_token: data.access_token,
            refresh_token: data.refresh_token || saved.refresh_token,
            expires_at: data.expires_at,
            user: data.user || saved.user,
          };
          localStorage.setItem(SESSION_KEY, JSON.stringify(activeSession));
        } else if (response.status === 400 || response.status === 401) {
          localStorage.removeItem(SESSION_KEY);
          return;
        }
      }

      setSession(activeSession);
      await Promise.all([
        loadAdminData(activeSession),
        ensureSkillsSeeded(activeSession),
      ]);
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  async function recordVisit() {
    if (
      sessionStorage.getItem(VISIT_SESSION_KEY) ||
      localStorage.getItem(SESSION_KEY)
    ) {
      return;
    }

    sessionStorage.setItem(VISIT_SESSION_KEY, "pending");
    const sessionId =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID().slice(0, 8)
        : Math.random().toString(36).slice(2, 10);

    let source = "Direct";
    if (document.referrer) {
      try {
        const referrerHost = new URL(document.referrer).hostname;
        source =
          referrerHost === window.location.hostname ? "Internal" : referrerHost;
      } catch {
        source = "Referral";
      }
    }

    const details: VisitDetails = {
      sessionId,
      device: detectDevice(navigator.userAgent, window.innerWidth),
      browser: detectBrowser(navigator.userAgent),
      viewport: window.innerWidth + " × " + window.innerHeight,
      source,
      path: window.location.pathname,
    };

    try {
      const response = await fetchWithTimeout(
        SUPABASE_URL + "/rest/v1/site_feedback",
        {
          method: "POST",
          headers: { ...apiHeaders(), Prefer: "return=minimal" },
          body: JSON.stringify({
            visitor_name: VISIT_MARKER,
            feedback: JSON.stringify(details),
          }),
          keepalive: true,
        },
        8000,
      );

      if (!response.ok) throw new Error("Visit was not recorded.");
      sessionStorage.setItem(VISIT_SESSION_KEY, "done");
    } catch {
      sessionStorage.removeItem(VISIT_SESSION_KEY);
    }
  }

  useEffect(() => {
    const documentTheme = document.documentElement.dataset.theme;
    const storedTheme = localStorage.getItem(THEME_KEY);
    const nextTheme: Theme =
      storedTheme === "light" || storedTheme === "dark"
        ? storedTheme
        : documentTheme === "light"
          ? "light"
          : "dark";

    document.documentElement.dataset.theme = nextTheme;
    setTheme(nextTheme);
    setFeedbackSent(sessionStorage.getItem(FEEDBACK_SESSION_KEY) === "done");

    const hash = window.location.hash.replace("#", "");
    const hashView: Record<string, MobileView> = {
      home: "home",
      about: "home",
      works: "works",
      skills: "skills",
      feedback: "feedback",
      contact: "contact",
    };
    if (hashView[hash]) setMobileView(hashView[hash]);

    void loadPortfolioContent();
    void loadComments();

    const storedSession = localStorage.getItem(SESSION_KEY);
    let visitTimer = 0;

    if (storedSession) {
      void restoreSession(storedSession);
    } else {
      visitTimer = window.setTimeout(() => void recordVisit(), 800);
    }

    return () => {
      if (visitTimer) window.clearTimeout(visitTimer);
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 5000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const counts = useMemo(
    () => ({
      all: items.length,
      activities: items.filter((item) => item.type === "Activity").length,
      projects: items.filter((item) => item.type === "Project").length,
    }),
    [items],
  );

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem(THEME_KEY, nextTheme);
    setTheme(nextTheme);
  }

  function showMobileView(nextView: MobileView) {
    setMobileView(nextView);
    const nextHash = nextView === "home" ? "home" : nextView;
    window.history.replaceState(null, "", "#" + nextHash);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  }

  function updateActivity<K extends keyof ActivityForm>(
    key: K,
    value: ActivityForm[K],
  ) {
    setActivityForm((current) => ({ ...current, [key]: value }));
  }

  function requestAddActivity() {
    if (!session) {
      setLoginError("");
      setLoginOpen(true);
      return;
    }

    setEditingActivityId(null);
    setActivityForm({
      ...emptyActivityForm,
      completedOn: new Date().toISOString().slice(0, 10),
    });
    setActivityOpen(true);
  }

  function startEditActivity(item: Activity) {
    if (!session) return;
    const { id, createdAt, ...values } = item;
    void createdAt;
    setEditingActivityId(id);
    setActivityForm(values);
    setActivityOpen(true);
  }

  function requestAddSkill() {
    if (!session) {
      setLoginError("");
      setLoginOpen(true);
      return;
    }
    if (!skillsReady) {
      setNotice("Skills are still being prepared. Please try again shortly.");
      return;
    }

    setEditingSkillId(null);
    setSkillForm(emptySkillForm);
    setSkillOpen(true);
  }

  function startEditSkill(skill: PortfolioSkill) {
    if (!session || !skillsReady || skill.id < 0) return;
    setEditingSkillId(skill.id);
    setSkillForm({ name: skill.name, level: skill.level });
    setSkillOpen(true);
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setLoginError("");

    const values = new FormData(event.currentTarget);
    try {
      const response = await fetchWithTimeout(
        SUPABASE_URL + "/auth/v1/token?grant_type=password",
        {
          method: "POST",
          headers: apiHeaders(),
          body: JSON.stringify({
            email: values.get("email"),
            password: values.get("password"),
          }),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error_description || data.msg || "Invalid login credentials",
        );
      }

      const nextSession: Session = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
        user: data.user,
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      setSession(nextSession);
      await Promise.all([
        loadAdminData(nextSession),
        ensureSkillsSeeded(nextSession),
      ]);
      setLoginOpen(false);
      setNotice("Admin mode enabled.");
    } catch (error) {
      const errorText =
        error instanceof Error ? error.message.toLowerCase() : "";
      setLoginError(
        errorText.includes("invalid login credentials")
          ? "Incorrect email or password."
          : "Unable to log in. Please check your connection and try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setFeedback([]);
    setVisits([]);
    setNotice("Logged out. The portfolio is back in view-only mode.");
  }

  async function submitComment(event: FormEvent, activityId: number) {
    event.preventDefault();
    const draft = commentDrafts[activityId] ?? { name: "", text: "" };
    if (draft.name.trim().length < 2 || draft.text.trim().length < 3) return;

    setSaving(true);
    try {
      const response = await fetchWithTimeout(
        SUPABASE_URL + "/rest/v1/activity_comments",
        {
          method: "POST",
          headers: { ...apiHeaders(), Prefer: "return=minimal" },
          body: JSON.stringify({
            activity_id: activityId,
            visitor_name: draft.name.trim(),
            comment: draft.text.trim(),
          }),
        },
      );
      if (!response.ok) throw new Error("Comment failed.");

      setCommentDrafts((current) => ({
        ...current,
        [activityId]: { name: "", text: "" },
      }));
      await loadComments();
      setNotice("Comment submitted.");
    } catch {
      setNotice("Hindi na-submit ang comment. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (feedbackSent) return;

    setSaving(true);
    setFeedbackStatus("Sending feedback...");
    const formElement = event.currentTarget;
    const values = new FormData(formElement);

    try {
      const response = await fetchWithTimeout(
        SUPABASE_URL + "/rest/v1/site_feedback",
        {
          method: "POST",
          headers: { ...apiHeaders(), Prefer: "return=minimal" },
          body: JSON.stringify({
            visitor_name: String(values.get("visitor_name") ?? "").trim(),
            feedback: String(values.get("feedback") ?? "").trim(),
          }),
        },
      );
      if (!response.ok) throw new Error("Feedback submission failed.");

      formElement.reset();
      sessionStorage.setItem(FEEDBACK_SESSION_KEY, "done");
      setFeedbackSent(true);
      setFeedbackStatus("Feedback sent successfully. Thank you!");
    } catch {
      setFeedbackStatus("Feedback was not sent. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteComment(id: number) {
    if (!session || !window.confirm("Delete this comment?")) return;

    const response = await fetchWithTimeout(
      SUPABASE_URL + "/rest/v1/activity_comments?id=eq." + id,
      { method: "DELETE", headers: apiHeaders(session) },
    );
    if (response.ok) {
      setComments((current) => current.filter((entry) => entry.id !== id));
      setNotice("Comment deleted.");
    }
  }

  async function deleteFeedbackRow(id: number, kind: "feedback" | "visit") {
    if (!session || !window.confirm("Delete this " + kind + " record?")) return;

    const response = await fetchWithTimeout(
      SUPABASE_URL + "/rest/v1/site_feedback?id=eq." + id,
      { method: "DELETE", headers: apiHeaders(session) },
    );

    if (response.ok) {
      if (kind === "visit") {
        setVisits((current) => current.filter((entry) => entry.id !== id));
      } else {
        setFeedback((current) => current.filter((entry) => entry.id !== id));
      }
      setNotice(kind === "visit" ? "Visit record deleted." : "Feedback deleted.");
    }
  }

  async function uploadThumbnail(file: File) {
    if (!session) {
      setLoginOpen(true);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setNotice("JPG, PNG, or WebP image lamang ang puwede.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setNotice("Masyadong malaki ang image. Maximum size is 5 MB.");
      return;
    }

    setUploadingImage(true);
    setNotice("Optimizing and uploading image...");

    try {
      const optimized = await optimizeImage(file);
      const randomId =
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2);
      const fileName =
        Date.now() + "-" + randomId + "." + optimized.extension;

      const response = await fetchWithTimeout(
        SUPABASE_URL +
          "/storage/v1/object/activity-thumbnails/" +
          fileName,
        {
          method: "POST",
          headers: {
            ...apiHeaders(session),
            "Content-Type": optimized.blob.type || file.type,
            "x-upsert": "false",
          },
          body: optimized.blob,
        },
        20000,
      );

      if (!response.ok) throw new Error("Image upload failed.");

      setActivityForm((current) => ({
        ...current,
        thumbnailUrl:
          SUPABASE_URL +
          "/storage/v1/object/public/activity-thumbnails/" +
          fileName,
      }));
      setNotice("Image uploaded and optimized.");
    } catch {
      setNotice("Hindi na-upload ang image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function submitActivity(event: FormEvent) {
    event.preventDefault();
    if (!session) {
      setLoginOpen(true);
      return;
    }

    setSaving(true);
    const url = editingActivityId
      ? SUPABASE_URL +
        "/rest/v1/activities?id=eq." +
        editingActivityId
      : SUPABASE_URL + "/rest/v1/activities";

    try {
      const response = await fetchWithTimeout(url, {
        method: editingActivityId ? "PATCH" : "POST",
        headers: { ...apiHeaders(session), Prefer: "return=representation" },
        body: JSON.stringify(toActivityRow(activityForm)),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Hindi na-save ang activity.");
      }

      await loadPortfolioContent();
      setActivityOpen(false);
      setNotice(
        editingActivityId ? "Activity updated." : "Activity saved.",
      );
    } catch (error) {
      const errorText =
        error instanceof Error ? error.message : "Something went wrong.";
      if (/jwt|token/i.test(errorText)) {
        logout();
        setLoginOpen(true);
      }
      setNotice(errorText);
    } finally {
      setSaving(false);
    }
  }

  async function removeActivity(item: Activity) {
    if (
      !session ||
      !window.confirm("Delete “" + item.title + "”? This cannot be undone.")
    ) {
      return;
    }

    const response = await fetchWithTimeout(
      SUPABASE_URL + "/rest/v1/activities?id=eq." + item.id,
      { method: "DELETE", headers: apiHeaders(session) },
    );

    if (response.ok) {
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setNotice("Activity deleted.");
    } else {
      setNotice("Hindi na-delete ang activity. Try logging in again.");
    }
  }

  async function submitSkill(event: FormEvent) {
    event.preventDefault();
    if (!session || !skillsReady) return;

    setSaving(true);
    const url = editingSkillId
      ? SUPABASE_URL + "/rest/v1/activities?id=eq." + editingSkillId
      : SUPABASE_URL + "/rest/v1/activities";

    try {
      const response = await fetchWithTimeout(url, {
        method: editingSkillId ? "PATCH" : "POST",
        headers: { ...apiHeaders(session), Prefer: "return=representation" },
        body: JSON.stringify(toSkillRow(skillForm)),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Skill could not be saved.");
      }

      await loadPortfolioContent();
      setSkillOpen(false);
      setNotice(editingSkillId ? "Skill updated." : "Skill added.");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Skill could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeSkill(skill: PortfolioSkill) {
    if (
      !session ||
      skill.id < 0 ||
      !window.confirm("Remove “" + skill.name + "” from your skills?")
    ) {
      return;
    }

    const response = await fetchWithTimeout(
      SUPABASE_URL + "/rest/v1/activities?id=eq." + skill.id,
      { method: "DELETE", headers: apiHeaders(session) },
    );

    if (response.ok) {
      setSkills((current) => current.filter((entry) => entry.id !== skill.id));
      setNotice("Skill removed.");
    } else {
      setNotice("Skill could not be removed.");
    }
  }

  const homeActive = mobileView === "home" ? " is-active" : "";
  const worksActive = mobileView === "works" ? " is-active" : "";
  const skillsActive = mobileView === "skills" ? " is-active" : "";
  const feedbackActive = mobileView === "feedback" ? " is-active" : "";
  const contactActive = mobileView === "contact" ? " is-active" : "";

  return (
    <main data-mobile-view={mobileView}>
      <nav className="nav" aria-label="Main navigation">
        <a
          className="brand"
          href="#home"
          aria-label="Carl Anthony home"
          onClick={(event) => {
            if (window.matchMedia("(max-width: 800px)").matches) {
              event.preventDefault();
              showMobileView("home");
            }
          }}
        >
          CA<span>.</span>
        </a>

        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#works">Activities</a>
          <a href="#skills">Skills</a>
          <a href="#feedback">Feedback</a>
          <a href="#contact">Contact</a>
          {session && (
            <button className="small-add" onClick={requestAddActivity}>
              <Plus size={16} /> Add activity
            </button>
          )}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            title={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          {session ? (
            <button className="nav-login" onClick={logout}>
              <LogOut size={16} /> Log out
            </button>
          ) : (
            <button
              className="nav-login"
              onClick={() => {
                setLoginError("");
                setLoginOpen(true);
              }}
            >
              <ShieldCheck size={16} /> Admin
            </button>
          )}
        </div>

        <div className="mobile-top-actions">
          <button
            className="icon-button"
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <button
            className={"icon-button" + (session ? " admin-active" : "")}
            onClick={() => {
              if (session) logout();
              else {
                setLoginError("");
                setLoginOpen(true);
              }
            }}
            aria-label={session ? "Log out of admin mode" : "Admin login"}
          >
            {session ? <LogOut size={19} /> : <UserRound size={19} />}
          </button>
        </div>
      </nav>

      {notice && (
        <div className="app-toast" role="status">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss message">
            <X size={16} />
          </button>
        </div>
      )}

      <section
        className={"hero shell mobile-panel mobile-home" + homeActive}
        id="home"
      >
        <div className="hero-copy">
          <div className="status-row">
            <span className="status-dot" aria-hidden="true" />
            Available portfolio
            {session && <b>Admin mode</b>}
          </div>
          <p className="eyebrow">BSIT STUDENT · ACADEMIC PORTFOLIO</p>
          <h1>
            Learning by
            <br />
            <span>building.</span>
          </h1>
          <p className="intro">
            Hi, I’m <strong>Carl Anthony Eguizabal</strong>. This portfolio
            documents my activities, projects, and progress for{" "}
            <strong>IT ELECTIVE 1 (Web Fundamental)</strong>.
          </p>
          <div className="hero-actions">
            {session ? (
              <button className="primary" onClick={requestAddActivity}>
                <Plus size={18} /> Add new activity
              </button>
            ) : (
              <button
                className="primary"
                onClick={() => {
                  setLoginError("");
                  setLoginOpen(true);
                }}
              >
                <ShieldCheck size={18} /> Admin login
              </button>
            )}
            <button
              className="secondary mobile-work-button"
              onClick={() => showMobileView("works")}
            >
              View my work
            </button>
            <a className="secondary desktop-work-link" href="#works">
              View my work
            </a>
          </div>
        </div>

        <div className="portrait">
          <img
            src="/profile.jpg"
            alt="Carl Anthony Eguizabal"
            width={1254}
            height={1254}
            decoding="async"
            fetchPriority="high"
          />
          <span className="portrait-label">CARL ANTHONY · BSIT</span>
        </div>
      </section>

      <section
        className={"section shell mobile-panel mobile-home" + homeActive}
        id="about"
      >
        <div className="section-heading">
          <span>01</span>
          <div>
            <p>PROFILE</p>
            <h2>About me</h2>
          </div>
        </div>
        <div className="about-grid">
          <p className="about-lead">
            I’m a 2ND-YEAR BSIT student who enjoys learning about technology,
            programming, and web design. This portfolio shows how my skills
            improve through every school output.
          </p>
          <dl className="student-info">
            <div>
              <dt>School</dt>
              <dd>BESTLINK COLLEGE OF THE PHILIPPINES</dd>
            </div>
            <div>
              <dt>Program & Year</dt>
              <dd>BSIT · 2nd Year</dd>
            </div>
            <div>
              <dt>Section</dt>
              <dd>MV-21010</dd>
            </div>
            <div>
              <dt>Professor</dt>
              <dd>Mari Laynesa</dd>
            </div>
          </dl>
        </div>
      </section>

      <section
        className={
          "section works-section mobile-panel mobile-works" + worksActive
        }
        id="works"
      >
        <div className="shell">
          <div className="section-heading">
            <span>02</span>
            <div>
              <p>PORTFOLIO</p>
              <h2>Activities & projects</h2>
            </div>
          </div>

          <div className="work-toolbar">
            <div className="stats" aria-label="Portfolio totals">
              <span>
                <b>{counts.all}</b> Total
              </span>
              <span>
                <b>{counts.activities}</b> Activities
              </span>
              <span>
                <b>{counts.projects}</b> Projects
              </span>
            </div>
            {session && (
              <button className="primary" onClick={requestAddActivity}>
                <Plus size={18} /> Add new
              </button>
            )}
          </div>

          {loading ? (
            <div className="work-grid loading-grid" aria-label="Loading work">
              {[0, 1, 2].map((entry) => (
                <div className="work-card skeleton-card" key={entry}>
                  <span />
                  <div />
                  <strong />
                  <p />
                  <p />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <BookOpen size={36} />
              <h3>Your work will appear here.</h3>
              <p>
                {session
                  ? "Add your first completed activity. The save date and time will be recorded automatically."
                  : "No activities have been published yet."}
              </p>
              {session && (
                <button className="secondary" onClick={requestAddActivity}>
                  Add first activity
                </button>
              )}
            </div>
          ) : (
            <div className="work-grid">
              {items.map((item, index) => {
                const itemComments = comments.filter(
                  (entry) => entry.activity_id === item.id,
                );
                const draft = commentDrafts[item.id] ?? {
                  name: "",
                  text: "",
                };

                return (
                  <article className="work-card" key={item.id}>
                    <div className="card-top">
                      <span className="work-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="type-pill">{item.type}</span>
                    </div>

                    {item.thumbnailUrl &&
                      (item.evidenceUrl ? (
                        <a
                          className="activity-thumbnail"
                          href={item.evidenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={"Open " + item.title}
                        >
                          <img
                            src={item.thumbnailUrl}
                            alt={item.title + " thumbnail"}
                            width={1600}
                            height={900}
                            loading="lazy"
                            decoding="async"
                          />
                        </a>
                      ) : (
                        <div className="activity-thumbnail">
                          <img
                            src={item.thumbnailUrl}
                            alt={item.title + " thumbnail"}
                            width={1600}
                            height={900}
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      ))}

                    <h3>{item.title}</h3>
                    <p>{item.description || "No description added."}</p>

                    {item.tools && (
                      <div className="tags">
                        {item.tools.split(",").map((tool) => (
                          <span key={tool}>{tool.trim()}</span>
                        ))}
                      </div>
                    )}

                    {item.learnings && (
                      <div className="learning">
                        <strong>What I learned</strong>
                        <p>{item.learnings}</p>
                      </div>
                    )}

                    <div className="date-row">
                      <CalendarDays size={15} />
                      <span>Completed {displayDate(item.completedOn)}</span>
                    </div>
                    <div className="saved-date">
                      Saved {displayDate(item.createdAt, true)}
                    </div>

                    {(item.evidenceUrl || session) && (
                      <div className="card-actions">
                        {item.evidenceUrl && (
                          <a
                            href={item.evidenceUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink size={15} /> View output
                          </a>
                        )}
                        {session && (
                          <>
                            <button
                              type="button"
                              onClick={() => startEditActivity(item)}
                            >
                              <Pencil size={15} /> Edit
                            </button>
                            <button
                              type="button"
                              className="delete"
                              onClick={() => removeActivity(item)}
                            >
                              <Trash2 size={15} /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    <details className="comments">
                      <summary className="comments-title">
                        <span className="comments-label">
                          <MessageSquare size={15} /> Comments
                        </span>
                        <span className="count-badge">{itemComments.length}</span>
                      </summary>

                      <div className="comments-body">
                        {itemComments.length > 0 && (
                          <div className="comment-list">
                            {itemComments.map((entry) => (
                              <div className="comment" key={entry.id}>
                                <div>
                                  <strong>{entry.visitor_name}</strong>
                                  <time>
                                    {displayDate(entry.created_at, true)}
                                  </time>
                                </div>
                                <p>{entry.comment}</p>
                                {session && (
                                  <button
                                    type="button"
                                    className="text-delete"
                                    onClick={() => deleteComment(entry.id)}
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <form
                          className="comment-form"
                          onSubmit={(event) =>
                            submitComment(event, item.id)
                          }
                        >
                          <input
                            aria-label="Your name"
                            placeholder="Your name"
                            minLength={2}
                            maxLength={60}
                            required
                            value={draft.name}
                            onChange={(event) =>
                              setCommentDrafts((current) => ({
                                ...current,
                                [item.id]: {
                                  ...draft,
                                  name: event.target.value,
                                },
                              }))
                            }
                          />
                          <textarea
                            aria-label="Comment"
                            placeholder="Add a comment…"
                            minLength={3}
                            maxLength={1000}
                            rows={2}
                            required
                            value={draft.text}
                            onChange={(event) =>
                              setCommentDrafts((current) => ({
                                ...current,
                                [item.id]: {
                                  ...draft,
                                  text: event.target.value,
                                },
                              }))
                            }
                          />
                          <button
                            className="comment-submit"
                            disabled={saving}
                          >
                            Add comment
                          </button>
                        </form>
                      </div>
                    </details>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section
        className={"section shell mobile-panel mobile-skills" + skillsActive}
        id="skills"
      >
        <div className="section-heading skills-heading">
          <span>03</span>
          <div>
            <p>TOOLKIT</p>
            <h2>Skills I’m building</h2>
          </div>
          {session && (
            <button
              className="secondary heading-action"
              onClick={requestAddSkill}
              disabled={!skillsReady}
            >
              <Plus size={17} /> Add skill
            </button>
          )}
        </div>

        {skills.length === 0 ? (
          <div className="empty-state compact-empty">
            <Sparkles size={30} />
            <h3>No skills listed yet.</h3>
            {session && (
              <button className="secondary" onClick={requestAddSkill}>
                Add a skill
              </button>
            )}
          </div>
        ) : (
          <div className="skill-list">
            {skills.map((skill, index) => (
              <article className="skill-row" key={skill.id}>
                <span className="skill-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="skill-copy">
                  <strong>{skill.name}</strong>
                  <em>{skill.level}</em>
                </div>
                {session && skillsReady && skill.id > 0 && (
                  <div className="skill-actions">
                    <button
                      type="button"
                      onClick={() => startEditSkill(skill)}
                      aria-label={"Edit " + skill.name}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      className="delete"
                      onClick={() => removeSkill(skill)}
                      aria-label={"Remove " + skill.name}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section
        className={"reflection mobile-panel mobile-home" + homeActive}
        aria-label="Portfolio reflection"
      >
        <div className="shell">
          <GraduationCap />
          <p>
            “Every activity is a record of progress—not just a requirement
            completed.”
          </p>
        </div>
      </section>

      <section
        className={
          "section shell feedback-section mobile-panel mobile-feedback" +
          feedbackActive
        }
        id="feedback"
      >
        <div className="section-heading">
          <span>04</span>
          <div>
            <p>MESSAGE</p>
            <h2>Website feedback</h2>
          </div>
        </div>

        <div className="feedback-grid">
          <div>
            <p className="about-lead">
              Have a suggestion about this portfolio? Leave a private message.
              Only the portfolio owner can read it.
            </p>
          </div>
          <form className="feedback-form" onSubmit={submitFeedback}>
            <label>
              Your name
              <input
                name="visitor_name"
                minLength={2}
                maxLength={60}
                required
                placeholder="Enter your name"
                disabled={feedbackSent}
              />
            </label>
            <label>
              Your feedback
              <textarea
                name="feedback"
                minLength={3}
                maxLength={1000}
                rows={5}
                required
                placeholder="What can I improve?"
                disabled={feedbackSent}
              />
            </label>
            <button className="primary" disabled={saving || feedbackSent}>
              {saving
                ? "Sending..."
                : feedbackSent
                  ? "Feedback sent"
                  : "Send feedback"}
            </button>
            {feedbackStatus && (
              <p className={feedbackSent ? "form-success" : "form-status"}>
                {feedbackStatus}
              </p>
            )}
          </form>
        </div>

        {session && (
          <div className="admin-dashboard">
            <section className="admin-panel">
              <div className="panel-title">
                <div>
                  <MessageSquare size={18} />
                  <strong>Private feedback</strong>
                </div>
                <span>{feedback.length}</span>
              </div>

              {feedback.length === 0 ? (
                <p className="inbox-empty">No feedback received yet.</p>
              ) : (
                <div className="feedback-list">
                  {feedback.map((entry) => (
                    <article key={entry.id}>
                      <div>
                        <strong>{entry.visitor_name}</strong>
                        <time>{displayDate(entry.created_at, true)}</time>
                      </div>
                      <p>{entry.feedback}</p>
                      <button
                        type="button"
                        className="text-delete"
                        onClick={() =>
                          deleteFeedbackRow(entry.id, "feedback")
                        }
                      >
                        Delete
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="admin-panel access-history">
              <div className="panel-title">
                <div>
                  <BarChart3 size={18} />
                  <strong>Access history</strong>
                </div>
                <span>{visits.length}</span>
              </div>
              <p className="privacy-note">
                Recent anonymous sessions only. No IP addresses or exact
                locations are collected.
              </p>

              {visits.length === 0 ? (
                <p className="inbox-empty">No visits recorded yet.</p>
              ) : (
                <div className="visit-list">
                  {visits.map((entry) => (
                    <article className="visit-row" key={entry.id}>
                      <div className="device-icon">
                        <DeviceIcon device={entry.details.device} />
                      </div>
                      <div className="visit-copy">
                        <strong>
                          {entry.details.device} · {entry.details.browser}
                        </strong>
                        <span>
                          {entry.details.viewport} · {entry.details.source}
                        </span>
                        <time>{displayDate(entry.created_at, true)}</time>
                      </div>
                      <button
                        type="button"
                        className="text-delete"
                        onClick={() => deleteFeedbackRow(entry.id, "visit")}
                        aria-label="Delete visit record"
                      >
                        <Trash2 size={15} />
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </section>

      <footer
        className={"mobile-panel mobile-contact" + contactActive}
        id="contact"
      >
        <div className="shell footer-inner">
          <div>
            <p className="eyebrow">LET&apos;S CONNECT</p>
            <h2>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=eguizabalcarl77@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                eguizabalcarl77@gmail.com
              </a>
            </h2>
          </div>

          <div className="footer-links">
            <a href="tel:+639451973528">0945 197 3528</a>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=eguizabalcarl77@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Email
            </a>
            <a
              href="https://github.com/fuzewuze1504"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://www.facebook.com/kal.el.666172"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </a>
          </div>
        </div>
      </footer>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <button
          className={mobileView === "home" ? "active" : ""}
          onClick={() => showMobileView("home")}
          aria-label="Home"
          aria-current={mobileView === "home" ? "page" : undefined}
        >
          <Home size={20} />
          <span>Home</span>
        </button>
        <button
          className={mobileView === "works" ? "active" : ""}
          onClick={() => showMobileView("works")}
          aria-label="Work"
          aria-current={mobileView === "works" ? "page" : undefined}
        >
          <FolderKanban size={20} />
          <span>Work</span>
        </button>
        <button
          className={mobileView === "skills" ? "active" : ""}
          onClick={() => showMobileView("skills")}
          aria-label="Skills"
          aria-current={mobileView === "skills" ? "page" : undefined}
        >
          <Sparkles size={20} />
          <span>Skills</span>
        </button>
        <button
          className={mobileView === "feedback" ? "active" : ""}
          onClick={() => showMobileView("feedback")}
          aria-label="Feedback"
          aria-current={mobileView === "feedback" ? "page" : undefined}
        >
          <MessageSquare size={20} />
          <span>Feedback</span>
        </button>
        <button
          className={mobileView === "contact" ? "active" : ""}
          onClick={() => showMobileView("contact")}
          aria-label="Contact"
          aria-current={mobileView === "contact" ? "page" : undefined}
        >
          <ContactRound size={20} />
          <span>Contact</span>
        </button>
      </nav>

      {activityOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setActivityOpen(false)
          }
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="activity-form-title"
          >
            <div className="modal-head">
              <div>
                <p className="eyebrow">PORTFOLIO RECORD</p>
                <h2 id="activity-form-title">
                  {editingActivityId ? "Edit activity" : "Add new activity"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActivityOpen(false)}
                aria-label="Close"
              >
                <X />
              </button>
            </div>

            <form onSubmit={submitActivity}>
              <label>
                Activity or project title *
                <input
                  required
                  value={activityForm.title}
                  onChange={(event) =>
                    updateActivity("title", event.target.value)
                  }
                  placeholder="Example: Personal Portfolio Website"
                />
              </label>

              <div className="form-row">
                <label>
                  Type
                  <select
                    value={activityForm.type}
                    onChange={(event) =>
                      updateActivity("type", event.target.value)
                    }
                  >
                    <option>Activity</option>
                    <option>Project</option>
                    <option>Quiz</option>
                    <option>Laboratory</option>
                  </select>
                </label>
                <label>
                  Date completed *
                  <input
                    required
                    type="date"
                    value={activityForm.completedOn}
                    onChange={(event) =>
                      updateActivity("completedOn", event.target.value)
                    }
                  />
                </label>
              </div>

              <label>
                Short description
                <textarea
                  value={activityForm.description}
                  onChange={(event) =>
                    updateActivity("description", event.target.value)
                  }
                  placeholder="What did you create or accomplish?"
                  rows={3}
                />
              </label>

              <label>
                Tools used
                <input
                  value={activityForm.tools}
                  onChange={(event) =>
                    updateActivity("tools", event.target.value)
                  }
                  placeholder="HTML, CSS, VS Code (separate with commas)"
                />
              </label>

              <label>
                What I learned
                <textarea
                  value={activityForm.learnings}
                  onChange={(event) =>
                    updateActivity("learnings", event.target.value)
                  }
                  placeholder="Write a short reflection about this output."
                  rows={3}
                />
              </label>

              <label>
                Output link (optional)
                <input
                  type="url"
                  value={activityForm.evidenceUrl}
                  onChange={(event) =>
                    updateActivity("evidenceUrl", event.target.value)
                  }
                  placeholder="https://github.com/... or Google Drive link"
                />
              </label>

              <label>
                Activity thumbnail (optional)
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploadingImage}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadThumbnail(file);
                  }}
                />
              </label>

              {uploadingImage && (
                <p className="upload-status">Optimizing and uploading...</p>
              )}

              {activityForm.thumbnailUrl && (
                <div className="thumbnail-preview">
                  <img
                    src={activityForm.thumbnailUrl}
                    alt="Activity thumbnail preview"
                    width={800}
                    height={450}
                  />
                  <span>Image ready.</span>
                </div>
              )}

              <p className="auto-note">
                <Save size={15} /> The save date and time are added
                automatically.
              </p>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setActivityOpen(false)}
                >
                  Cancel
                </button>
                <button className="primary" disabled={saving || uploadingImage}>
                  {saving
                    ? "Saving…"
                    : editingActivityId
                      ? "Save changes"
                      : "Save activity"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {skillOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setSkillOpen(false)
          }
        >
          <section
            className="modal skill-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="skill-form-title"
          >
            <div className="modal-head">
              <div>
                <p className="eyebrow">MY TOOLKIT</p>
                <h2 id="skill-form-title">
                  {editingSkillId ? "Edit skill" : "Add a skill"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSkillOpen(false)}
                aria-label="Close"
              >
                <X />
              </button>
            </div>

            <form onSubmit={submitSkill}>
              <label>
                Skill name *
                <input
                  required
                  minLength={2}
                  maxLength={60}
                  value={skillForm.name}
                  onChange={(event) =>
                    setSkillForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Example: JavaScript"
                />
              </label>

              <label>
                Current level
                <select
                  value={skillForm.level}
                  onChange={(event) =>
                    setSkillForm((current) => ({
                      ...current,
                      level: event.target.value,
                    }))
                  }
                >
                  <option>Learning</option>
                  <option>Familiar</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </label>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setSkillOpen(false)}
                >
                  Cancel
                </button>
                <button className="primary" disabled={saving}>
                  {saving
                    ? "Saving…"
                    : editingSkillId
                      ? "Save changes"
                      : "Add skill"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {loginOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setLoginOpen(false)
          }
        >
          <section
            className="modal login-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-title"
          >
            <div className="modal-head">
              <div>
                <p className="eyebrow">OWNER ACCESS</p>
                <h2 id="login-title">Admin login</h2>
              </div>
              <button
                type="button"
                onClick={() => setLoginOpen(false)}
                aria-label="Close"
              >
                <X />
              </button>
            </div>

            <p className="login-help">
              Use the email and password you created in Supabase.
            </p>

            <form onSubmit={login}>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
              </label>

              <label>
                Password
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                />
              </label>

              {loginError && (
                <p className="login-error" role="alert">
                  {loginError}
                </p>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setLoginOpen(false)}
                >
                  Cancel
                </button>
                <button className="primary" disabled={saving}>
                  {saving ? "Logging in…" : "Log in"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
