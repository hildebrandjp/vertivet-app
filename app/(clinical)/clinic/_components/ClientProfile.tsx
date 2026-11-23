"use client";

import { useState } from "react";
import { formatAppointmentDate } from "@/app/(app)/_lib/format";
import { Button } from "@/app/shared/ui/Button";
import { DescriptionList } from "@/app/shared/ui/DescriptionList";
import { Dialog } from "@/app/shared/ui/Dialog";
import type { RegistryOwner } from "../_lib/registry";
import { Email, Phone } from "./ClientContactLinks";

export function ClientProfile({ owner }: { owner: RegistryOwner }) {
  const [open, setOpen] = useState(false);
  const lastVisit =
    owner.lastConsultationAt &&
    Number.isFinite(Date.parse(owner.lastConsultationAt))
      ? formatAppointmentDate(owner.lastConsultationAt)
      : "Not recorded";
  return (
    <>
      <Button
        size="sm"
        aria-label={`Client profile for ${owner.name}`}
        onClick={() => setOpen(true)}
      >
        Client Profile
      </Button>
      {open && (
        <Dialog
          open
          onOpenChange={setOpen}
          title={owner.name}
          description="Client profile"
          showCloseButton
          size="md"
        >
          <DescriptionList
            items={[
              { term: "Member ID", details: owner.memberId ?? "Not recorded" },
              {
                term: "Email",
                details: owner.email ? (
                  <Email value={owner.email} />
                ) : (
                  "Not recorded"
                ),
              },
              {
                term: "Phone",
                details: owner.phone ? (
                  <Phone value={owner.phone} />
                ) : (
                  "Not recorded"
                ),
              },
              { term: "Address", details: owner.address ?? "Not recorded" },
              {
                term: "Family pets",
                details: owner.pets.join(", ") || "No pets registered",
              },
              { term: "Last consultation", details: lastVisit },
            ]}
          />
        </Dialog>
      )}
    </>
  );
}
