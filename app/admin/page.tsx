"use client";

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Clock3,
  Database,
  Loader2,
  Shield,
  SlidersHorizontal,
  Zap,
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
import { StatCard, PanelCard } from "@/components/panels";
import type { AdminEntityKey } from "@/lib/admin/types";
import { useAdminPanelMetadata } from "@/lib/hooks/use-admin-panel";

function getEntityHref(entityKey: AdminEntityKey): string {
  switch (entityKey) {
    case "settings":
      return "/admin/settings";
    case "prayer_times":
      return "/admin/prayer-times";
    case "profiles":
    case "posts":
      return "/admin/community";
    case "donations":
      return "/admin/finance";
    default:
      return `/admin/${entityKey}`;
  }
}

export default function AdminDashboardPage() {
  const { data, loading, refresh } = useAdminPanelMetadata();

  const entityCount = data?.entities.length ?? 0;
  const totalRecords = (data?.entities ?? []).reduce(
    (sum, entity) => sum + (typeof entity.count === "number" ? entity.count : 0),
    0
  );
  const enabledModules = Object.values(data?.moduleSettings ?? {}).filter(Boolean).length;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Zap className="h-3.5 w-3.5" />
              Realtime Admin
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Shield className="h-3.5 w-3.5" />
              Role Enforced
            </Badge>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            The Admin Panel now runs on a shared entity registry, generic CRUD
            endpoints, and live update broadcasts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/control-center">
            <Button>
              <Database className="mr-2 h-4 w-4" />
              Open Control Center
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="outline">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Global Settings
            </Button>
          </Link>
          <Link href="/admin/prayer-times">
            <Button variant="outline">
              <Clock3 className="mr-2 h-4 w-4" />
              Prayer Times
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Database className="h-5 w-5" />}
          label="Managed Entities"
          value={loading ? "..." : entityCount}
          color="primary"
        />
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label="Live Records"
          value={loading ? "..." : totalRecords}
          color="accent"
        />
        <StatCard
          icon={<Zap className="h-5 w-5" />}
          label="Enabled Modules"
          value={loading ? "..." : enabledModules}
          color="success"
        />
        <StatCard
          icon={<Shield className="h-5 w-5" />}
          label="Sync Status"
          value="Live"
          color="primary"
        />
      </div>

      <PanelCard
        icon={<Database className="h-5 w-5" />}
        title="Entity Overview"
        description="Each card reflects the current role's capability surface"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          </Button>
        }
      >
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading entities...
          </div>
        ) : !data || data.entities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/40 bg-muted/30 p-8 text-center">
            <Database className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No admin entities available for your role</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.entities.map((entity) => (
              <div key={entity.key} className="panel-elevated p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <h3 className="font-semibold text-foreground text-sm">{entity.label}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{entity.description}</p>
                  </div>
                  <Badge className="shrink-0">
                    {typeof entity.count === "number" ? entity.count : "-"}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-1.5">
                  {entity.capability.read && <Badge variant="secondary" className="text-xs">Read</Badge>}
                  {entity.capability.create && <Badge variant="secondary" className="text-xs">Create</Badge>}
                  {entity.capability.update && <Badge variant="secondary" className="text-xs">Update</Badge>}
                  {entity.capability.delete && <Badge variant="secondary" className="text-xs">Delete</Badge>}
                </div>
                
                <Link href={getEntityHref(entity.key)} className="block">
                  <Button variant="ghost" size="sm" className="px-0 w-full justify-start">
                    Open {entity.label}
                    <ArrowUpRight className="ml-auto h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </PanelCard>
    </div>
  );
}
