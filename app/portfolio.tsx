"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUp,
  BarChart3,
  Bike,
  BookOpen,
  CalendarDays,
  Code2,
  ContactRound,
  ExternalLink,
  FolderKanban,
  Gamepad2,
  GraduationCap,
  Home,
  LogOut,
  MessageSquare,
  Monitor,
  Moon,
  Music2,
  Pencil,
  Plus,
  Save,
  Search,
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
const VISITOR_SESSION_ID_KEY = "portfolio_visitor_session_id_v1";
const VISITOR_NETWORK_SESSION_KEY = "portfolio_visitor_network_v2";
const PRIVACY_CONSENT_KEY = "portfolio_full_ip_consent_v1";
const FEEDBACK_SESSION_KEY = "portfolio_feedback_sent_v1";
const VISIT_MARKER = "__portfolio_visit_v1__";
const SUBMISSION_MARKER = "__portfolio_submission_v1__";
const COMMENT_META_MARKER = "__portfolio_comment_meta_v1__";
const SKILL_TYPE = "Skill";
const SKILL_META_TYPE = "SkillMeta";
const SKILL_META_TITLE = "__skills_initialized__";
const PROFILE_TYPE = "PortfolioProfile";
const HOBBY_TYPE = "PortfolioHobby";
const WORKING_STYLE_TYPE = "PortfolioWorkingStyle";
const CONTENT_META_TYPE = "PortfolioContentMeta";
const CONTENT_META_TITLE = "__editable_content_initialized__";

type Theme = "dark" | "light";
type MobileView = "home" | "about" | "works" | "skills" | "feedback" | "contact";
type PrivacyConsent = "unknown" | "accepted" | "declined";
export type PortfolioRoute =
  | "home"
  | "about"
  | "skills"
  | "projects"
  | "contact";

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
  visitorDetails?: VisitorDetails;
};

type SiteFeedback = {
  id: number;
  visitor_name: string;
  feedback: string;
  created_at: string;
  visitorDetails?: VisitorDetails;
};

type VisitorDetails = {
  sessionId: string;
  ipAddress: string;
  maskedIp?: string;
  approximateLocation: string;
  device: string;
  browser: string;
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

type ProfileContent = {
  id: number;
  about: string;
  school: string;
  program: string;
  section: string;
  professor: string;
  imageUrl: string;
  createdAt: string;
};

type ProfileForm = Omit<ProfileContent, "id" | "createdAt">;

type Hobby = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
};

type HobbyForm = Omit<Hobby, "id" | "createdAt">;

type WorkingStyle = {
  id: number;
  title: string;
  description: string;
  createdAt: string;
};

type WorkingStyleForm = Omit<WorkingStyle, "id" | "createdAt">;

type VisitDetails = {
  sessionId: string;
  device: string;
  browser: string;
  viewport: string;
  source: string;
  path: string;
  ipAddress: string;
  maskedIp?: string;
  approximateLocation: string;
};

type IpLocationResponse = {
  ip?: string;
  city?: string;
  region?: string;
  country_name?: string;
  error?: boolean;
};

type StoredSubmission = {
  marker: string;
  message: string;
  visitor: VisitorDetails;
};

type StoredCommentMetadata = {
  marker: string;
  commentId: number;
  visitor: VisitorDetails;
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

const DEFAULT_PROFILE: ProfileContent = {
  id: -1,
  about:
    "I’m a 2ND-YEAR BSIT student who enjoys turning school tasks into working ideas. I’m into cycling, gaming, music, and web design—and my goal is simple: become a vibe coder who keeps learning by building.",
  school: "BESTLINK COLLEGE OF THE PHILIPPINES",
  program: "BSIT · 2nd Year",
  section: "MV-21010",
  professor: "Mari Laynesa",
  imageUrl: "/profile.jpg",
  createdAt: "",
};

const DEFAULT_HOBBIES: Hobby[] = [
  {
    id: -1,
    title: "Cycling",
    description: "Focus, consistency, and a clear head.",
    imageUrl: "",
    createdAt: "",
  },
  {
    id: -2,
    title: "Gaming",
    description: "Curiosity, strategy, and problem-solving.",
    imageUrl: "",
    createdAt: "",
  },
  {
    id: -3,
    title: "Music",
    description: "A reset between projects and schoolwork.",
    imageUrl: "",
    createdAt: "",
  },
  {
    id: -4,
    title: "Web design",
    description: "Turning an idea into something people can use.",
    imageUrl: "",
    createdAt: "",
  },
];

const DEFAULT_WORKING_STYLES: WorkingStyle[] = [
  {
    id: -1,
    title: "Creative thinking",
    description: "Finding a cleaner way to solve a problem.",
    createdAt: "",
  },
  {
    id: -2,
    title: "Adaptability",
    description: "Learning through changes and feedback.",
    createdAt: "",
  },
  {
    id: -3,
    title: "Attention to detail",
    description: "Making the small parts feel intentional.",
    createdAt: "",
  },
  {
    id: -4,
    title: "Self-directed learning",
    description: "Building skills one project at a time.",
    createdAt: "",
  },
];

const emptyHobbyForm: HobbyForm = {
  title: "",
  description: "",
  imageUrl: "",
};

const emptyWorkingStyleForm: WorkingStyleForm = {
  title: "",
  description: "",
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

function fromProfileRow(row: ActivityRow): ProfileContent {
  try {
    const parsed = JSON.parse(row.description || "{}") as Partial<ProfileForm>;
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      id: row.id,
      createdAt: row.created_at,
    };
  } catch {
    return {
      ...DEFAULT_PROFILE,
      id: row.id,
      createdAt: row.created_at,
    };
  }
}

function toProfileRow(form: ProfileForm) {
  return {
    title: "__portfolio_profile__",
    type: PROFILE_TYPE,
    description: JSON.stringify(form),
    tools: "",
    learnings: "",
    thumbnail_url: "",
    evidence_url: "",
    completed_on: new Date().toISOString().slice(0, 10),
  };
}

function fromHobbyRow(row: ActivityRow): Hobby {
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    imageUrl: row.thumbnail_url || "",
    createdAt: row.created_at,
  };
}

function toHobbyRow(form: HobbyForm) {
  return {
    title: form.title.trim(),
    type: HOBBY_TYPE,
    description: form.description.trim(),
    tools: "",
    learnings: "",
    thumbnail_url: form.imageUrl.trim(),
    evidence_url: "",
    completed_on: new Date().toISOString().slice(0, 10),
  };
}

function fromWorkingStyleRow(row: ActivityRow): WorkingStyle {
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    createdAt: row.created_at,
  };
}

