"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@tuturuuu/ui/avatar";
import { Button } from "@tuturuuu/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@tuturuuu/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@tuturuuu/ui/dropdown-menu";
import { Input } from "@tuturuuu/ui/input";
import { Label } from "@tuturuuu/ui/label";
import {
  Camera,
  ChevronDown,
  ExternalLink,
  Loader2,
  LogOut,
  Trash2,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toastWithSound from "@/lib/toast";

type User = {
  avatarUrl?: string | null;
  displayName?: string | null;
  email: string | null;
  id: string;
};

function initials(value: string) {
  return value
    .split(/[\s@._-]+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function UserAvatar({ user, src }: { user: User; src?: string | null }) {
  const name = user.displayName?.trim() || user.email || "Account";
  return (
    <Avatar className="size-9 border border-slate-700 bg-slate-900">
      {src || user.avatarUrl ? (
        <AvatarImage
          alt=""
          referrerPolicy="no-referrer"
          src={src || user.avatarUrl || undefined}
        />
      ) : null}
      <AvatarFallback className="bg-cyan-950 text-xs font-bold text-cyan-300">
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

export default function AdminUserMenu({ initialUser }: { initialUser: User }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [profileOpen, setProfileOpen] = useState(false);
  const [displayName, setDisplayName] = useState(initialUser.displayName ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const previewUrl = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : null),
    [avatarFile],
  );
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const primary = user.displayName?.trim() || user.email || "Account";
  const secondary = user.displayName?.trim() ? user.email : null;

  const openProfile = async () => {
    setProfileOpen(true);
    try {
      const response = await fetch("/api/auth/profile", { cache: "no-store" });
      if (!response.ok) return;
      const profile = (await response.json()) as {
        avatar_url?: string | null;
        display_name?: string | null;
      };
      setUser((current) => ({
        ...current,
        avatarUrl: profile.avatar_url ?? current.avatarUrl,
        displayName: profile.display_name ?? current.displayName,
      }));
      setDisplayName(profile.display_name ?? "");
    } catch {
      // The encrypted session already contains a usable profile fallback.
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      let avatarUpload:
        { public_url: string; upload_proof: string } | undefined;
      if (avatarFile) {
        const signed = await fetch("/api/auth/profile/avatar/upload-url", {
          body: JSON.stringify({
            contentType: avatarFile.type,
            filename: avatarFile.name,
            size: avatarFile.size,
          }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
        const upload = (await signed.json()) as {
          error?: string;
          publicUrl?: string;
          uploadProof?: string;
          uploadUrl?: string;
        };
        if (
          !signed.ok ||
          !upload.uploadUrl ||
          !upload.publicUrl ||
          !upload.uploadProof
        ) {
          throw new Error(upload.error || "Avatar upload could not start.");
        }
        const uploaded = await fetch(upload.uploadUrl, {
          body: avatarFile,
          headers: { "Content-Type": avatarFile.type },
          method: "PUT",
        });
        if (!uploaded.ok) throw new Error("Avatar upload failed.");
        avatarUpload = {
          public_url: upload.publicUrl,
          upload_proof: upload.uploadProof,
        };
      }
      const response = await fetch("/api/auth/profile", {
        body: JSON.stringify({
          ...(avatarUpload ? { avatar_upload: avatarUpload } : {}),
          ...(removeAvatar ? { avatar_url: null } : {}),
          display_name: displayName,
        }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      const payload = (await response.json()) as {
        error?: string;
        profile?: User;
      };
      if (!response.ok)
        throw new Error(payload.error || "Profile update failed.");
      if (payload.profile) setUser(payload.profile);
      setAvatarFile(null);
      setRemoveAvatar(false);
      setProfileOpen(false);
      toastWithSound.success("Profile updated");
      router.refresh();
    } catch (error) {
      toastWithSound.error(
        error instanceof Error ? error.message : "Profile update failed.",
      );
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    setLoggingOut(true);
    try {
      const response = await fetch("/api/auth/tuturuuu-logout", {
        cache: "no-store",
        method: "POST",
      });
      if (!response.ok) throw new Error("Logout failed.");
      router.push("/login");
      router.refresh();
    } catch {
      toastWithSound.error("Logout failed");
      setLoggingOut(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex max-w-64 items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-2 py-1.5 text-left transition hover:border-cyan-900 hover:bg-slate-900 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:outline-none"
            type="button"
          >
            <UserAvatar user={user} />
            <span className="hidden min-w-0 flex-1 sm:block">
              <span className="block truncate text-sm font-semibold text-slate-100">
                {primary}
              </span>
              {secondary ? (
                <span className="block truncate text-xs text-slate-500">
                  {secondary}
                </span>
              ) : null}
            </span>
            <ChevronDown className="size-4 text-slate-500" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[min(21rem,calc(100vw-2rem))] border-slate-800 bg-slate-950 text-slate-100 shadow-2xl"
        >
          <DropdownMenuLabel className="flex items-center gap-3 p-3">
            <UserAvatar user={user} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                {primary}
              </span>
              {secondary ? (
                <span className="block truncate text-xs font-normal text-slate-500">
                  {secondary}
                </span>
              ) : null}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-800" />
          <DropdownMenuItem onSelect={() => void openProfile()}>
            <UserRound className="size-4" /> Edit profile
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="/" target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" /> Open site
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-800" />
          <DropdownMenuItem
            className="text-red-400 focus:bg-red-950 focus:text-red-300"
            disabled={loggingOut}
            onSelect={() => void logout()}
          >
            {loggingOut ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4" />
            )}
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="border-slate-800 bg-slate-950 text-slate-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription className="text-slate-400">
              This profile is shared with your Tuturuuu account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <UserAvatar
                user={{
                  ...user,
                  avatarUrl: removeAvatar ? null : user.avatarUrl,
                }}
                src={removeAvatar ? null : previewUrl}
              />
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <label className="cursor-pointer">
                    <Camera className="size-4" /> Choose image
                    <input
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;
                        setAvatarFile(file);
                        if (file) setRemoveAvatar(false);
                      }}
                      type="file"
                    />
                  </label>
                </Button>
                {(user.avatarUrl || avatarFile) && !removeAvatar ? (
                  <Button
                    onClick={() => {
                      setAvatarFile(null);
                      setRemoveAvatar(true);
                    }}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="size-4" /> Remove
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-display-name">Display name</Label>
              <Input
                id="profile-display-name"
                maxLength={100}
                onChange={(event) => setDisplayName(event.target.value)}
                value={displayName}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input disabled value={user.email ?? ""} />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={saving}
              onClick={() => setProfileOpen(false)}
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              disabled={saving || !displayName.trim()}
              onClick={saveProfile}
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Save profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
