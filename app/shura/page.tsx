"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  BellRing,
  BriefcaseBusiness,
  Building2,
  Calendar,
  Clock3,
  Database,
  ListTodo,
  Loader2,
  Shield,
  UserPlus,
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
import type { AdminActivityEntry, AdminActivityResponse } from "@/lib/admin/types";
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

export default function ShuraDashboardPage() {
  const { data, loading, refresh } = useAdminPanelMetadata();
  const [activity, setActivity] = useState<AdminActivityEntry[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [activityUnavailable, setActivityUnavailable] = useState(false);

  const entityCount = useMemo(
    () => Object.fromEntries((data?.entities ?? []).map((entity) => [entity.key, entity.count ?? 0])),
    [data?.entities]
  ) as Record<string, number>;

  useEffect(() => {
    let cancelled = false;

    async function loadActivity() {
      setLoadingActivity(true);
      try {
        const response = await fetch("/api/admin/activity?limit=8", {
          cache: "no-store",
        }).catch(() => null);

        const payload =
          response != null
            ? ((await response.json().catch(() => ({}))) as
                | AdminActivityResponse
                | { error?: string })
            : null;

        if (!cancelled) {
          if (response?.ok && payload && "items" in payload) {
            setActivity(payload.items);
            setActivityUnavailable(false);
          } else {
            setActivity([]);
            setActivityUnavailable(true);
          }
        }
      } catch {
        if (!cancelled) {
          setActivity([]);
          setActivityUnavailable(true);
        }
      } finally {
        if (!cancelled) {
          setLoadingActivity(false);
        }
      }
    }

    void loadActivity();

    return () => {
      cancelled = true;
    };
  }, [data]);

  const quickLinks = [
    {
      href: "/shura/mosques",
      label: "Mosque Network",
      description: "Review every mosque in the application and keep network operations aligned.",
      icon: Building2,
    },
    {
      href: "/shura/teams",
      label: "Operations Teams",
      description: "Create field teams, attach members, and decide which mosque they support.",
      icon: BriefcaseBusiness,
    },
    {
      href: "/shura/tasks",
      label: "Task Dispatch",
      description: "Assign action items to teams and track progress across all mosques.",
      icon: ListTodo,
    },
    {
      href: "/shura/imams",
      label: "Imam Appointments",
      description: "Oversee imam assignments, active leadership, and appointment coverage.",
      icon: UserPlus,
    },
    {
      href: "/shura/prayer-times",
      label: "Prayer Times",
      description: "Ensure schedules stay accurate across the whole mosque network.",
      icon: Clock3,
    },
    {
      href: "/shura/events",
      label: "Events",
      description: "Coordinate the shared programming calendar and operational visibility.",
      icon: Calendar,
    },
    {
      href: "/shura/announcements",
      label: "Announcements",
      description: "Push important notices and follow-up communications across mosques.",
      icon: BellRing,
    },
    {
      href: "/shura/control-center",
      label: "Control Center",
      description: "Open the full Shura command surface with live entity management.",
      icon: Database,
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Shield className="h-3.5 w-3.5" />
              Shura Panel
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Building2 className="h-3.5 w-3.5" />
              All Mosques
            </Badge>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            Shura Operations Dashboard
          </h1>
          <p className="text-muted-foreground">
            Oversee every mosque in the application, dispatch teams, assign tasks,
            monitor imam appointments, and keep network-wide operations moving from one live workspace.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={refresh}>
            Refresh
          </Button>
          <Link href="/shura/control-center">
            <Button>
              <Database className="mr-2 h-4 w-4" />
              Open Control Center
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Building2 className="h-5 w-5" />}
          label="Mosques"
          value={loading ? "..." : entityCount.mosques ?? 0}
          color="primary"
        />
        <StatCard
          icon={<BriefcaseBusiness className="h-5 w-5" />}
          label="Operations Teams"
          value={loading ? "..." : entityCount.management_teams ?? 0}
          color="accent"
        />
        <StatCard
          icon={<ListTodo className="h-5 w-5" />}
          label="Open Tasks"
          value={loading ? "..." : entityCount.mosque_tasks ?? 0}
          color="success"
        />
        <StatCard
          icon={<UserPlus className="h-5 w-5" />}
          label="Imam Appointments"
          value={loading ? "..." : entityCount.imams ?? 0}
          color="primary"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_400px]">
        <PanelCard
          icon={<BriefcaseBusiness className="h-5 w-5" />}
          title="Shura Workflows"
          description="Manage mosques, coordinate teams, assign work, and track progress"
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
            id: String(item.eventId),
            icon: <Activity className="h-4 w-4" />,
            title: formatActivityLabel(item),
            description: `${formatEntityLabel(item.entityType)} ID: ${item.entityId}`,
            timestamp: new Date(item.occurredAt).toLocaleTimeString(),
          }))}
          isEmpty={loadingActivity || activityUnavailable}
          title="Network Activity"
          description="Latest actions across all operations"
        />
      </div>
    </div>
  );
}
