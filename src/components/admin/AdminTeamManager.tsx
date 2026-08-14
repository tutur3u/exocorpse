"use client";

import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import type {
  AdminTeamMember,
  AdminTeamPayload,
} from "@/types/admin-integrations";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Crown,
  MailPlus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

const teamKey = ["admin", "team"] as const;

async function teamRequest<T>(
  method: "DELETE" | "GET" | "POST",
  body?: unknown,
) {
  const response = await fetch("/api/admin/team", {
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    method,
  });
  const payload = (await response.json().catch(() => null)) as
    ({ error?: string } & T) | null;
  if (!response.ok) throw new Error(payload?.error || "Team request failed.");
  return payload as T;
}

function parseEmails(value: string) {
  return [
    ...new Set(
      value.split(/[\s,;]+/u).map((email) => email.trim().toLowerCase()),
    ),
  ].filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email));
}

export default function AdminTeamManager({
  initialData,
}: {
  initialData: AdminTeamPayload;
}) {
  const queryClient = useQueryClient();
  const [emails, setEmails] = useState("");
  const [search, setSearch] = useState("");
  const [removing, setRemoving] = useState<AdminTeamMember | null>(null);
  const team = useQuery({
    initialData,
    queryFn: () => teamRequest<AdminTeamPayload>("GET"),
    queryKey: teamKey,
    staleTime: 30_000,
  });
  const data = team.data;
  const mutation = useMutation({
    mutationFn: (input: { body: unknown; method: "DELETE" | "POST" }) =>
      teamRequest(input.method, input.body),
    onError: (error) => toast.error(error.message),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: teamKey });
    },
  });

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data.members;
    return data.members.filter((member) =>
      [member.display_name, member.email, member.handle]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query)),
    );
  }, [data.members, search]);
  const joined = data.members.filter((member) => !member.pending).length;
  const invited = data.members.length - joined;

  async function invite() {
    const normalized = parseEmails(emails);
    if (!normalized.length)
      return toast.error("Enter at least one valid email.");
    await mutation.mutateAsync({
      body: { action: "invite", emails: normalized },
      method: "POST",
    });
    setEmails("");
    toast.success(
      `Sent ${normalized.length} invitation${normalized.length === 1 ? "" : "s"}.`,
    );
  }

  async function toggleRole(member: AdminTeamMember, roleId: string) {
    if (!member.id) return;
    const assigned = member.roles.some((role) => role.id === roleId);
    await mutation.mutateAsync({
      body: {
        action: assigned ? "remove-role" : "add-role",
        roleId,
        userId: member.id,
      },
      method: assigned ? "DELETE" : "POST",
    });
    toast.success(
      assigned ? "Access level removed." : "Access level assigned.",
    );
  }

  async function confirmRemove() {
    if (!removing) return;
    await mutation.mutateAsync({
      body: {
        action: "remove-member",
        email: removing.pending ? removing.email : undefined,
        userId: removing.pending ? undefined : removing.id,
      },
      method: "DELETE",
    });
    setRemoving(null);
    toast.success(removing.pending ? "Invitation removed." : "Access revoked.");
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-cyan-900/40 bg-linear-to-br from-slate-950 via-slate-950 to-cyan-950/50 shadow-2xl shadow-cyan-950/20">
        <div className="border-b border-white/10 p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.24em] text-cyan-300 uppercase">
                <UsersRound className="h-4 w-4" /> Access registry
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                Team members
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Invite collaborators, review pending access, and assign Tuturuuu
                workspace access levels without leaving Exocorpse.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void team.refetch()}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 text-sm font-bold text-white transition hover:border-cyan-400/50 hover:bg-cyan-400/10"
            >
              <RefreshCw
                className={`h-4 w-4 ${team.isFetching ? "animate-spin" : ""}`}
              />{" "}
              Refresh
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-white/10">
          {[
            ["Active", joined],
            ["Invited", invited],
            ["Access levels", data.roles.length],
          ].map(([label, value]) => (
            <div className="p-4 sm:p-6" key={label}>
              <div className="text-2xl font-black text-white sm:text-3xl">
                {value}
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-400 sm:text-sm">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-cyan-100 p-2.5 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
            <MailPlus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-gray-950 dark:text-white">
              Invite collaborators
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Separate multiple email addresses with commas, spaces, or new
              lines.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 lg:flex-row">
          <textarea
            aria-label="Invitation email addresses"
            className="min-h-24 flex-1 resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            disabled={!data.context.canManageMembers || mutation.isPending}
            onChange={(event) => setEmails(event.target.value)}
            placeholder="artist@example.com, editor@example.com"
            value={emails}
          />
          <button
            type="button"
            disabled={!data.context.canManageMembers || mutation.isPending}
            onClick={() => void invite()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 text-sm font-bold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MailPlus className="h-4 w-4" /> Send invitations
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <div>
            <h2 className="font-bold text-gray-950 dark:text-white">
              People with access
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Roles are synchronized directly with Tuturuuu.
            </p>
          </div>
          <input
            aria-label="Search team members"
            className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-cyan-500 sm:w-64 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search people..."
            value={search}
          />
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {filteredMembers.map((member) => (
            <div
              className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(220px,1fr)_auto] lg:items-center"
              key={member.id ?? member.email}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-cyan-100 font-black text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200">
                  <UserRound className="h-5 w-5" />
                  {member.avatar_url ? (
                    // Avatar hosts are user-defined; native lazy loading avoids
                    // Next Image host configuration for private workspace profiles.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      src={member.avatar_url}
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-bold text-gray-950 dark:text-white">
                      {member.display_name ||
                        member.email ||
                        member.handle ||
                        "Unnamed member"}
                    </p>
                    {member.is_creator ? (
                      <Crown
                        className="h-4 w-4 text-amber-500"
                        aria-label="Workspace creator"
                      />
                    ) : null}
                    {member.pending ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Invited
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                    {member.email || `@${member.handle}`}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.roles.length && !member.pending ? (
                  data.roles.map((role) => {
                    const assigned = member.roles.some(
                      (item) => item.id === role.id,
                    );
                    return (
                      <button
                        type="button"
                        key={role.id}
                        disabled={
                          !data.context.canManageRoles ||
                          member.is_creator ||
                          mutation.isPending
                        }
                        onClick={() => void toggleRole(member, role.id)}
                        className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${assigned ? "border-emerald-400/40 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "border-gray-200 text-gray-600 hover:border-cyan-400 dark:border-gray-700 dark:text-gray-300"}`}
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {role.name}
                      </button>
                    );
                  })
                ) : (
                  <span className="text-xs text-gray-400">
                    {member.pending
                      ? "Access levels available after joining"
                      : "No custom access levels"}
                  </span>
                )}
              </div>
              <button
                type="button"
                disabled={
                  !data.context.canManageMembers ||
                  member.is_creator ||
                  mutation.isPending
                }
                onClick={() => setRemoving(member)}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {member.pending ? "Cancel invite" : "Revoke"}
              </button>
            </div>
          ))}
          {!filteredMembers.length ? (
            <div className="p-10 text-center text-sm text-gray-500">
              No people match this search.
            </div>
          ) : null}
        </div>
      </section>

      <ConfirmDeleteDialog
        confirmText={removing?.pending ? "Cancel invitation" : "Revoke access"}
        isOpen={Boolean(removing)}
        loading={mutation.isPending}
        message={`${removing?.email || removing?.display_name || "This person"} will no longer have access through this invitation or membership.`}
        onCancel={() => setRemoving(null)}
        onConfirm={() => void confirmRemove()}
        title={
          removing?.pending
            ? "Cancel this invitation?"
            : "Revoke workspace access?"
        }
      />
    </div>
  );
}
