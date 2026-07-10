"use client";

import { useEffect, useState } from "react";
import { ContactForm } from "@/components/contact-form";
import { EventFilters } from "@/components/event-filters";
import type { EventRecord } from "@/lib/cms/types";

type InquiryModalProps = {
  cities: readonly string[];
  events: EventRecord[];
};

export function InquiryModal({ cities, events }: InquiryModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function openInquiry() {
    setIsOpen(true);
  }

  function closeInquiry() {
    setIsOpen(false);
  }

  return (
    <>
      <EventFilters cities={cities} events={events} onOpenInquiry={openInquiry} />
      <div className="concerts__cta">
        <button className="hero__cta" type="button" onClick={openInquiry}>
          Разместить афишу
        </button>
      </div>

      {isOpen ? (
        <div
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inquiry-modal-title"
        >
          <button
            className="modal__backdrop"
            type="button"
            aria-label="Закрыть форму"
            onClick={closeInquiry}
          />
          <div className="modal__panel">
            <button
              className="modal__close"
              type="button"
              aria-label="Закрыть форму"
              onClick={closeInquiry}
            >
              Закрыть
            </button>
            <div className="section-heading">
              <p className="eyebrow">Для музыкантов</p>
              <h2 id="inquiry-modal-title">
                Оставить заявку на размещение афиши
              </h2>
              <p className="section-copy">
                Заполните форму ниже, после успешного прохождения модерации Ваша
                афиша будет опубликована на сайте.
              </p>
            </div>
            <ContactForm />
          </div>
        </div>
      ) : null}
    </>
  );
}
