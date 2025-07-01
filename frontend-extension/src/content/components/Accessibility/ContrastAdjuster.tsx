import React, { useState } from "react";
import { theme, buttonStyle } from "../../utils/Styles";
import Header from "../../utils/Header";
import { FaAccessibleIcon } from "react-icons/fa";

function parseRGB(color: string): [number, number, number] {
  const match = color.match(/\d+/g);
  if (!match) return [255, 255, 255];
  return [parseInt(match[0]), parseInt(match[1]), parseInt(match[2])];
}

function rgbToHls(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h, l, s];
}

function hlsToRgb(h: number, l: number, s: number): [number, number, number] {
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function hasVisibleText(el: HTMLElement): boolean {
  return !!el.textContent && el.textContent.trim().length > 0;
}

function hasOwnBackground(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  const bg = style.backgroundColor;
  return !!bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent";
}

//register original styles
const originalStyles = new WeakMap<
  HTMLElement,
  {
    backgroundColor?: string;
    color?: string;
    borderColor?: string;
    borderStyle?: string;
    borderWidth?: string;
    textDecoration?: string;
  }
>();

function adjustBackgroundTextAndBorders(enable: boolean) {
  document.querySelectorAll<HTMLElement>("*").forEach((el) => {
    const style = window.getComputedStyle(el);
    const bgColor = style.backgroundColor;
    if (
      bgColor &&
      bgColor !== "rgba(0, 0, 0, 0)" &&
      bgColor !== "transparent"
    ) {
      if (enable) {
        if (!originalStyles.has(el)) {
          originalStyles.set(el, {
            backgroundColor: el.style.backgroundColor,
            color: el.style.color,
            borderColor: el.style.borderColor,
            borderStyle: el.style.borderStyle,
            borderWidth: el.style.borderWidth,
            textDecoration: el.style.textDecoration,
          });
        }
        const rgb = parseRGB(bgColor);
        const [h, l, s] = rgbToHls(rgb[0], rgb[1], rgb[2]);
        let newL: number;
        let newBg: [number, number, number];
        let newText: [number, number, number] | null = null;
        let borderColor: string;

        if (l < 0.5) {
          newL = Math.max(0, l - 0.2);
          newBg = hlsToRgb(h, newL, s);
          borderColor = "#fff";
          if (hasVisibleText(el)) {
            newText = [255, 255, 255];
          }
        } else {
          newL = Math.min(1, l + 0.2);
          newBg = hlsToRgb(h, newL, s);
          borderColor = "#000";
          if (hasVisibleText(el)) {
            newText = [0, 0, 0];
          }
        }
        el.style.backgroundColor = `rgb(${newBg[0]},${newBg[1]},${newBg[2]})`;
        if (newText) {
          el.style.color = `rgb(${newText[0]},${newText[1]},${newText[2]})`;
        }
        el.style.borderColor = borderColor;
        el.style.borderStyle = "solid";
        el.style.borderWidth = "0.5px";

        // handle all descendants with text and not its own background
        const descendants = el.querySelectorAll<HTMLElement>("*");
        descendants.forEach((desc) => {
          if (hasVisibleText(desc) && !hasOwnBackground(desc)) {
            if (!originalStyles.has(desc)) {
              originalStyles.set(desc, {
                backgroundColor: desc.style.backgroundColor,
                color: desc.style.color,
                borderColor: desc.style.borderColor,
                borderStyle: desc.style.borderStyle,
                borderWidth: desc.style.borderWidth,
                textDecoration: desc.style.textDecoration,
              });
            }
            desc.style.color = l < 0.5 ? "#fff" : "#000";
          }
        });
      } else {
        //restore original styles
        const orig = originalStyles.get(el);
        if (orig) {
          el.style.backgroundColor = orig.backgroundColor ?? "";
          el.style.color = orig.color ?? "";
          el.style.borderColor = orig.borderColor ?? "";
          el.style.borderStyle = orig.borderStyle ?? "";
          el.style.borderWidth = orig.borderWidth ?? "";
          el.style.textDecoration = orig.textDecoration ?? "";
        }
        // restore descendants
        const descendants = el.querySelectorAll<HTMLElement>("*");
        descendants.forEach((desc) => {
          const origDesc = originalStyles.get(desc);
          if (origDesc) {
            desc.style.backgroundColor = origDesc.backgroundColor ?? "";
            desc.style.color = origDesc.color ?? "";
            desc.style.borderColor = origDesc.borderColor ?? "";
            desc.style.borderStyle = origDesc.borderStyle ?? "";
            desc.style.borderWidth = origDesc.borderWidth ?? "";
            desc.style.textDecoration = origDesc.textDecoration ?? "";
          }
        });
      }
    } else if (!enable) {
      const orig = originalStyles.get(el);
      if (orig) {
        el.style.backgroundColor = orig.backgroundColor ?? "";
        el.style.color = orig.color ?? "";
        el.style.borderColor = orig.borderColor ?? "";
        el.style.borderStyle = orig.borderStyle ?? "";
        el.style.borderWidth = orig.borderWidth ?? "";
        el.style.textDecoration = orig.textDecoration ?? "";
      }
    }
  });
}

function addLinkDecorations() {
  document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((a) => {
    a.style.textDecoration = "underline";

    if (a.dataset.hasIcon === "true") return;

    const href = a.getAttribute("href") || "";
    const isSamePage =
      href.startsWith("#") ||
      (a.origin === window.location.origin &&
        a.pathname === window.location.pathname &&
        a.hash.length > 0 &&
        a.hash === href);

    if (isSamePage) return;

    const color = window.getComputedStyle(a).color;

    const iconSpan = document.createElement("span");
    iconSpan.style.display = "inline";
    iconSpan.style.verticalAlign = "middle";
    iconSpan.style.marginLeft = "2px";
    iconSpan.style.color = color;

    a.dataset.hasIcon = "true";

    iconSpan.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" style="display:inline;vertical-align:middle" viewBox="0 0 20 20" fill="currentColor" aria-label="external link">
        <path d="M14 3h3a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0V5.41l-9.3 9.3a1 1 0 0 1-1.4-1.42l9.3-9.3H14a1 1 0 1 1 0-2z"/>
      </svg>
    `;

    a.appendChild(iconSpan);
  });
}

function removeLinkDecorations() {
  document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((a) => {
    a.style.textDecoration = "";
    if (a.dataset.hasIcon === "true") {
      const last = a.lastChild;
      if (
        last &&
        last.nodeType === Node.ELEMENT_NODE &&
        (last as HTMLElement).tagName === "SPAN"
      ) {
        a.removeChild(last);
      }
      delete a.dataset.hasIcon;
    }
  });
}

const ContrastAdjuster: React.FC = () => {
  const [enabled, setEnabled] = useState(false);

  const handleToggle = () => {
    setEnabled((prev) => {
      const next = !prev;
      adjustBackgroundTextAndBorders(next);
      if (next) {
        setTimeout(addLinkDecorations, 0);
      } else {
        removeLinkDecorations();
      }
      return next;
    });
  };

  return (
    <>
      <Header title="Adjust Accessibility" icon={<FaAccessibleIcon />} />
      <div
        style={{
          fontFamily: theme.fontFamily,
          background: theme.backgroundColor,
          color: theme.color,
        }}
      >
        <button
          style={buttonStyle}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = theme.accentColorDark)
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = theme.accentColor)
          }
          onClick={() => {
            handleToggle();
            setEnabled(!enabled);
          }}
          aria-pressed={enabled}
        >
          {enabled ? "Restore Colors" : "Adjust Background, Text & Borders"}
        </button>
      </div>
    </>
  );
};

export default ContrastAdjuster;
