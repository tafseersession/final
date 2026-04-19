"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  BellRing,
  BriefcaseBusiness,
  BookOpen,
  Building2,
  Calendar,
  Clock3,
  Database,
  DollarSign,
  ListTodo,
  Loader2,
  MessageSquare,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatCard, PanelCard, ActivityPanel } from "@/components/panels";
import type {
  AdminActivityEntry,
  AdminActivityResponse,
  AdminListResponse,
} from "@/lib/admin/types";
import { useAdminPanelMetadata } from "@/lib/hooks/use-admin-panel";

function formatEntityLabel(entityKey: string): string {
  return entityKey
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatActivityLabel(item: AdminActivityEntry): string {
  const verb = item.eventType.split(".").at(-1) ?? "updated";
  return `${item.actorName ?? item.actorUserId} ${verb} ${formatEntityLabel(
    item.entityType
  )}`;
}

export default function ImamDashboardPage() {
  const { data, loading, refresh } = useAdminPanelMetadata();
  const [activity, setActivity] = useState<AdminActivityEntry[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [activityUnavailable, setActivityUnavailable] = useState(false);
  const [mosqueName, setMosqueName] = useState<string | null>(null);

  useEffect(() => {
    if (!data) {
      setActivity([]);
      setMosqueName(null);
      setLoadingActivity(loading);
      return;
    }

    let cancelled = false;

    async function loadScopedDashboard() {
      setLoadingActivity(true);
      try {
        const [mosqueResponse, activityResponse] = await Promise.all([
          fetch("/api/admin/entities/mosques?limit=1", { cache: "no-store" }),
          fetch("/api/admin/activity?limit=6", { cache: "no-store" }).catch(() => null),
        ]);

        const mosquePayload = (await mosqueResponse.json().catch(() => ({}))) as
          | AdminListResponse
          | { error?: string };
        const activityPayload =
          activityResponse != null
            ? ((await activityResponse.json().catch(() => ({}))) as
                | AdminActivityResponse
                | { error?: string })
            : null;

        if (!cancelled) {
          if (
            mosqueResponse.ok &&
            "items" in mosquePayload &&
            mosquePayload.items.length > 0
          ) {
            const firstMosque = mosquePayload.items[0] as Record<string, unknown>;
            setMosqueName(
              typeof firstMosque.name === "string" ? firstMosque.name : null
            );
          } else {
            setMosqueName(null);
          }

          if (
            activityResponse?.ok &&
            activityPayload != null &&
            "items" in activityPayload
          ) {
            setActivity(activityPayload.items);
            setActivityUnavailable(false);
          } else {
            setActivity([]);
            setActivityUnavailable(true);
          }
        }
      } catch {
        if (!cancelled) {
          setActivity([]);
          setMosqueName(null);
          setActivityUnavailable(true);
        }
      } finally {
        if (!cancelled) {
          setLoadingActivity(false);
        }
      }
    }

    void loadScopedDashboard();

    return () => {
      cancelled = true;
    };
  }, [data, loading]);

  const totalRecords = (data?.entities ?? []).reduce(
    (sum, entity) => sum + (typeof entity.count === "number" ? entity.count : 0),
    0
  );
  const totalEntities = data?.entities.length ?? 0;
  const prayerTimeCount =
    data?.entities.find((entity) => entity.key === "prayer_times")?.count ?? 0;

  const quickLinks = [
    {
      href: "/imam/mosque",
      label: "Mosque Settings",
      description: "Update your mosque profile and operational details.",
      icon: Building2,
    },
    {
      href: "/imam/prayer-times",
      label: "Prayer Times",
      description: "Maintain adhan, iqama, and Jummah schedules.",
      icon: Clock3,
    },
    {
      href: "/imam/events",
      label: "Events",
      description: "Publish classes, khutbahs, and community events.",
      icon: Calendar,
    },
    {
      href: "/imam/announcements",
      label: "Announcements",
      description: "Share urgent notices and weekly community updates.",
      icon: BellRing,
    },
    {
      href: "/imam/imams",
      label: "Leadership",
      description: "Manage imam appointments, leadership bios, and active assignments.",
      icon: Users,
    },
    {
      href: "/imam/team",
      label: "Operations Team",
      description: "Build the working team that operates under your mosque leadership.",
      icon: BriefcaseBusiness,
    },
    {
      href: "/imam/tasks",
      label: "Task Board",
      description: "Assign work, track status, and keep your mosque team accountable.",
      icon: ListTodo,
    },
    {
      href: "/imam/community",
      label: "Community",
      description: "Moderate mosque posts and community messaging.",
      icon: MessageSquare,
    },
    {
      href: "/imam/finance",
      label: "Finance",
      description: "Review donations tied to your mosque.",
      icon: DollarSign,
    },
    {
      href: "/imam/control-center",
      label: "Control Center",
      description: "Open the full mosque-scoped CRUD surface.",
      icon: Database,
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              Imam Panel
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Building2 className="h-3.5 w-3.5" />
              Mosque Scoped
            </Badge>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            {mosqueName ? `${mosqueName}` : "Imam Appointment Pending"}
          </h1>
          <p className="text-muted-foreground">
            {mosqueName
              ? "Manage your appointed mosque's live settings, prayer schedule, announcements, leadership records, operations teams, community posts, donations, and staff tasks from one dedicated workspace."
              : "This panel activates once your imam profile has an active mosque appointment. As soon as the appointment is live, your control center, team board, and tasks will scope automatically to that mosque."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={refresh}>
            Refresh
          </Button>
          <Link href="/imam/control-center">
            <Button>
              <Database className="mr-2 h-4 w-4" />
              Open Control Center
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Database className="h-5 w-5" />}
          label="Managed Surfaces"
          value={loading ? "..." : totalEntities}
          color="primary"
        />
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label="Live Records"
          value={loading ? "..." : totalRecords}
          color="accent"
        />
        <StatCard
          icon={<Clock3 className="h-5 w-5" />}
          label="Prayer Schedules"
          value={loading ? "..." : prayerTimeCount}
          color="success"
        />
        <StatCard
          icon={<BellRing className="h-5 w-5" />}
          label="Recent Activity"
          value={loadingActivity ? "..." : activity.length}
          color="primary"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_400px]">
        <PanelCard
          icon={<BookOpen className="h-5 w-5" />}
          title="Imam Workflows"
          description="Access mosque-scoped surfaces to manage records connected to your mosque"
        >
          <div className="grid gap-4 md:grid-cols-2">
            {quickLinks.map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="panel-elevated p-4 space-y-3 cursor-pointer group h-full">
                  <div className="flex items-start gap-3">
                    <div className="icon-badge-primary group-hover:shadow-elevation-md transition-shadow">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm">{item.label}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="px-0 text-primary hover:text-primary">
                    Open
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        </PanelCard>

        <ActivityPanel
          items={activity.map((item) => ({
            id: item.eventId,
            icon: <Activity className="h-4 w-4" />,
            title: formatActivityLabel(item),
            description: `${formatEntityLabel(item.entityType)} ID: ${item.entityId}`,
            timestamp: new Date(item.occurredAt).toLocaleTimeString(),
          }))}
          isEmpty={loadingActivity || activityUnavailable}
          title="Mosque Activity"
          description="Latest updates from your mosque operations"
        />
      </div>
    </div>
  );
}
