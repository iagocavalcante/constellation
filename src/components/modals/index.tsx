import React from "react";
import { useModals } from "@/state/modals";
import { ReportPostModal } from "./report-post";
import { ReportProfileModal } from "./report-profile";

export function ModalRenderer() {
  const { activeModals } = useModals();

  return (
    <>
      {activeModals.map((modal, index) => {
        switch (modal.name) {
          case "report-post":
            return (
              <ReportPostModal
                key={index}
                uri={modal.uri}
                cid={modal.cid}
                authorDid={modal.authorDid}
              />
            );
          case "report-profile":
            return (
              <ReportProfileModal
                key={index}
                did={modal.did}
                handle={modal.handle}
                displayName={modal.displayName}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}