function toWorkingStyleRow(form: WorkingStyleForm) {
  return {
    title: form.title.trim(),
    type: WORKING_STYLE_TYPE,
    description: form.description.trim(),
    tools: "",
    learnings: "",
    thumbnail_url: "",
    evidence_url: "",
    completed_on: new Date().toISOString().slice(0, 10),
  };
}

function HobbyIcon({ title }: { title: string }) {
  const name = title.toLowerCase();
  if (name.includes("cycl")) return <Bike size={20} aria-hidden="true" />;
  if (name.includes("game")) return <Gamepad2 size={20} aria-hidden="true" />;
  if (name.includes("music")) return <Music2 size={20} aria-hidden="true" />;
  return <Code2 size={20} aria-hidden="true" />;
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

function displayPhilippineTime(value: Date) {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(value);
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

function getVisitorSessionId() {
  const existing = sessionStorage.getItem(VISITOR_SESSION_ID_KEY);
  if (existing) return existing;

  const nextId =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  sessionStorage.setItem(VISITOR_SESSION_ID_KEY, nextId);
  return nextId;
}

function readPrivacyConsent(): PrivacyConsent {
  const value = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(PRIVACY_CONSENT_KEY + "="))
    ?.split("=")[1];

  return value === "accepted" || value === "declined" ? value : "unknown";
}

function writePrivacyConsent(value: Exclude<PrivacyConsent, "unknown">) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${PRIVACY_CONSENT_KEY}=${value}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
}

async function getApproximateNetworkLocation() {
  const cached = sessionStorage.getItem(VISITOR_NETWORK_SESSION_KEY);
  if (cached) {
    try {
      return JSON.parse(cached) as Pick<
        VisitorDetails,
        "ipAddress" | "approximateLocation"
      >;
    } catch {
      sessionStorage.removeItem(VISITOR_NETWORK_SESSION_KEY);
    }
  }

  try {
    const response = await fetchWithTimeout(
      "https://ipapi.co/json/",
      {
        headers: { Accept: "application/json" },
        cache: "no-store",
      },
      5000,
    );
    const data = (await response.json()) as IpLocationResponse;
    if (!response.ok || data.error) throw new Error("Location unavailable.");

    const locationParts = [data.city, data.region, data.country_name]
      .map((part) => part?.trim())
      .filter((part): part is string => Boolean(part));

    const result = {
      ipAddress: data.ip?.trim() || "Unavailable",
      approximateLocation:
        [...new Set(locationParts)].join(", ") || "Unavailable",
    };
    sessionStorage.setItem(VISITOR_NETWORK_SESSION_KEY, JSON.stringify(result));
    return result;
  } catch {
    return {
      ipAddress: "Unavailable",
      approximateLocation: "Unavailable",
    };
  }
}

async function getVisitorDetails(): Promise<VisitorDetails> {
  if (readPrivacyConsent() !== "accepted") {
    return {
      sessionId: getVisitorSessionId(),
      ipAddress: "Not collected",
      approximateLocation: "Not collected",
      device: detectDevice(navigator.userAgent, window.innerWidth),
      browser: detectBrowser(navigator.userAgent),
    };
  }

  const network = await getApproximateNetworkLocation();
  return {
    sessionId: getVisitorSessionId(),
    ipAddress: network.ipAddress,
    approximateLocation: network.approximateLocation,
    device: detectDevice(navigator.userAgent, window.innerWidth),
    browser: detectBrowser(navigator.userAgent),
  };
}

function parseStoredSubmission(value: string) {
  try {
    const parsed = JSON.parse(value) as Partial<StoredSubmission>;
    if (
      parsed.marker !== SUBMISSION_MARKER ||
      typeof parsed.message !== "string" ||
      !parsed.visitor
    ) {
      return null;
    }
    return {
      message: parsed.message,
      visitorDetails: {
        ...parsed.visitor,
        ipAddress:
          parsed.visitor.ipAddress ||
          parsed.visitor.maskedIp ||
          "Not recorded",
      },
    };
  } catch {
    return null;
  }
}

function normalizeVisitorDetails(visitor: VisitorDetails): VisitorDetails {
  return {
    ...visitor,
    ipAddress: visitor.ipAddress || visitor.maskedIp || "Not recorded",
  };
}

function parseCommentMetadata(row: SiteFeedback) {
  if (row.visitor_name !== COMMENT_META_MARKER) return null;

  try {
    const parsed = JSON.parse(row.feedback) as Partial<StoredCommentMetadata>;
    if (
      parsed.marker !== COMMENT_META_MARKER ||
      typeof parsed.commentId !== "number" ||
      !parsed.visitor
    ) {
      return null;
    }

    return {
      commentId: parsed.commentId,
      visitor: normalizeVisitorDetails(parsed.visitor),
    };
  } catch {
    return null;
  }
}

function parseComment(row: ActivityComment): ActivityComment {
  const stored = parseStoredSubmission(row.comment);
  return stored
    ? { ...row, comment: stored.message, visitorDetails: stored.visitorDetails }
    : row;
}

