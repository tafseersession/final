"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Crown,
  Database,
  Loader2,
  Settings2,
  Shield,
  UserCog,
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

export default function SuperAdminDashboardPage() {
  const [activity, setActivity] = useState<AdminActivityEntry[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [activityUnavailable, setActivityUnavailable] = useState(false);
  const { data, loading, refresh } = useAdminPanelMetadata();

  useEffect(() => {
    if (!data) {
      setActivity([]);
      setLoadingActivity(loading);
      return;
    }

    let cancelled = false;

    async function loadActivity() {
      setLoadingActivity(true);
      try {
        const activityResponse = await fetch("/api/admin/activity?limit=6", {
          cache: "no-store",
        }).catch(() => null);
        const activityPayload =
          activityResponse != null
            ? ((await activityResponse.json().catch(() => ({}))) as
                | AdminActivityResponse
                | { error?: string })
            : null;

        if (!cancelled) {
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
  }, [data, loading]);

  const totalRecords = (data?.entities ?? []).reduce(
    (sum, entity) => sum + (typeof entity.count === "number" ? entity.count : 0),
    0
  );
  const enabledModules = Object.values(data?.moduleSettings ?? {}).filter(Boolean).length;
  const profileCount =
    data?.entities.find((entity) => entity.key === "profiles")?.count ?? 0;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Crown className="h-3.5 w-3.5" />
              Super Admin
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Shield className="h-3.5 w-3.5" />
              Platform Governance
            </Badge>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            Super Admin Panel
          </h1>
          <p className="text-muted-foreground">
            Govern the platform layer separately from day-to-day admin operations,
            with direct access to global control, user governance, and cross-module
            visibility.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={refresh}>
            Refresh
          </Button>
          <Link href="/super-admin/control-center">
            <Button>
              <Database className="mr-2 h-4 w-4" />
              Open Super Control Center
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline">
              <ArrowRight className="mr-2 h-4 w-4" />
              Open Admin Panel
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Database className="h-5 w-5" />}
          label="Governed Surfaces"
          value={loading ? "..." : data?.entities.length ?? 0}
          color="primary"
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Platform Users"
          value={loading ? "..." : profileCount}
          color="accent"
        />
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label="Live Records"
          value={loading ? "..." : totalRecords}
          color="success"
        />
        <StatCard
          icon={<Settings2 className="h-5 w-5" />}
          label="Enabled Modules"
          value={loading ? "..." : enabledModules}
          color="primary"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_400px]">
        <PanelCard
          icon={<Crown className="h-5 w-5" />}
          title="Governance Workflows"
          description="Platform-level actions with separation from operational management"
        >
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                href: "/super-admin/control-center",
                label: "Global Control Center",
                description: "Access every entity with realtime sync",
                icon: Database,
              },
              {
                href: "/super-admin/users",
                label: "User Governance",
                description: "Manage role hierarchy and profiles",
                icon: Users,
              },
              {
                href: "/super-admin/settings",
                label: "Global Settings",
                description: "Control modules and defaults",
                icon: Settings2,
              },
              {
                href: "/admin",
                label: "Admin Panel",
                description: "Jump to operational management",
                icon: UserCog,
              },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="panel-elevated p-4 space-y-3 cursor-pointer group h-full">
                  <div className="flex items-start gap-3">
                    <div className="icon-badge-primary group-hover:shadow-elevation-md transition-shadow">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm">{item.label}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
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
          title="Platform Activity"
          description="Latest mutations through the realtime bus"
        />
      </div>
    </div>
  );
}
