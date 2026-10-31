/*
 * Serverdən gələn məlumatların ingiliscə göstərilməsi.
 *
 * Xidmət adları, təsvirlər, "Haqqında" mətnləri və rəylər bazada
 * Azərbaycanca saxlanılır və birbaşa ekrana çıxır. İngilis dili
 * seçiləndə ekrandakı mətn tam olaraq en.ts-dəki açarla üst-üstə
 * düşürsə, onun tərcüməsi göstərilir.
 *
 * Yalnız görünən mətnə toxunulur: input/textarea dəyərləri (redaktə
 * formaları), axtarış və filtr məntiqi dəyişmir, bazaya ingiliscə
 * heç nə yazılmır. Lüğətdə olmayan mətn (məs. biznes adı) olduğu
 * kimi qalır.
 */
import { en } from "./en";
import { getLang } from "./index";

/* Tərcümə olunan atributlar */
const ATTRIBUTES = ["placeholder", "title", "aria-label", "alt"];

/* Bu elementlərin içinə toxunulmur */
const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "SELECT", "CODE", "PRE"]);

const lookup = (text: string) => {
  const key = text.trim();

  if (key.length < 2) return null;

  const value = en[key];

  return value && value !== key ? text.replace(key, value) : null;
};

const isSkipped = (element: Element | null) =>
  !element ||
  SKIP.has(element.tagName) ||
  (element as HTMLElement).isContentEditable ||
  Boolean(element.closest("[data-no-translate]"));

const translateText = (node: Text) => {
  if (isSkipped(node.parentElement)) return;

  const next = lookup(node.nodeValue ?? "");

  if (next !== null) node.nodeValue = next;
};

const translateAttributes = (element: Element) => {
  if (element.closest("[data-no-translate]")) return;

  for (const name of ATTRIBUTES) {
    const value = element.getAttribute(name);
    const next = value ? lookup(value) : null;

    if (next !== null) element.setAttribute(name, next);
  }
};

const translateTree = (root: Node) => {
  if (root.nodeType === Node.TEXT_NODE) {
    translateText(root as Text);
    return;
  }

  if (root.nodeType !== Node.ELEMENT_NODE) return;

  const element = root as Element;

  if (isSkipped(element)) return;

  translateAttributes(element);
  element.querySelectorAll("*").forEach(translateAttributes);

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    translateText(node as Text);
  }
};

export const startDomTranslation = () => {
  if (getLang() !== "en" || typeof MutationObserver === "undefined") return;

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "characterData") {
        translateText(mutation.target as Text);
      } else if (mutation.type === "attributes") {
        translateAttributes(mutation.target as Element);
      } else {
        mutation.addedNodes.forEach(translateTree);
      }
    }
  });

  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ATTRIBUTES,
  });

  translateTree(document.body);
};
