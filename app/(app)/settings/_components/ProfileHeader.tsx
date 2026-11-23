"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/app/shared/ui/Avatar";
import { Button } from "@/app/shared/ui/Button";
import { Heading, Text } from "@/app/shared/ui/Typography";
import type { OwnerSettings } from "../../_lib/data/settings-types";
import { PHOTO_TYPES } from "../_lib/settings-form";
import styles from "../settings.module.css";

export function ProfileHeader({
  settings,
  photo,
  busy,
  onPhoto,
}: {
  settings: OwnerSettings;
  photo: File | null;
  busy: boolean;
  onPhoto: (photo: File) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>();
  useEffect(() => {
    if (!photo) {
      setPreview(undefined);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const detail = [
    "Pet Parent Account",
    settings.memberSince && `Member since ${settings.memberSince}`,
    settings.memberId && `ID: #${settings.memberId}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <header className={styles.profile}>
      <Avatar
        size="xl"
        name={settings.fullName}
        src={preview ?? settings.avatarUrl}
        unoptimized
        decorative
      />
      <div className={styles.identity}>
        <Heading level={3} as="h2">
          {settings.fullName}
        </Heading>
        <Text variant="supporting" tone="muted">
          {detail}
        </Text>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept={PHOTO_TYPES.join(",")}
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onPhoto(file);
        }}
      />
      <Button
        variant="secondary"
        size="sm"
        disabled={busy}
        onClick={() => fileInput.current?.click()}
      >
        Upload Photo
      </Button>
    </header>
  );
}