function parseFeedback(row: SiteFeedback): SiteFeedback {
  const stored = parseStoredSubmission(row.feedback);
  return stored
    ? {
        ...row,
        feedback: stored.message,
        visitorDetails: stored.visitorDetails,
      }
    : row;
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
        ipAddress: String(
          details.ipAddress || details.maskedIp || "Not recorded",
        ),
        approximateLocation: String(
          details.approximateLocation || "Not recorded",
        ),
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

export default function Portfolio({ route = "home" }: { route?: PortfolioRoute }) {
  const [items, setItems] = useState<Activity[]>([]);
  const [skills, setSkills] = useState<PortfolioSkill[]>(DEFAULT_SKILLS);
  const [profile, setProfile] = useState<ProfileContent>(DEFAULT_PROFILE);
  const [hobbies, setHobbies] = useState<Hobby[]>(DEFAULT_HOBBIES);
  const [workingStyles, setWorkingStyles] = useState<WorkingStyle[]>(
    DEFAULT_WORKING_STYLES,
  );
  const [activityForm, setActivityForm] =
    useState<ActivityForm>(emptyActivityForm);
  const [skillForm, setSkillForm] = useState<SkillForm>(emptySkillForm);
  const [profileForm, setProfileForm] = useState<ProfileForm>(() => {
    const { id, createdAt, ...values } = DEFAULT_PROFILE;
    void id;
    void createdAt;
    return values;
  });
  const [hobbyForm, setHobbyForm] = useState<HobbyForm>(emptyHobbyForm);
  const [workingStyleForm, setWorkingStyleForm] =
    useState<WorkingStyleForm>(emptyWorkingStyleForm);
  const [editingActivityId, setEditingActivityId] = useState<number | null>(
    null,
  );
  const [editingSkillId, setEditingSkillId] = useState<number | null>(null);
  const [editingHobbyId, setEditingHobbyId] = useState<number | null>(null);
  const [editingWorkingStyleId, setEditingWorkingStyleId] = useState<
    number | null
  >(null);
  const [session, setSession] = useState<Session | null>(null);
  const [comments, setComments] = useState<ActivityComment[]>([]);
  const [commentMetadata, setCommentMetadata] = useState<
    Record<number, VisitorDetails>
  >({});
  const [feedback, setFeedback] = useState<SiteFeedback[]>([]);
  const [visits, setVisits] = useState<VisitLog[]>([]);
  const [commentDrafts, setCommentDrafts] = useState<
    Record<number, { name: string; text: string }>
  >({});
  const [activityOpen, setActivityOpen] = useState(false);
  const [skillOpen, setSkillOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [hobbyOpen, setHobbyOpen] = useState(false);
  const [workingStyleOpen, setWorkingStyleOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>(
    route === "projects"
      ? "works"
      : route === "about"
        ? "about"
        : route === "skills"
          ? "skills"
          : route === "contact"
            ? "contact"
            : "home",
  );
  const [theme, setTheme] = useState<Theme>("dark");
  const [loading, setLoading] = useState(true);
  const [skillsReady, setSkillsReady] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState("");
  const [notice, setNotice] = useState("");
  const [loginError, setLoginError] = useState("");
  const [privacyConsent, setPrivacyConsent] =
    useState<PrivacyConsent>("unknown");
  const [projectQuery, setProjectQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState<
    "All" | "Activity" | "Project"
  >("All");
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [homePreviewIndex, setHomePreviewIndex] = useState(0);

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
      const hiddenTypes = new Set([
        SKILL_TYPE,
        SKILL_META_TYPE,
        PROFILE_TYPE,
        HOBBY_TYPE,
        WORKING_STYLE_TYPE,
        CONTENT_META_TYPE,
      ]);
      const regularRows = rows.filter(
        (row) => !hiddenTypes.has(row.type),
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
      const profileRow = rows.find((row) => row.type === PROFILE_TYPE);
      const hobbyRows = rows
        .filter((row) => row.type === HOBBY_TYPE)
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
      const workingStyleRows = rows
        .filter((row) => row.type === WORKING_STYLE_TYPE)
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
      const hasContentMarker = rows.some(
        (row) =>
          row.type === CONTENT_META_TYPE && row.title === CONTENT_META_TITLE,
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
      setProfile(profileRow ? fromProfileRow(profileRow) : DEFAULT_PROFILE);
      setHobbies(
        hobbyRows.length > 0 ? hobbyRows.map(fromHobbyRow) : DEFAULT_HOBBIES,
      );
      setWorkingStyles(
        workingStyleRows.length > 0
          ? workingStyleRows.map(fromWorkingStyleRow)
          : DEFAULT_WORKING_STYLES,
      );
      setContentReady(hasContentMarker);
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
      if (response.ok) {
        setComments((data as ActivityComment[]).map(parseComment));
      }
    } catch {
      /* Comments stay optional if the connection is unavailable. */
    }
  }

  async function loadAdminData(activeSession: Session) {
    try {
      const recordsUrl =
        SUPABASE_URL +
        "/rest/v1/site_feedback?select=*&order=created_at.desc&limit=300";
      const recordsResponse = await fetchWithTimeout(recordsUrl, {
        headers: apiHeaders(activeSession),
        cache: "no-store",
      });

      if (recordsResponse.ok) {
        const rows = (await recordsResponse.json()) as SiteFeedback[];
        setFeedback(
          rows
            .filter(
              (row) =>
                row.visitor_name !== VISIT_MARKER &&
                row.visitor_name !== COMMENT_META_MARKER,
            )
            .slice(0, 100)
            .map(parseFeedback),
        );
        setVisits(
          rows
            .filter((row) => row.visitor_name === VISIT_MARKER)
            .slice(0, 100)
            .map(parseVisit)
            .filter((entry): entry is VisitLog => entry !== null),
        );

        const nextCommentMetadata: Record<number, VisitorDetails> = {};
        rows.forEach((row) => {
          const metadata = parseCommentMetadata(row);
          if (metadata) {
            nextCommentMetadata[metadata.commentId] = metadata.visitor;
          }
        });
        setCommentMetadata(nextCommentMetadata);
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

  async function ensureEditableContentSeeded(activeSession: Session) {
    const response = await fetchWithTimeout(
      SUPABASE_URL +
        "/rest/v1/activities?select=*&type=in.(PortfolioProfile,PortfolioHobby,PortfolioWorkingStyle,PortfolioContentMeta)&order=created_at.asc",
      { headers: apiHeaders(activeSession), cache: "no-store" },
    );
    const rows = (await response.json()) as ActivityRow[];

    if (!response.ok) {
      throw new Error("Profile content could not be prepared for editing.");
    }

    const hasMarker = rows.some(
      (row) =>
        row.type === CONTENT_META_TYPE && row.title === CONTENT_META_TITLE,
    );

    if (!hasMarker) {
      const payload = [
        ...(!rows.some((row) => row.type === PROFILE_TYPE)
          ? (() => {
              const { id, createdAt, ...profileValues } = DEFAULT_PROFILE;
              void id;
              void createdAt;
              return [toProfileRow(profileValues)];
            })()
          : []),
        ...(!rows.some((row) => row.type === HOBBY_TYPE)
          ? DEFAULT_HOBBIES.map(({ id, createdAt, ...hobby }) => {
              void id;
              void createdAt;
              return toHobbyRow(hobby);
            })
          : []),
        ...(!rows.some((row) => row.type === WORKING_STYLE_TYPE)
          ? DEFAULT_WORKING_STYLES.map(({ id, createdAt, ...workingStyle }) => {
              void id;
              void createdAt;
              return toWorkingStyleRow(workingStyle);
            })
          : []),
        {
          title: CONTENT_META_TITLE,
          type: CONTENT_META_TYPE,
          description:
            "Keeps deliberately empty hobbies and working styles from resetting.",
          tools: "",
          learnings: "",
          thumbnail_url: "",
          evidence_url: "",
          completed_on: new Date().toISOString().slice(0, 10),
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
        throw new Error("Profile content could not be prepared for editing.");
      }
    }

    setContentReady(true);
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
        ensureEditableContentSeeded(activeSession),
      ]);
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  async function recordVisit() {
    if (
      sessionStorage.getItem(VISIT_SESSION_KEY) ||
      localStorage.getItem(SESSION_KEY) ||
      readPrivacyConsent() !== "accepted"
    ) {
      return;
    }

    sessionStorage.setItem(VISIT_SESSION_KEY, "pending");
    const sessionId = getVisitorSessionId();

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

    const networkLocation = await getApproximateNetworkLocation();

    const details: VisitDetails = {
      sessionId,
      device: detectDevice(navigator.userAgent, window.innerWidth),
      browser: detectBrowser(navigator.userAgent),
      viewport: window.innerWidth + " × " + window.innerHeight,
      source,
      path: window.location.pathname,
      ipAddress: networkLocation.ipAddress,
      approximateLocation: networkLocation.approximateLocation,
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

    const hash = window.location.hash.replace("#", "");
    const hashView: Record<string, MobileView> = {
      home: "home",
      about: "about",
      works: "works",
      skills: "skills",
      feedback: "feedback",
      contact: "contact",
    };

    document.documentElement.dataset.theme = nextTheme;
    const stateTimer = window.setTimeout(() => {
      setTheme(nextTheme);
      setFeedbackSent(sessionStorage.getItem(FEEDBACK_SESSION_KEY) === "done");
      if (hashView[hash]) setMobileView(hashView[hash]);
    }, 0);

    void loadPortfolioContent();
    void loadComments();

    const storedSession = localStorage.getItem(SESSION_KEY);
    const nextConsent = readPrivacyConsent();
    setPrivacyConsent(nextConsent);
    let visitTimer = 0;

    if (storedSession) {
      void restoreSession(storedSession);
    } else if (nextConsent === "accepted") {
      visitTimer = window.setTimeout(() => void recordVisit(), 800);
    }

    return () => {
      window.clearTimeout(stateTimer);
      if (visitTimer) window.clearTimeout(visitTimer);
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 5000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date());
    updateTime();
    const timer = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const updateBackToTop = () => setShowBackToTop(window.scrollY > 520);
    updateBackToTop();
    window.addEventListener("scroll", updateBackToTop, { passive: true });
    return () => window.removeEventListener("scroll", updateBackToTop);
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("is-page-leaving");
  }, [route]);

  const dialogOpen =
    activityOpen || skillOpen || profileOpen || hobbyOpen ||
    workingStyleOpen || loginOpen;

  useEffect(() => {
    if (!dialogOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";

    const dialog = document.querySelector<HTMLElement>(
      '.modal-backdrop [role="dialog"]',
    );
    const controls = () =>
      Array.from(dialog?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]',
      ) || []).filter((element) => element.getClientRects().length > 0);

    const focusFrame = window.requestAnimationFrame(() => {
      const firstField = dialog?.querySelector<HTMLElement>("input, textarea, select");
      (firstField || controls()[0])?.focus({ preventScroll: true });
    });

    const handleDialogKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setActivityOpen(false);
        setSkillOpen(false);
        setProfileOpen(false);
        setHobbyOpen(false);
        setWorkingStyleOpen(false);
        setLoginOpen(false);
      }
      if (event.key !== "Tab") return;
      const buttons = controls();
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleDialogKey);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", handleDialogKey);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, [dialogOpen]);

  useEffect(() => {
    if (items.length < 2) return;
    const previewTimer = window.setInterval(() => {
      setHomePreviewIndex((current) => (current + 1) % items.length);
    }, 3600);
    return () => window.clearInterval(previewTimer);
  }, [items.length]);

  const counts = useMemo(
    () => ({
      all: items.length,
      activities: items.filter((item) => item.type === "Activity").length,
      projects: items.filter((item) => item.type === "Project").length,
    }),
    [items],
  );

  const filteredItems = useMemo(() => {
    const query = projectQuery.trim().toLowerCase();

    return items.filter((item) => {
      const matchesType =
        projectFilter === "All" || item.type === projectFilter;
      const searchable = [item.title, item.description, item.tools]
        .join(" ")
        .toLowerCase();
      return matchesType && (!query || searchable.includes(query));
    });
  }, [items, projectFilter, projectQuery]);

  const previewItem = items.length
    ? items[homePreviewIndex % items.length]
    : null;

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem(THEME_KEY, nextTheme);
    setTheme(nextTheme);
  }

  function acceptPrivacyTracking() {
    writePrivacyConsent("accepted");
    setPrivacyConsent("accepted");
    void recordVisit();
  }

  function declinePrivacyTracking() {
    writePrivacyConsent("declined");
    sessionStorage.removeItem(VISITOR_NETWORK_SESSION_KEY);
    setPrivacyConsent("declined");
  }

  function reopenPrivacySettings() {
    setPrivacyConsent("unknown");
  }

  function showMobileView(nextView: MobileView) {
    const destinations: Record<MobileView, string> = {
      home: "/",
      about: "/about",
      works: "/projects",
      skills: "/skills",
      feedback: "/contact#feedback",
      contact: "/contact",
    };

    const destination = destinations[nextView];
    const isCurrentPage =
      (nextView === "home" && route === "home") ||
      (nextView === "about" && route === "about") ||
      (nextView === "works" && route === "projects") ||
      (nextView === "skills" && route === "skills") ||
      ((nextView === "feedback" || nextView === "contact") &&
        route === "contact");

    if (!isCurrentPage) {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion) {
        window.location.assign(destination);
        return;
      }
      document.documentElement.classList.add("is-page-leaving");
      window.setTimeout(() => window.location.assign(destination), 360);
      return;
    }

    setMobileView(nextView);
    if (route === "contact") {
      window.history.replaceState(null, "", destination);
    }
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
        ensureEditableContentSeeded(nextSession),
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
    setCommentMetadata({});
    setNotice("Logged out. The portfolio is back in view-only mode.");
  }

  async function submitComment(
    event: FormEvent<HTMLFormElement>,
    activityId: number,
  ) {
    event.preventDefault();
    const draft = commentDrafts[activityId] ?? { name: "", text: "" };
    if (draft.name.trim().length < 2 || draft.text.trim().length < 3) return;

    setSaving(true);
    try {
      const visitorDetails = await getVisitorDetails();
      const response = await fetchWithTimeout(
        SUPABASE_URL + "/rest/v1/activity_comments",
        {
          method: "POST",
          headers: { ...apiHeaders(), Prefer: "return=representation" },
          body: JSON.stringify({
            activity_id: activityId,
            visitor_name: draft.name.trim(),
            comment: draft.text.trim(),
          }),
        },
      );
      if (!response.ok) throw new Error("Comment failed.");

      const insertedRows = (await response.json()) as ActivityComment[];
      const insertedComment = insertedRows[0];
      if (insertedComment?.id) {
        await fetchWithTimeout(
          SUPABASE_URL + "/rest/v1/site_feedback",
          {
            method: "POST",
            headers: { ...apiHeaders(), Prefer: "return=minimal" },
            body: JSON.stringify({
              visitor_name: COMMENT_META_MARKER,
              feedback: JSON.stringify({
                marker: COMMENT_META_MARKER,
                commentId: insertedComment.id,
                visitor: visitorDetails,
              }),
            }),
          },
        );
      }

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
      const visitorDetails = await getVisitorDetails();
      const response = await fetchWithTimeout(
        SUPABASE_URL + "/rest/v1/site_feedback",
        {
          method: "POST",
          headers: { ...apiHeaders(), Prefer: "return=minimal" },
          body: JSON.stringify({
            visitor_name: String(values.get("visitor_name") ?? "").trim(),
            feedback: JSON.stringify({
              marker: SUBMISSION_MARKER,
              message: String(values.get("feedback") ?? "").trim(),
              visitor: visitorDetails,
            }),
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

  async function uploadImage(
    file: File,
    onUploaded: (imageUrl: string) => void,
  ) {
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

      onUploaded(
        SUPABASE_URL +
          "/storage/v1/object/public/activity-thumbnails/" +
          fileName,
      );
      setNotice("Image uploaded and optimized.");
    } catch {
      setNotice("Hindi na-upload ang image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function uploadThumbnail(file: File) {
    await uploadImage(file, (imageUrl) => {
      setActivityForm((current) => ({ ...current, thumbnailUrl: imageUrl }));
    });
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

  function requestEditProfile() {
    if (!session) {
      setLoginError("");
      setLoginOpen(true);
      return;
    }
    if (!contentReady) {
      setNotice("Profile editor is still preparing. Please try again shortly.");
      return;
    }

    const { id, createdAt, ...values } = profile;
    void id;
    void createdAt;
    setProfileForm(values);
    setProfileOpen(true);
  }

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !contentReady) return;

    setSaving(true);
    try {
      const response = await fetchWithTimeout(
        SUPABASE_URL + "/rest/v1/activities?id=eq." + profile.id,
        {
          method: "PATCH",
          headers: { ...apiHeaders(session), Prefer: "return=representation" },
          body: JSON.stringify(toProfileRow(profileForm)),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Profile could not be saved.");
      }

      await loadPortfolioContent();
      setProfileOpen(false);
      setNotice("About me updated.");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Profile could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  function requestAddHobby() {
    if (!session) {
      setLoginError("");
      setLoginOpen(true);
      return;
    }
    if (!contentReady) {
      setNotice("Hobby editor is still preparing. Please try again shortly.");
      return;
    }

    setEditingHobbyId(null);
    setHobbyForm(emptyHobbyForm);
    setHobbyOpen(true);
  }

  function startEditHobby(hobby: Hobby) {
    if (!session || !contentReady || hobby.id < 0) return;
    setEditingHobbyId(hobby.id);
    setHobbyForm({
      title: hobby.title,
      description: hobby.description,
      imageUrl: hobby.imageUrl,
    });
    setHobbyOpen(true);
  }

  async function submitHobby(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !contentReady) return;

    setSaving(true);
    const url = editingHobbyId
      ? SUPABASE_URL + "/rest/v1/activities?id=eq." + editingHobbyId
      : SUPABASE_URL + "/rest/v1/activities";

    try {
      const response = await fetchWithTimeout(url, {
        method: editingHobbyId ? "PATCH" : "POST",
        headers: { ...apiHeaders(session), Prefer: "return=representation" },
        body: JSON.stringify(toHobbyRow(hobbyForm)),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Hobby could not be saved.");
      }

      await loadPortfolioContent();
      setHobbyOpen(false);
      setNotice(editingHobbyId ? "Hobby updated." : "Hobby added.");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Hobby could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeHobby(hobby: Hobby) {
    if (
      !session ||
      hobby.id < 0 ||
      !window.confirm("Remove “" + hobby.title + "” from your hobbies?")
    ) {
      return;
    }

    const response = await fetchWithTimeout(
      SUPABASE_URL + "/rest/v1/activities?id=eq." + hobby.id,
      { method: "DELETE", headers: apiHeaders(session) },
    );
    if (response.ok) {
      setHobbies((current) => current.filter((entry) => entry.id !== hobby.id));
      setNotice("Hobby removed.");
    } else {
      setNotice("Hobby could not be removed.");
    }
  }

  function requestAddWorkingStyle() {
    if (!session) {
      setLoginError("");
      setLoginOpen(true);
      return;
    }
    if (!contentReady) {
      setNotice("Working style editor is still preparing. Please try again shortly.");
      return;
    }

    setEditingWorkingStyleId(null);
    setWorkingStyleForm(emptyWorkingStyleForm);
    setWorkingStyleOpen(true);
  }

  function startEditWorkingStyle(style: WorkingStyle) {
    if (!session || !contentReady || style.id < 0) return;
    setEditingWorkingStyleId(style.id);
    setWorkingStyleForm({ title: style.title, description: style.description });
    setWorkingStyleOpen(true);
  }

  async function submitWorkingStyle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !contentReady) return;

    setSaving(true);
    const url = editingWorkingStyleId
      ? SUPABASE_URL +
        "/rest/v1/activities?id=eq." +
        editingWorkingStyleId
      : SUPABASE_URL + "/rest/v1/activities";

    try {
      const response = await fetchWithTimeout(url, {
        method: editingWorkingStyleId ? "PATCH" : "POST",
        headers: { ...apiHeaders(session), Prefer: "return=representation" },
        body: JSON.stringify(toWorkingStyleRow(workingStyleForm)),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Working style could not be saved.");
      }

      await loadPortfolioContent();
      setWorkingStyleOpen(false);
      setNotice(
        editingWorkingStyleId
          ? "Working style updated."
          : "Working style added.",
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Working style could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeWorkingStyle(style: WorkingStyle) {
    if (
      !session ||
      style.id < 0 ||
      !window.confirm("Remove “" + style.title + "” from working style?")
    ) {
      return;
    }

    const response = await fetchWithTimeout(
      SUPABASE_URL + "/rest/v1/activities?id=eq." + style.id,
      { method: "DELETE", headers: apiHeaders(session) },
    );
    if (response.ok) {
      setWorkingStyles((current) =>
        current.filter((entry) => entry.id !== style.id),
      );
      setNotice("Working style removed.");
    } else {
      setNotice("Working style could not be removed.");
    }
  }

  const homeActive =
    mobileView === "home" ? " is-active" : "";
  const aboutActive =
    mobileView === "home" || mobileView === "about" ? " is-active" : "";
  const worksActive =
    mobileView === "works" ? " is-active" : "";
  const skillsActive =
    mobileView === "skills" ? " is-active" : "";
  const feedbackActive =
    mobileView === "feedback" ? " is-active" : "";
  const contactActive =
    mobileView === "contact" ? " is-active" : "";
  const footerActive =
    mobileView === "contact" || mobileView === "feedback" ? " is-active" : "";

  return (
    <main
      className={
        route === "home" ? "portfolio-app" : "portfolio-app route-" + route
      }
      data-mobile-view={mobileView}
    >
      <div className="page-transition-curtain" aria-hidden="true">
        <span>CA.</span>
      </div>
      <nav className="nav" aria-label="Main navigation">
        <Link
          className="brand"
          href="/"
          data-page-link
          aria-label="Carl Anthony home"
        >
          <img
            className="brand-logo"
            src="/ca-navbar-logo.png"
            alt=""
          />
          <span className="mobile-brand-copy" aria-hidden="true">
            <strong>Carl Anthony</strong>
            <small>Student portfolio</small>
          </span>
        </Link>

        <div className="nav-links">
          <Link href="/" data-page-link>
            Home
          </Link>
          <Link href="/about" data-page-link>
            About
          </Link>
          <Link href="/projects" data-page-link>
            Activities
          </Link>
          <Link href="/skills" data-page-link>
            Skills
          </Link>
          <Link href="/contact#feedback" data-page-link>
            Feedback
          </Link>
          <Link href="/contact" data-page-link>
            Contact
          </Link>
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

      <nav className="nav-rail" aria-label="Portfolio index">
        <Link
          className={route === "home" ? "active" : ""}
          href="/"
          data-page-link
          aria-label="Home"
          aria-current={route === "home" ? "page" : undefined}
        >
          <span>01</span>
          <Home size={15} aria-hidden="true" />
        </Link>
        <Link
          className={route === "about" ? "active" : ""}
          href="/about"
          data-page-link
          aria-label="About"
          aria-current={route === "about" ? "page" : undefined}
        >
          <span>02</span>
          <UserRound size={15} aria-hidden="true" />
        </Link>
        <Link
          className={route === "projects" ? "active" : ""}
          href="/projects"
          data-page-link
          aria-label="Activities and projects"
          aria-current={route === "projects" ? "page" : undefined}
        >
          <span>03</span>
          <FolderKanban size={15} aria-hidden="true" />
        </Link>
        <Link
          className={route === "skills" ? "active" : ""}
          href="/skills"
          data-page-link
          aria-label="Skills"
          aria-current={route === "skills" ? "page" : undefined}
        >
          <span>04</span>
          <Sparkles size={15} aria-hidden="true" />
        </Link>
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
        className={
          "hero shell page-section page-home-section mobile-panel mobile-home" +
          homeActive
        }
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
            Building ideas
            <br />
            <span>with intent.</span>
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
            <Link
              className="secondary mobile-work-button"
              href="/projects"
              data-page-link
            >
              View my work
            </Link>
            <Link
              className="secondary desktop-work-link"
              href="/projects"
              data-page-link
            >
              View my work
            </Link>
          </div>
          <div className="live-status" aria-live="polite">
            <span className="live-status-label">Philippine time</span>
            <strong>
              {currentTime ? displayPhilippineTime(currentTime) : "Loading time..."}
            </strong>
          </div>
        </div>

        <div className="home-showcase" aria-label="A preview of the portfolio">
          <div className="showcase-noise" aria-hidden="true" />
          {previewItem?.thumbnailUrl && (
            <img
              className="showcase-preview-image"
              src={previewItem.thumbnailUrl}
              alt=""
              aria-hidden="true"
            />
          )}
          <div className="showcase-orbit orbit-one" aria-hidden="true" />
          <div className="showcase-orbit orbit-two" aria-hidden="true" />
          <div className="showcase-profile">
            <img
              src={profile.imageUrl || "/profile.jpg"}
              alt="Carl Anthony Eguizabal"
              width={1254}
              height={1254}
              decoding="async"
              fetchPriority="high"
            />
            <span>CARL A. EGUIZABAL</span>
          </div>
          <div className="showcase-preview-card" key={previewItem?.id || "intro"}>
            <div className="preview-card-top">
              <span>PORTFOLIO PREVIEW</span>
              <b>
                {String((items.length ? homePreviewIndex % items.length : 0) + 1).padStart(2, "0")}
                /{String(Math.max(items.length, 1)).padStart(2, "0")}
              </b>
            </div>
            <p className="preview-type">{previewItem?.type || "ACADEMIC WORK"}</p>
            <strong>{previewItem?.title || "Activities, projects & growth"}</strong>
            <p>
              {previewItem?.description ||
                "A quick look at the school outputs, skills, and ideas inside this portfolio."}
            </p>
            <Link href="/projects" data-page-link>
              Explore work <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="showcase-caption">
            <span className="status-dot" aria-hidden="true" />
            Updated as I learn
          </div>
        </div>
      </section>

      <section
        className={
          "section shell page-section page-about-section mobile-panel mobile-home" +
          aboutActive
        }
        id="about"
      >
        <div className="section-heading">
          <span>01</span>
          <div>
            <p>PROFILE</p>
            <h2>About me</h2>
          </div>
          {session && (
            <button className="secondary heading-action" onClick={requestEditProfile}>
              <Pencil size={17} /> Edit about
            </button>
          )}
        </div>
        <div className="about-grid">
          <p className="about-lead">{profile.about}</p>
          <dl className="student-info">
            <div>
              <dt>School</dt>
              <dd>{profile.school}</dd>
            </div>
            <div>
              <dt>Program & Year</dt>
              <dd>{profile.program}</dd>
            </div>
            <div>
              <dt>Section</dt>
              <dd>{profile.section}</dd>
            </div>
            <div>
              <dt>Professor</dt>
              <dd>{profile.professor}</dd>
            </div>
          </dl>
        </div>
        <div className="interest-heading">
          <p className="eyebrow">OUTSIDE THE SCREEN</p>
          {session && (
            <button className="text-button" type="button" onClick={requestAddHobby}>
              <Plus size={16} /> Add hobby
            </button>
          )}
        </div>
        <div className="interest-grid" aria-label="Personal interests">
          {hobbies.map((hobby) => (
            <article className={hobby.imageUrl ? "has-image" : ""} key={hobby.id}>
              {hobby.imageUrl ? (
                <img src={hobby.imageUrl} alt="" aria-hidden="true" />
              ) : (
                <HobbyIcon title={hobby.title} />
              )}
              <div className="interest-copy">
                <strong>{hobby.title}</strong>
                <span>{hobby.description || "A little part of who I am."}</span>
              </div>
              {session && contentReady && hobby.id > 0 && (
                <div className="content-card-actions">
                  <button
                    type="button"
                    onClick={() => startEditHobby(hobby)}
                    aria-label={"Edit " + hobby.title}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    className="delete"
                    onClick={() => removeHobby(hobby)}
                    aria-label={"Remove " + hobby.title}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section
        className={
          "section works-section page-section page-projects-section mobile-panel mobile-works" +
          worksActive
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

          <div className="project-explorer" aria-label="Search and filter activities">
            <label className="project-search">
              <Search size={17} aria-hidden="true" />
              <input
                type="search"
                value={projectQuery}
                onChange={(event) => setProjectQuery(event.target.value)}
                placeholder="Search activities, tools, or projects"
              />
            </label>
            <div className="filter-group" aria-label="Filter work type">
              {(["All", "Activity", "Project"] as const).map((filter) => (
                <button
                  type="button"
                  className={projectFilter === filter ? "active" : ""}
                  onClick={() => setProjectFilter(filter)}
                  key={filter}
                >
                  {filter === "All" ? "All work" : filter + "s"}
                </button>
              ))}
            </div>
          </div>
          {!loading && items.length > 0 && (
            <p className="result-count">
              Showing {filteredItems.length} of {items.length} saved outputs
            </p>
          )}

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
          ) : filteredItems.length === 0 ? (
            <div className="empty-state compact-empty">
              <Search size={30} />
              <h3>No matching work found.</h3>
              <p>Try a different keyword or choose another work type.</p>
            </div>
          ) : (
            <div className="work-grid">
              {filteredItems.map((item, index) => {
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
                            {itemComments.map((entry) => {
                              const visitorDetails =
                                entry.visitorDetails ||
                                commentMetadata[entry.id];

                              return (
                                <div className="comment" key={entry.id}>
                                <div>
                                  <strong>{entry.visitor_name}</strong>
                                  <time>
                                    {displayDate(entry.created_at, true)}
                                  </time>
                                </div>
                                <p>{entry.comment}</p>
                                {session && visitorDetails && (
                                  <small className="submission-meta">
                                    {visitorDetails.approximateLocation} · IP{" "}
                                    {visitorDetails.ipAddress} ·{" "}
                                    {visitorDetails.device}/
                                    {visitorDetails.browser}
                                  </small>
                                )}
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
                              );
                            })}
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
        className={
          "section shell page-section page-skills-section mobile-panel mobile-skills" +
          skillsActive
        }
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
        <div className="personal-skills" aria-label="Working style">
          <div className="working-style-heading">
            <p className="eyebrow">WORKING STYLE</p>
            {session && (
              <button
                className="text-button"
                type="button"
                onClick={requestAddWorkingStyle}
              >
                <Plus size={16} /> Add style
              </button>
            )}
          </div>
          <div className="working-style-grid">
            {workingStyles.map((style) => (
              <article key={style.id}>
                <strong>{style.title}</strong>
                {style.description && <span>{style.description}</span>}
                {session && contentReady && style.id > 0 && (
                  <div className="content-card-actions">
                    <button
                      type="button"
                      onClick={() => startEditWorkingStyle(style)}
                      aria-label={"Edit " + style.title}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      className="delete"
                      onClick={() => removeWorkingStyle(style)}
                      aria-label={"Remove " + style.title}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className={
          "reflection page-section page-home-section mobile-panel mobile-home" +
          homeActive
        }
        aria-label="Portfolio reflection"
      >
        <div className="shell">
          <GraduationCap />
          <p>
            “Vibe Coder lang po ako!!”
          </p>
        </div>
      </section>

      <section
        className={
          "section shell page-section page-contact-section feedback-section mobile-panel mobile-feedback" +
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
            <p className="privacy-note">
              Privacy notice: after consent, one visit is recorded per browser
              tab with your full public IP, IP-based approximate city/region,
              device, browser, source, and page. Feedback and comments store the
              same details for owner-only analytics and moderation when cookies
              are accepted. Records stay until the owner deletes them. Exact GPS
              is never requested.
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
                      {entry.visitorDetails && (
                        <small className="submission-meta">
                          {entry.visitorDetails.approximateLocation} · IP{" "}
                          {entry.visitorDetails.ipAddress} ·{" "}
                          {entry.visitorDetails.device}/
                          {entry.visitorDetails.browser}
                        </small>
                      )}
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
                Consent-based sessions only. Full public IP and IP-based
                approximate location are visible only in admin mode. Exact GPS
                is never requested.
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
                        <span>{entry.details.approximateLocation}</span>
                        <span>
                          IP {entry.details.ipAddress} · {entry.details.viewport}
                        </span>
                        <span>
                          {entry.details.source} · {entry.details.path}
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

      <section
        className={
          "section shell page-section page-contact-section contact-section mobile-panel mobile-contact" +
          contactActive
        }
        id="contact"
      >
        <div className="section-heading">
          <span>05</span>
          <div>
            <p>CONTACT</p>
            <h2>Let&apos;s connect</h2>
          </div>
        </div>
        <p className="contact-lead">
          Questions, feedback, or a quick hello? You can reach me through any
          of these channels.
        </p>
        <div className="contact-grid">
          <a href="tel:+639451973528">
            <span>PHONE</span>
            <strong>0945 197 3528</strong>
            <em>Call or text</em>
          </a>
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=eguizabalcarl77@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>EMAIL</span>
            <strong>Send an email</strong>
            <em>eguizabalcarl77@gmail.com</em>
          </a>
          <a
            href="https://github.com/carlanthonyeguizabal1504"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>GITHUB</span>
            <strong>View my code</strong>
            <em>@carlanthonyeguizabal1504</em>
          </a>
        </div>
      </section>

      <footer
        className={
          "site-footer page-section page-contact-section mobile-panel mobile-contact" +
          footerActive
        }
      >
        <div className="shell site-footer-inner">
          <Link className="footer-mark" href="/" data-page-link>
            CA<span>.</span>
          </Link>
          <p>
            © 2026 Carl Anthony Eguizabal<br />
            Academic portfolio for IT ELECTIVE 1.
          </p>
          <div>
            <button type="button" onClick={reopenPrivacySettings}>
              Privacy settings
            </button>
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

      <button
        className={"back-to-top" + (showBackToTop ? " is-visible" : "")}
        type="button"
        data-scroll-top
        aria-label="Back to top"
      >
        <ArrowUp size={18} aria-hidden="true" />
        <span>Top</span>
      </button>

      {!session && privacyConsent === "unknown" && (
        <aside
          className="privacy-banner"
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-banner-title"
          aria-describedby="privacy-banner-description"
        >
          <div>
            <strong id="privacy-banner-title">Cookies & visitor privacy</strong>
            <p id="privacy-banner-description">
              If you accept, this portfolio stores one visit per browser tab
              with your full public IP, approximate city/region, device, browser,
              source, and page. It is visible only to the portfolio owner and is
              kept until deleted. The same choice applies to comments and
              feedback. Exact GPS is not requested.
            </p>
          </div>
          <div className="privacy-actions">
            <button
              type="button"
              className="secondary"
              onClick={declinePrivacyTracking}
            >
              Decline
            </button>
            <button
              type="button"
              className="primary"
              onClick={acceptPrivacyTracking}
            >
              Accept
            </button>
          </div>
        </aside>
      )}

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <button
          className={mobileView === "home" ? "active" : ""}
          type="button"
          onClick={() => showMobileView("home")}
          aria-label="Home"
          aria-current={mobileView === "home" ? "page" : undefined}
        >
          <Home size={20} />
          <span>Home</span>
        </button>
        <button
          className={mobileView === "about" ? "active" : ""}
          type="button"
          onClick={() => showMobileView("about")}
          aria-label="About"
          aria-current={mobileView === "about" ? "page" : undefined}
        >
          <UserRound size={20} />
          <span>About</span>
        </button>
        <button
          className={mobileView === "works" ? "active" : ""}
          type="button"
          onClick={() => showMobileView("works")}
          aria-label="Work"
          aria-current={mobileView === "works" ? "page" : undefined}
        >
          <FolderKanban size={20} />
          <span>Work</span>
        </button>
        <button
          className={mobileView === "skills" ? "active" : ""}
          type="button"
          onClick={() => showMobileView("skills")}
          aria-label="Skills"
          aria-current={mobileView === "skills" ? "page" : undefined}
        >
          <Sparkles size={20} />
          <span>Skills</span>
        </button>
        <button
          className={mobileView === "feedback" ? "active" : ""}
          type="button"
          onClick={() => showMobileView("feedback")}
          aria-label="Feedback"
          aria-current={mobileView === "feedback" ? "page" : undefined}
        >
          <MessageSquare size={20} />
          <span>Feedback</span>
        </button>
        <button
          className={mobileView === "contact" ? "active" : ""}
          type="button"
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

      {profileOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setProfileOpen(false)
          }
        >
          <section
            className="modal content-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-form-title"
          >
            <div className="modal-head">
              <div>
                <p className="eyebrow">PROFILE CONTENT</p>
                <h2 id="profile-form-title">Edit about me</h2>
              </div>
              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                aria-label="Close"
              >
                <X />
              </button>
            </div>
            <form onSubmit={submitProfile}>
              <label>
                About me *
                <textarea
                  required
                  minLength={20}
                  maxLength={1000}
                  rows={5}
                  value={profileForm.about}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      about: event.target.value,
                    }))
                  }
                />
              </label>
              <div className="form-row">
                <label>
                  School *
                  <input
                    required
                    value={profileForm.school}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        school: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Program & year *
                  <input
                    required
                    value={profileForm.program}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        program: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Section *
                  <input
                    required
                    value={profileForm.section}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        section: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Professor *
                  <input
                    required
                    value={profileForm.professor}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        professor: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
              <label>
                Profile image URL (optional)
                <input
                  type="url"
                  value={profileForm.imageUrl}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      imageUrl: event.target.value,
                    }))
                  }
                  placeholder="Paste an image link or upload one below"
                />
              </label>
              <label>
                Upload profile image (JPG, PNG, or WebP)
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploadingImage}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    void uploadImage(file, (imageUrl) => {
                      setProfileForm((current) => ({
                        ...current,
                        imageUrl,
                      }));
                    });
                  }}
                />
              </label>
              {profileForm.imageUrl && (
                <div className="thumbnail-preview compact-preview">
                  <img
                    src={profileForm.imageUrl}
                    alt="Profile preview"
                    width={500}
                    height={500}
                  />
                </div>
              )}
              <div className="form-actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setProfileOpen(false)}
                >
                  Cancel
                </button>
                <button className="primary" disabled={saving || uploadingImage}>
                  {saving ? "Saving…" : "Save profile"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {hobbyOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setHobbyOpen(false)
          }
        >
          <section
            className="modal content-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hobby-form-title"
          >
            <div className="modal-head">
              <div>
                <p className="eyebrow">PERSONAL INTEREST</p>
                <h2 id="hobby-form-title">
                  {editingHobbyId ? "Edit hobby" : "Add a hobby"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setHobbyOpen(false)}
                aria-label="Close"
              >
                <X />
              </button>
            </div>
            <form onSubmit={submitHobby}>
              <label>
                Hobby name *
                <input
                  required
                  minLength={2}
                  maxLength={60}
                  value={hobbyForm.title}
                  onChange={(event) =>
                    setHobbyForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Example: Cycling"
                />
              </label>
              <label>
                Short description
                <textarea
                  rows={3}
                  maxLength={250}
                  value={hobbyForm.description}
                  onChange={(event) =>
                    setHobbyForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="What do you enjoy about it?"
                />
              </label>
              <label>
                Image URL (optional)
                <input
                  type="url"
                  value={hobbyForm.imageUrl}
                  onChange={(event) =>
                    setHobbyForm((current) => ({
                      ...current,
                      imageUrl: event.target.value,
                    }))
                  }
                  placeholder="Paste an image link or upload one below"
                />
              </label>
              <label>
                Upload hobby image (JPG, PNG, or WebP)
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploadingImage}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    void uploadImage(file, (imageUrl) => {
                      setHobbyForm((current) => ({
                        ...current,
                        imageUrl,
                      }));
                    });
                  }}
                />
              </label>
              <p className="field-note">
                Photos stay clear, with a light blur when hovered on desktop.
                A shaded background keeps the text readable on every screen.
              </p>
              {hobbyForm.imageUrl && (
                <div className="thumbnail-preview compact-preview">
                  <img
                    src={hobbyForm.imageUrl}
                    alt="Hobby preview"
                    width={800}
                    height={450}
                  />
                </div>
              )}
              <div className="form-actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setHobbyOpen(false)}
                >
                  Cancel
                </button>
                <button className="primary" disabled={saving || uploadingImage}>
                  {saving
                    ? "Saving…"
                    : editingHobbyId
                      ? "Save hobby"
                      : "Add hobby"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {workingStyleOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setWorkingStyleOpen(false)
          }
        >
          <section
            className="modal skill-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="working-style-form-title"
          >
            <div className="modal-head">
              <div>
                <p className="eyebrow">WORKING STYLE</p>
                <h2 id="working-style-form-title">
                  {editingWorkingStyleId ? "Edit style" : "Add a style"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setWorkingStyleOpen(false)}
                aria-label="Close"
              >
                <X />
              </button>
            </div>
            <form onSubmit={submitWorkingStyle}>
              <label>
                Style name *
                <input
                  required
                  minLength={2}
                  maxLength={60}
                  value={workingStyleForm.title}
                  onChange={(event) =>
                    setWorkingStyleForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Example: Creative thinking"
                />
              </label>
              <label>
                Short note
                <textarea
                  rows={3}
                  maxLength={250}
                  value={workingStyleForm.description}
                  onChange={(event) =>
                    setWorkingStyleForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="How does this show in your work?"
                />
              </label>
              <div className="form-actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setWorkingStyleOpen(false)}
                >
                  Cancel
                </button>
                <button className="primary" disabled={saving}>
                  {saving
                    ? "Saving…"
                    : editingWorkingStyleId
                      ? "Save style"
                      : "Add style"}
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
