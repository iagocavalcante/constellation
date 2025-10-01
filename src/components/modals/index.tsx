import React from "react";
import { useModals } from "@/state/modals";
import { ReportPostModal } from "./report-post";

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
          default:
            return null;
        }
      })}
    </>
  );
}