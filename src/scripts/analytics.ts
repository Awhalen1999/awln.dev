import posthog from "posthog-js";

const IS_PROD = window.location.hostname === "awln.dev";

if (IS_PROD) {
  posthog.init("phc_YrGXbAy5VOj2nn5PNaPp1uC9s8I7JMVkefOizAsQht6", {
    api_host: "https://us.i.posthog.com",
  });
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (IS_PROD) posthog.capture(event, properties);
}

// Track link clicks, copy actions, and resume downloads
document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;

  const downloadLink = target.closest<HTMLAnchorElement>("a[download]");
  if (downloadLink?.href.includes("resume")) {
    track("resume_downloaded");
    return;
  }

  const mailtoLink = target.closest<HTMLAnchorElement>('a[href^="mailto:"]');
  if (mailtoLink) {
    track("email_clicked", { email: mailtoLink.href.replace("mailto:", "") });
    return;
  }

  const externalLink = target.closest<HTMLAnchorElement>('a[target="_blank"]');
  if (externalLink) {
    track("external_link_clicked", { url: externalLink.href });
    return;
  }

  const copyBtn = target.closest<HTMLElement>("[data-copy]");
  if (copyBtn?.dataset.copy) {
    const value = copyBtn.dataset.copy;
    if (value.includes("@")) {
      track("email_copied", { email: value });
    } else {
      track("external_link_copied", { url: value });
    }
  }
});
