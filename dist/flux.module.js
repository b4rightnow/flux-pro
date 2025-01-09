// node_modules/@oddbird/popover-polyfill/dist/popover.js
var ToggleEvent = class extends Event {
  oldState;
  newState;
  constructor(type, { oldState = "", newState = "", ...init } = {}) {
    super(type, init);
    this.oldState = String(oldState || "");
    this.newState = String(newState || "");
  }
};
var popoverToggleTaskQueue = /* @__PURE__ */ new WeakMap();
function queuePopoverToggleEventTask(element2, oldState, newState) {
  popoverToggleTaskQueue.set(
    element2,
    setTimeout(() => {
      if (!popoverToggleTaskQueue.has(element2)) return;
      element2.dispatchEvent(
        new ToggleEvent("toggle", {
          cancelable: false,
          oldState,
          newState
        })
      );
    }, 0)
  );
}
var ShadowRoot2 = globalThis.ShadowRoot || function() {
};
var HTMLDialogElement = globalThis.HTMLDialogElement || function() {
};
var topLayerElements = /* @__PURE__ */ new WeakMap();
var autoPopoverList = /* @__PURE__ */ new WeakMap();
var visibilityState = /* @__PURE__ */ new WeakMap();
function getPopoverVisibilityState(popover) {
  return visibilityState.get(popover) || "hidden";
}
var popoverInvoker = /* @__PURE__ */ new WeakMap();
function popoverTargetAttributeActivationBehavior(element2) {
  const popover = element2.popoverTargetElement;
  if (!(popover instanceof HTMLElement)) {
    return;
  }
  const visibility = getPopoverVisibilityState(popover);
  if (element2.popoverTargetAction === "show" && visibility === "showing") {
    return;
  }
  if (element2.popoverTargetAction === "hide" && visibility === "hidden") return;
  if (visibility === "showing") {
    hidePopover(popover, true, true);
  } else if (checkPopoverValidity(popover, false)) {
    popoverInvoker.set(popover, element2);
    showPopover(popover);
  }
}
function checkPopoverValidity(element2, expectedToBeShowing) {
  if (element2.popover !== "auto" && element2.popover !== "manual") {
    return false;
  }
  if (!element2.isConnected) return false;
  if (expectedToBeShowing && getPopoverVisibilityState(element2) !== "showing") {
    return false;
  }
  if (!expectedToBeShowing && getPopoverVisibilityState(element2) !== "hidden") {
    return false;
  }
  if (element2 instanceof HTMLDialogElement && element2.hasAttribute("open")) {
    return false;
  }
  if (document.fullscreenElement === element2) return false;
  return true;
}
function getStackPosition(popover) {
  if (!popover) return 0;
  return Array.from(autoPopoverList.get(popover.ownerDocument) || []).indexOf(
    popover
  ) + 1;
}
function topMostClickedPopover(target) {
  const clickedPopover = nearestInclusiveOpenPopover(target);
  const invokerPopover = nearestInclusiveTargetPopoverForInvoker(target);
  if (getStackPosition(clickedPopover) > getStackPosition(invokerPopover)) {
    return clickedPopover;
  }
  return invokerPopover;
}
function topMostAutoPopover(document2) {
  const documentPopovers = autoPopoverList.get(document2);
  for (const popover of documentPopovers || []) {
    if (!popover.isConnected) {
      documentPopovers.delete(popover);
    } else {
      return popover;
    }
  }
  return null;
}
function getRootNode(node) {
  if (typeof node.getRootNode === "function") {
    return node.getRootNode();
  }
  if (node.parentNode) return getRootNode(node.parentNode);
  return node;
}
function nearestInclusiveOpenPopover(node) {
  while (node) {
    if (node instanceof HTMLElement && node.popover === "auto" && visibilityState.get(node) === "showing") {
      return node;
    }
    node = node instanceof Element && node.assignedSlot || node.parentElement || getRootNode(node);
    if (node instanceof ShadowRoot2) node = node.host;
    if (node instanceof Document) return;
  }
}
function nearestInclusiveTargetPopoverForInvoker(node) {
  while (node) {
    const nodePopover = node.popoverTargetElement;
    if (nodePopover instanceof HTMLElement) return nodePopover;
    node = node.parentElement || getRootNode(node);
    if (node instanceof ShadowRoot2) node = node.host;
    if (node instanceof Document) return;
  }
}
function topMostPopoverAncestor(newPopover) {
  const popoverPositions = /* @__PURE__ */ new Map();
  let i = 0;
  for (const popover of autoPopoverList.get(newPopover.ownerDocument) || []) {
    popoverPositions.set(popover, i);
    i += 1;
  }
  popoverPositions.set(newPopover, i);
  i += 1;
  let topMostPopoverAncestor22 = null;
  function checkAncestor(candidate) {
    const candidateAncestor = nearestInclusiveOpenPopover(candidate);
    if (candidateAncestor === null) return null;
    const candidatePosition = popoverPositions.get(candidateAncestor);
    if (topMostPopoverAncestor22 === null || popoverPositions.get(topMostPopoverAncestor22) < candidatePosition) {
      topMostPopoverAncestor22 = candidateAncestor;
    }
  }
  checkAncestor(newPopover.parentElement || getRootNode(newPopover));
  return topMostPopoverAncestor22;
}
function isFocusable(focusTarget) {
  if (focusTarget.hidden || focusTarget instanceof ShadowRoot2) return false;
  if (focusTarget instanceof HTMLButtonElement || focusTarget instanceof HTMLInputElement || focusTarget instanceof HTMLSelectElement || focusTarget instanceof HTMLTextAreaElement || focusTarget instanceof HTMLOptGroupElement || focusTarget instanceof HTMLOptionElement || focusTarget instanceof HTMLFieldSetElement) {
    if (focusTarget.disabled) return false;
  }
  if (focusTarget instanceof HTMLInputElement && focusTarget.type === "hidden") {
    return false;
  }
  if (focusTarget instanceof HTMLAnchorElement && focusTarget.href === "") {
    return false;
  }
  return typeof focusTarget.tabIndex === "number" && focusTarget.tabIndex !== -1;
}
function focusDelegate(focusTarget) {
  if (focusTarget.shadowRoot && focusTarget.shadowRoot.delegatesFocus !== true) {
    return null;
  }
  let whereToLook = focusTarget;
  if (whereToLook.shadowRoot) {
    whereToLook = whereToLook.shadowRoot;
  }
  let autoFocusDelegate = whereToLook.querySelector("[autofocus]");
  if (autoFocusDelegate) {
    return autoFocusDelegate;
  } else {
    const slots = whereToLook.querySelectorAll("slot");
    for (const slot of slots) {
      const assignedElements = slot.assignedElements({ flatten: true });
      for (const el of assignedElements) {
        if (el.hasAttribute("autofocus")) {
          return el;
        } else {
          autoFocusDelegate = el.querySelector("[autofocus]");
          if (autoFocusDelegate) {
            return autoFocusDelegate;
          }
        }
      }
    }
  }
  const walker2 = focusTarget.ownerDocument.createTreeWalker(
    whereToLook,
    NodeFilter.SHOW_ELEMENT
  );
  let descendant = walker2.currentNode;
  while (descendant) {
    if (isFocusable(descendant)) {
      return descendant;
    }
    descendant = walker2.nextNode();
  }
}
function popoverFocusingSteps(subject) {
  focusDelegate(subject)?.focus();
}
var previouslyFocusedElements = /* @__PURE__ */ new WeakMap();
function showPopover(element2) {
  if (!checkPopoverValidity(element2, false)) {
    return;
  }
  const document2 = element2.ownerDocument;
  if (!element2.dispatchEvent(
    new ToggleEvent("beforetoggle", {
      cancelable: true,
      oldState: "closed",
      newState: "open"
    })
  )) {
    return;
  }
  if (!checkPopoverValidity(element2, false)) {
    return;
  }
  let shouldRestoreFocus = false;
  if (element2.popover === "auto") {
    const originalType = element2.getAttribute("popover");
    const ancestor = topMostPopoverAncestor(element2) || document2;
    hideAllPopoversUntil(ancestor, false, true);
    if (originalType !== element2.getAttribute("popover") || !checkPopoverValidity(element2, false)) {
      return;
    }
  }
  if (!topMostAutoPopover(document2)) {
    shouldRestoreFocus = true;
  }
  previouslyFocusedElements.delete(element2);
  const originallyFocusedElement = document2.activeElement;
  element2.classList.add(":popover-open");
  visibilityState.set(element2, "showing");
  if (!topLayerElements.has(document2)) {
    topLayerElements.set(document2, /* @__PURE__ */ new Set());
  }
  topLayerElements.get(document2).add(element2);
  popoverFocusingSteps(element2);
  if (element2.popover === "auto") {
    if (!autoPopoverList.has(document2)) {
      autoPopoverList.set(document2, /* @__PURE__ */ new Set());
    }
    autoPopoverList.get(document2).add(element2);
    setInvokerAriaExpanded(popoverInvoker.get(element2), true);
  }
  if (shouldRestoreFocus && originallyFocusedElement && element2.popover === "auto") {
    previouslyFocusedElements.set(element2, originallyFocusedElement);
  }
  queuePopoverToggleEventTask(element2, "closed", "open");
}
function hidePopover(element2, focusPreviousElement = false, fireEvents = false) {
  if (!checkPopoverValidity(element2, true)) {
    return;
  }
  const document2 = element2.ownerDocument;
  if (element2.popover === "auto") {
    hideAllPopoversUntil(element2, focusPreviousElement, fireEvents);
    if (!checkPopoverValidity(element2, true)) {
      return;
    }
  }
  setInvokerAriaExpanded(popoverInvoker.get(element2), false);
  popoverInvoker.delete(element2);
  if (fireEvents) {
    element2.dispatchEvent(
      new ToggleEvent("beforetoggle", {
        oldState: "open",
        newState: "closed"
      })
    );
    if (!checkPopoverValidity(element2, true)) {
      return;
    }
  }
  topLayerElements.get(document2)?.delete(element2);
  autoPopoverList.get(document2)?.delete(element2);
  element2.classList.remove(":popover-open");
  visibilityState.set(element2, "hidden");
  if (fireEvents) {
    queuePopoverToggleEventTask(element2, "open", "closed");
  }
  const previouslyFocusedElement = previouslyFocusedElements.get(element2);
  if (previouslyFocusedElement) {
    previouslyFocusedElements.delete(element2);
    if (focusPreviousElement) {
      previouslyFocusedElement.focus();
    }
  }
}
function closeAllOpenPopovers(document2, focusPreviousElement = false, fireEvents = false) {
  let popover = topMostAutoPopover(document2);
  while (popover) {
    hidePopover(popover, focusPreviousElement, fireEvents);
    popover = topMostAutoPopover(document2);
  }
}
function hideAllPopoversUntil(endpoint, focusPreviousElement, fireEvents) {
  const document2 = endpoint.ownerDocument || endpoint;
  if (endpoint instanceof Document) {
    return closeAllOpenPopovers(document2, focusPreviousElement, fireEvents);
  }
  let lastToHide = null;
  let foundEndpoint = false;
  for (const popover of autoPopoverList.get(document2) || []) {
    if (popover === endpoint) {
      foundEndpoint = true;
    } else if (foundEndpoint) {
      lastToHide = popover;
      break;
    }
  }
  if (!foundEndpoint) {
    return closeAllOpenPopovers(document2, focusPreviousElement, fireEvents);
  }
  while (lastToHide && getPopoverVisibilityState(lastToHide) === "showing" && autoPopoverList.get(document2)?.size) {
    hidePopover(lastToHide, focusPreviousElement, fireEvents);
  }
}
var popoverPointerDownTargets = /* @__PURE__ */ new WeakMap();
function lightDismissOpenPopovers(event) {
  if (!event.isTrusted) return;
  const target = event.composedPath()[0];
  if (!target) return;
  const document2 = target.ownerDocument;
  const topMostPopover = topMostAutoPopover(document2);
  if (!topMostPopover) return;
  const ancestor = topMostClickedPopover(target);
  if (ancestor && event.type === "pointerdown") {
    popoverPointerDownTargets.set(document2, ancestor);
  } else if (event.type === "pointerup") {
    const sameTarget = popoverPointerDownTargets.get(document2) === ancestor;
    popoverPointerDownTargets.delete(document2);
    if (sameTarget) {
      hideAllPopoversUntil(ancestor || document2, false, true);
    }
  }
}
var initialAriaExpandedValue = /* @__PURE__ */ new WeakMap();
function setInvokerAriaExpanded(el, force = false) {
  if (!el) return;
  if (!initialAriaExpandedValue.has(el)) {
    initialAriaExpandedValue.set(el, el.getAttribute("aria-expanded"));
  }
  const popover = el.popoverTargetElement;
  if (popover instanceof HTMLElement && popover.popover === "auto") {
    el.setAttribute("aria-expanded", String(force));
  } else {
    const initialValue = initialAriaExpandedValue.get(el);
    if (!initialValue) {
      el.removeAttribute("aria-expanded");
    } else {
      el.setAttribute("aria-expanded", initialValue);
    }
  }
}
var ShadowRoot22 = globalThis.ShadowRoot || function() {
};
function isSupported() {
  return typeof HTMLElement !== "undefined" && typeof HTMLElement.prototype === "object" && "popover" in HTMLElement.prototype;
}
function patchSelectorFn(object, name, mapper) {
  const original = object[name];
  Object.defineProperty(object, name, {
    value(selector) {
      return original.call(this, mapper(selector));
    }
  });
}
var nonEscapedPopoverSelector = /(^|[^\\]):popover-open\b/g;
function hasLayerSupport() {
  return typeof globalThis.CSSLayerBlockRule === "function";
}
function getStyles() {
  const useLayer = hasLayerSupport();
  return `
${useLayer ? "@layer popover-polyfill {" : ""}
  :where([popover]) {
    position: fixed;
    z-index: 2147483647;
    inset: 0;
    padding: 0.25em;
    width: fit-content;
    height: fit-content;
    border-width: initial;
    border-color: initial;
    border-image: initial;
    border-style: solid;
    background-color: canvas;
    color: canvastext;
    overflow: auto;
    margin: auto;
  }

  :where([popover]:not(.\\:popover-open)) {
    display: none;
  }

  :where(dialog[popover].\\:popover-open) {
    display: block;
  }

  :where(dialog[popover][open]) {
    display: revert;
  }

  :where([anchor].\\:popover-open) {
    inset: auto;
  }

  :where([anchor]:popover-open) {
    inset: auto;
  }

  @supports not (background-color: canvas) {
    :where([popover]) {
      background-color: white;
      color: black;
    }
  }

  @supports (width: -moz-fit-content) {
    :where([popover]) {
      width: -moz-fit-content;
      height: -moz-fit-content;
    }
  }

  @supports not (inset: 0) {
    :where([popover]) {
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }
${useLayer ? "}" : ""}
`;
}
var popoverStyleSheet = null;
function injectStyles(root) {
  const styles = getStyles();
  if (popoverStyleSheet === null) {
    try {
      popoverStyleSheet = new CSSStyleSheet();
      popoverStyleSheet.replaceSync(styles);
    } catch {
      popoverStyleSheet = false;
    }
  }
  if (popoverStyleSheet === false) {
    const sheet = document.createElement("style");
    sheet.textContent = styles;
    if (root instanceof Document) {
      root.head.prepend(sheet);
    } else {
      root.prepend(sheet);
    }
  } else {
    root.adoptedStyleSheets = [popoverStyleSheet, ...root.adoptedStyleSheets];
  }
}
function apply() {
  if (typeof window === "undefined") return;
  window.ToggleEvent = window.ToggleEvent || ToggleEvent;
  function rewriteSelector(selector) {
    if (selector?.includes(":popover-open")) {
      selector = selector.replace(
        nonEscapedPopoverSelector,
        "$1.\\:popover-open"
      );
    }
    return selector;
  }
  patchSelectorFn(Document.prototype, "querySelector", rewriteSelector);
  patchSelectorFn(Document.prototype, "querySelectorAll", rewriteSelector);
  patchSelectorFn(Element.prototype, "querySelector", rewriteSelector);
  patchSelectorFn(Element.prototype, "querySelectorAll", rewriteSelector);
  patchSelectorFn(Element.prototype, "matches", rewriteSelector);
  patchSelectorFn(Element.prototype, "closest", rewriteSelector);
  patchSelectorFn(
    DocumentFragment.prototype,
    "querySelectorAll",
    rewriteSelector
  );
  Object.defineProperties(HTMLElement.prototype, {
    popover: {
      enumerable: true,
      configurable: true,
      get() {
        if (!this.hasAttribute("popover")) return null;
        const value = (this.getAttribute("popover") || "").toLowerCase();
        if (value === "" || value == "auto") return "auto";
        return "manual";
      },
      set(value) {
        this.setAttribute("popover", value);
      }
    },
    showPopover: {
      enumerable: true,
      configurable: true,
      value() {
        showPopover(this);
      }
    },
    hidePopover: {
      enumerable: true,
      configurable: true,
      value() {
        hidePopover(this, true, true);
      }
    },
    togglePopover: {
      enumerable: true,
      configurable: true,
      value(force) {
        if (visibilityState.get(this) === "showing" && force === void 0 || force === false) {
          hidePopover(this, true, true);
        } else if (force === void 0 || force === true) {
          showPopover(this);
        }
      }
    }
  });
  const originalAttachShadow = Element.prototype.attachShadow;
  if (originalAttachShadow) {
    Object.defineProperties(Element.prototype, {
      attachShadow: {
        enumerable: true,
        configurable: true,
        writable: true,
        value(options) {
          const shadowRoot = originalAttachShadow.call(this, options);
          injectStyles(shadowRoot);
          return shadowRoot;
        }
      }
    });
  }
  const originalAttachInternals = HTMLElement.prototype.attachInternals;
  if (originalAttachInternals) {
    Object.defineProperties(HTMLElement.prototype, {
      attachInternals: {
        enumerable: true,
        configurable: true,
        writable: true,
        value() {
          const internals = originalAttachInternals.call(this);
          if (internals.shadowRoot) {
            injectStyles(internals.shadowRoot);
          }
          return internals;
        }
      }
    });
  }
  const popoverTargetAssociatedElements = /* @__PURE__ */ new WeakMap();
  function applyPopoverInvokerElementMixin(ElementClass) {
    Object.defineProperties(ElementClass.prototype, {
      popoverTargetElement: {
        enumerable: true,
        configurable: true,
        set(targetElement) {
          if (targetElement === null) {
            this.removeAttribute("popovertarget");
            popoverTargetAssociatedElements.delete(this);
          } else if (!(targetElement instanceof Element)) {
            throw new TypeError(
              `popoverTargetElement must be an element or null`
            );
          } else {
            this.setAttribute("popovertarget", "");
            popoverTargetAssociatedElements.set(this, targetElement);
          }
        },
        get() {
          if (this.localName !== "button" && this.localName !== "input") {
            return null;
          }
          if (this.localName === "input" && this.type !== "reset" && this.type !== "image" && this.type !== "button") {
            return null;
          }
          if (this.disabled) {
            return null;
          }
          if (this.form && this.type === "submit") {
            return null;
          }
          const targetElement = popoverTargetAssociatedElements.get(this);
          if (targetElement && targetElement.isConnected) {
            return targetElement;
          } else if (targetElement && !targetElement.isConnected) {
            popoverTargetAssociatedElements.delete(this);
            return null;
          }
          const root = getRootNode(this);
          const idref = this.getAttribute("popovertarget");
          if ((root instanceof Document || root instanceof ShadowRoot22) && idref) {
            return root.getElementById(idref) || null;
          }
          return null;
        }
      },
      popoverTargetAction: {
        enumerable: true,
        configurable: true,
        get() {
          const value = (this.getAttribute("popovertargetaction") || "").toLowerCase();
          if (value === "show" || value === "hide") return value;
          return "toggle";
        },
        set(value) {
          this.setAttribute("popovertargetaction", value);
        }
      }
    });
  }
  applyPopoverInvokerElementMixin(HTMLButtonElement);
  applyPopoverInvokerElementMixin(HTMLInputElement);
  const handleInvokerActivation = (event) => {
    const composedPath = event.composedPath();
    const target = composedPath[0];
    if (!(target instanceof Element) || target?.shadowRoot) {
      return;
    }
    const root = getRootNode(target);
    if (!(root instanceof ShadowRoot22 || root instanceof Document)) {
      return;
    }
    const invoker = composedPath.find(
      (el) => el.matches?.("[popovertargetaction],[popovertarget]")
    );
    if (invoker) {
      popoverTargetAttributeActivationBehavior(invoker);
      event.preventDefault();
      return;
    }
  };
  const onKeydown = (event) => {
    const key = event.key;
    const target = event.target;
    if (!event.defaultPrevented && target && (key === "Escape" || key === "Esc")) {
      hideAllPopoversUntil(target.ownerDocument, true, true);
    }
  };
  const addEventListeners = (root) => {
    root.addEventListener("click", handleInvokerActivation);
    root.addEventListener("keydown", onKeydown);
    root.addEventListener("pointerdown", lightDismissOpenPopovers);
    root.addEventListener("pointerup", lightDismissOpenPopovers);
  };
  addEventListeners(document);
  injectStyles(document);
}
if (!isSupported()) apply();

// node_modules/@oddbird/popover-polyfill/dist/popover-fn.js
var ToggleEvent2 = class extends Event {
  oldState;
  newState;
  constructor(type, { oldState = "", newState = "", ...init } = {}) {
    super(type, init);
    this.oldState = String(oldState || "");
    this.newState = String(newState || "");
  }
};
var popoverToggleTaskQueue2 = /* @__PURE__ */ new WeakMap();
function queuePopoverToggleEventTask2(element2, oldState, newState) {
  popoverToggleTaskQueue2.set(
    element2,
    setTimeout(() => {
      if (!popoverToggleTaskQueue2.has(element2)) return;
      element2.dispatchEvent(
        new ToggleEvent2("toggle", {
          cancelable: false,
          oldState,
          newState
        })
      );
    }, 0)
  );
}
var ShadowRoot3 = globalThis.ShadowRoot || function() {
};
var HTMLDialogElement2 = globalThis.HTMLDialogElement || function() {
};
var topLayerElements2 = /* @__PURE__ */ new WeakMap();
var autoPopoverList2 = /* @__PURE__ */ new WeakMap();
var visibilityState2 = /* @__PURE__ */ new WeakMap();
function getPopoverVisibilityState2(popover) {
  return visibilityState2.get(popover) || "hidden";
}
var popoverInvoker2 = /* @__PURE__ */ new WeakMap();
function popoverTargetAttributeActivationBehavior2(element2) {
  const popover = element2.popoverTargetElement;
  if (!(popover instanceof HTMLElement)) {
    return;
  }
  const visibility = getPopoverVisibilityState2(popover);
  if (element2.popoverTargetAction === "show" && visibility === "showing") {
    return;
  }
  if (element2.popoverTargetAction === "hide" && visibility === "hidden") return;
  if (visibility === "showing") {
    hidePopover2(popover, true, true);
  } else if (checkPopoverValidity2(popover, false)) {
    popoverInvoker2.set(popover, element2);
    showPopover2(popover);
  }
}
function checkPopoverValidity2(element2, expectedToBeShowing) {
  if (element2.popover !== "auto" && element2.popover !== "manual") {
    return false;
  }
  if (!element2.isConnected) return false;
  if (expectedToBeShowing && getPopoverVisibilityState2(element2) !== "showing") {
    return false;
  }
  if (!expectedToBeShowing && getPopoverVisibilityState2(element2) !== "hidden") {
    return false;
  }
  if (element2 instanceof HTMLDialogElement2 && element2.hasAttribute("open")) {
    return false;
  }
  if (document.fullscreenElement === element2) return false;
  return true;
}
function getStackPosition2(popover) {
  if (!popover) return 0;
  return Array.from(autoPopoverList2.get(popover.ownerDocument) || []).indexOf(
    popover
  ) + 1;
}
function topMostClickedPopover2(target) {
  const clickedPopover = nearestInclusiveOpenPopover2(target);
  const invokerPopover = nearestInclusiveTargetPopoverForInvoker2(target);
  if (getStackPosition2(clickedPopover) > getStackPosition2(invokerPopover)) {
    return clickedPopover;
  }
  return invokerPopover;
}
function topMostAutoPopover2(document2) {
  const documentPopovers = autoPopoverList2.get(document2);
  for (const popover of documentPopovers || []) {
    if (!popover.isConnected) {
      documentPopovers.delete(popover);
    } else {
      return popover;
    }
  }
  return null;
}
function getRootNode2(node) {
  if (typeof node.getRootNode === "function") {
    return node.getRootNode();
  }
  if (node.parentNode) return getRootNode2(node.parentNode);
  return node;
}
function nearestInclusiveOpenPopover2(node) {
  while (node) {
    if (node instanceof HTMLElement && node.popover === "auto" && visibilityState2.get(node) === "showing") {
      return node;
    }
    node = node instanceof Element && node.assignedSlot || node.parentElement || getRootNode2(node);
    if (node instanceof ShadowRoot3) node = node.host;
    if (node instanceof Document) return;
  }
}
function nearestInclusiveTargetPopoverForInvoker2(node) {
  while (node) {
    const nodePopover = node.popoverTargetElement;
    if (nodePopover instanceof HTMLElement) return nodePopover;
    node = node.parentElement || getRootNode2(node);
    if (node instanceof ShadowRoot3) node = node.host;
    if (node instanceof Document) return;
  }
}
function topMostPopoverAncestor2(newPopover) {
  const popoverPositions = /* @__PURE__ */ new Map();
  let i = 0;
  for (const popover of autoPopoverList2.get(newPopover.ownerDocument) || []) {
    popoverPositions.set(popover, i);
    i += 1;
  }
  popoverPositions.set(newPopover, i);
  i += 1;
  let topMostPopoverAncestor22 = null;
  function checkAncestor(candidate) {
    const candidateAncestor = nearestInclusiveOpenPopover2(candidate);
    if (candidateAncestor === null) return null;
    const candidatePosition = popoverPositions.get(candidateAncestor);
    if (topMostPopoverAncestor22 === null || popoverPositions.get(topMostPopoverAncestor22) < candidatePosition) {
      topMostPopoverAncestor22 = candidateAncestor;
    }
  }
  checkAncestor(newPopover.parentElement || getRootNode2(newPopover));
  return topMostPopoverAncestor22;
}
function isFocusable2(focusTarget) {
  if (focusTarget.hidden || focusTarget instanceof ShadowRoot3) return false;
  if (focusTarget instanceof HTMLButtonElement || focusTarget instanceof HTMLInputElement || focusTarget instanceof HTMLSelectElement || focusTarget instanceof HTMLTextAreaElement || focusTarget instanceof HTMLOptGroupElement || focusTarget instanceof HTMLOptionElement || focusTarget instanceof HTMLFieldSetElement) {
    if (focusTarget.disabled) return false;
  }
  if (focusTarget instanceof HTMLInputElement && focusTarget.type === "hidden") {
    return false;
  }
  if (focusTarget instanceof HTMLAnchorElement && focusTarget.href === "") {
    return false;
  }
  return typeof focusTarget.tabIndex === "number" && focusTarget.tabIndex !== -1;
}
function focusDelegate2(focusTarget) {
  if (focusTarget.shadowRoot && focusTarget.shadowRoot.delegatesFocus !== true) {
    return null;
  }
  let whereToLook = focusTarget;
  if (whereToLook.shadowRoot) {
    whereToLook = whereToLook.shadowRoot;
  }
  let autoFocusDelegate = whereToLook.querySelector("[autofocus]");
  if (autoFocusDelegate) {
    return autoFocusDelegate;
  } else {
    const slots = whereToLook.querySelectorAll("slot");
    for (const slot of slots) {
      const assignedElements = slot.assignedElements({ flatten: true });
      for (const el of assignedElements) {
        if (el.hasAttribute("autofocus")) {
          return el;
        } else {
          autoFocusDelegate = el.querySelector("[autofocus]");
          if (autoFocusDelegate) {
            return autoFocusDelegate;
          }
        }
      }
    }
  }
  const walker2 = focusTarget.ownerDocument.createTreeWalker(
    whereToLook,
    NodeFilter.SHOW_ELEMENT
  );
  let descendant = walker2.currentNode;
  while (descendant) {
    if (isFocusable2(descendant)) {
      return descendant;
    }
    descendant = walker2.nextNode();
  }
}
function popoverFocusingSteps2(subject) {
  focusDelegate2(subject)?.focus();
}
var previouslyFocusedElements2 = /* @__PURE__ */ new WeakMap();
function showPopover2(element2) {
  if (!checkPopoverValidity2(element2, false)) {
    return;
  }
  const document2 = element2.ownerDocument;
  if (!element2.dispatchEvent(
    new ToggleEvent2("beforetoggle", {
      cancelable: true,
      oldState: "closed",
      newState: "open"
    })
  )) {
    return;
  }
  if (!checkPopoverValidity2(element2, false)) {
    return;
  }
  let shouldRestoreFocus = false;
  if (element2.popover === "auto") {
    const originalType = element2.getAttribute("popover");
    const ancestor = topMostPopoverAncestor2(element2) || document2;
    hideAllPopoversUntil2(ancestor, false, true);
    if (originalType !== element2.getAttribute("popover") || !checkPopoverValidity2(element2, false)) {
      return;
    }
  }
  if (!topMostAutoPopover2(document2)) {
    shouldRestoreFocus = true;
  }
  previouslyFocusedElements2.delete(element2);
  const originallyFocusedElement = document2.activeElement;
  element2.classList.add(":popover-open");
  visibilityState2.set(element2, "showing");
  if (!topLayerElements2.has(document2)) {
    topLayerElements2.set(document2, /* @__PURE__ */ new Set());
  }
  topLayerElements2.get(document2).add(element2);
  popoverFocusingSteps2(element2);
  if (element2.popover === "auto") {
    if (!autoPopoverList2.has(document2)) {
      autoPopoverList2.set(document2, /* @__PURE__ */ new Set());
    }
    autoPopoverList2.get(document2).add(element2);
    setInvokerAriaExpanded2(popoverInvoker2.get(element2), true);
  }
  if (shouldRestoreFocus && originallyFocusedElement && element2.popover === "auto") {
    previouslyFocusedElements2.set(element2, originallyFocusedElement);
  }
  queuePopoverToggleEventTask2(element2, "closed", "open");
}
function hidePopover2(element2, focusPreviousElement = false, fireEvents = false) {
  if (!checkPopoverValidity2(element2, true)) {
    return;
  }
  const document2 = element2.ownerDocument;
  if (element2.popover === "auto") {
    hideAllPopoversUntil2(element2, focusPreviousElement, fireEvents);
    if (!checkPopoverValidity2(element2, true)) {
      return;
    }
  }
  setInvokerAriaExpanded2(popoverInvoker2.get(element2), false);
  popoverInvoker2.delete(element2);
  if (fireEvents) {
    element2.dispatchEvent(
      new ToggleEvent2("beforetoggle", {
        oldState: "open",
        newState: "closed"
      })
    );
    if (!checkPopoverValidity2(element2, true)) {
      return;
    }
  }
  topLayerElements2.get(document2)?.delete(element2);
  autoPopoverList2.get(document2)?.delete(element2);
  element2.classList.remove(":popover-open");
  visibilityState2.set(element2, "hidden");
  if (fireEvents) {
    queuePopoverToggleEventTask2(element2, "open", "closed");
  }
  const previouslyFocusedElement = previouslyFocusedElements2.get(element2);
  if (previouslyFocusedElement) {
    previouslyFocusedElements2.delete(element2);
    if (focusPreviousElement) {
      previouslyFocusedElement.focus();
    }
  }
}
function closeAllOpenPopovers2(document2, focusPreviousElement = false, fireEvents = false) {
  let popover = topMostAutoPopover2(document2);
  while (popover) {
    hidePopover2(popover, focusPreviousElement, fireEvents);
    popover = topMostAutoPopover2(document2);
  }
}
function hideAllPopoversUntil2(endpoint, focusPreviousElement, fireEvents) {
  const document2 = endpoint.ownerDocument || endpoint;
  if (endpoint instanceof Document) {
    return closeAllOpenPopovers2(document2, focusPreviousElement, fireEvents);
  }
  let lastToHide = null;
  let foundEndpoint = false;
  for (const popover of autoPopoverList2.get(document2) || []) {
    if (popover === endpoint) {
      foundEndpoint = true;
    } else if (foundEndpoint) {
      lastToHide = popover;
      break;
    }
  }
  if (!foundEndpoint) {
    return closeAllOpenPopovers2(document2, focusPreviousElement, fireEvents);
  }
  while (lastToHide && getPopoverVisibilityState2(lastToHide) === "showing" && autoPopoverList2.get(document2)?.size) {
    hidePopover2(lastToHide, focusPreviousElement, fireEvents);
  }
}
var popoverPointerDownTargets2 = /* @__PURE__ */ new WeakMap();
function lightDismissOpenPopovers2(event) {
  if (!event.isTrusted) return;
  const target = event.composedPath()[0];
  if (!target) return;
  const document2 = target.ownerDocument;
  const topMostPopover = topMostAutoPopover2(document2);
  if (!topMostPopover) return;
  const ancestor = topMostClickedPopover2(target);
  if (ancestor && event.type === "pointerdown") {
    popoverPointerDownTargets2.set(document2, ancestor);
  } else if (event.type === "pointerup") {
    const sameTarget = popoverPointerDownTargets2.get(document2) === ancestor;
    popoverPointerDownTargets2.delete(document2);
    if (sameTarget) {
      hideAllPopoversUntil2(ancestor || document2, false, true);
    }
  }
}
var initialAriaExpandedValue2 = /* @__PURE__ */ new WeakMap();
function setInvokerAriaExpanded2(el, force = false) {
  if (!el) return;
  if (!initialAriaExpandedValue2.has(el)) {
    initialAriaExpandedValue2.set(el, el.getAttribute("aria-expanded"));
  }
  const popover = el.popoverTargetElement;
  if (popover instanceof HTMLElement && popover.popover === "auto") {
    el.setAttribute("aria-expanded", String(force));
  } else {
    const initialValue = initialAriaExpandedValue2.get(el);
    if (!initialValue) {
      el.removeAttribute("aria-expanded");
    } else {
      el.setAttribute("aria-expanded", initialValue);
    }
  }
}
var ShadowRoot23 = globalThis.ShadowRoot || function() {
};
function isSupported2() {
  return typeof HTMLElement !== "undefined" && typeof HTMLElement.prototype === "object" && "popover" in HTMLElement.prototype;
}
function isPolyfilled() {
  return Boolean(
    document.body?.showPopover && !/native code/i.test(document.body.showPopover.toString())
  );
}
function patchSelectorFn2(object, name, mapper) {
  const original = object[name];
  Object.defineProperty(object, name, {
    value(selector) {
      return original.call(this, mapper(selector));
    }
  });
}
var nonEscapedPopoverSelector2 = /(^|[^\\]):popover-open\b/g;
function hasLayerSupport2() {
  return typeof globalThis.CSSLayerBlockRule === "function";
}
function getStyles2() {
  const useLayer = hasLayerSupport2();
  return `
${useLayer ? "@layer popover-polyfill {" : ""}
  :where([popover]) {
    position: fixed;
    z-index: 2147483647;
    inset: 0;
    padding: 0.25em;
    width: fit-content;
    height: fit-content;
    border-width: initial;
    border-color: initial;
    border-image: initial;
    border-style: solid;
    background-color: canvas;
    color: canvastext;
    overflow: auto;
    margin: auto;
  }

  :where([popover]:not(.\\:popover-open)) {
    display: none;
  }

  :where(dialog[popover].\\:popover-open) {
    display: block;
  }

  :where(dialog[popover][open]) {
    display: revert;
  }

  :where([anchor].\\:popover-open) {
    inset: auto;
  }

  :where([anchor]:popover-open) {
    inset: auto;
  }

  @supports not (background-color: canvas) {
    :where([popover]) {
      background-color: white;
      color: black;
    }
  }

  @supports (width: -moz-fit-content) {
    :where([popover]) {
      width: -moz-fit-content;
      height: -moz-fit-content;
    }
  }

  @supports not (inset: 0) {
    :where([popover]) {
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }
${useLayer ? "}" : ""}
`;
}
var popoverStyleSheet2 = null;
function injectStyles2(root) {
  const styles = getStyles2();
  if (popoverStyleSheet2 === null) {
    try {
      popoverStyleSheet2 = new CSSStyleSheet();
      popoverStyleSheet2.replaceSync(styles);
    } catch {
      popoverStyleSheet2 = false;
    }
  }
  if (popoverStyleSheet2 === false) {
    const sheet = document.createElement("style");
    sheet.textContent = styles;
    if (root instanceof Document) {
      root.head.prepend(sheet);
    } else {
      root.prepend(sheet);
    }
  } else {
    root.adoptedStyleSheets = [popoverStyleSheet2, ...root.adoptedStyleSheets];
  }
}
function apply2() {
  if (typeof window === "undefined") return;
  window.ToggleEvent = window.ToggleEvent || ToggleEvent2;
  function rewriteSelector(selector) {
    if (selector?.includes(":popover-open")) {
      selector = selector.replace(
        nonEscapedPopoverSelector2,
        "$1.\\:popover-open"
      );
    }
    return selector;
  }
  patchSelectorFn2(Document.prototype, "querySelector", rewriteSelector);
  patchSelectorFn2(Document.prototype, "querySelectorAll", rewriteSelector);
  patchSelectorFn2(Element.prototype, "querySelector", rewriteSelector);
  patchSelectorFn2(Element.prototype, "querySelectorAll", rewriteSelector);
  patchSelectorFn2(Element.prototype, "matches", rewriteSelector);
  patchSelectorFn2(Element.prototype, "closest", rewriteSelector);
  patchSelectorFn2(
    DocumentFragment.prototype,
    "querySelectorAll",
    rewriteSelector
  );
  Object.defineProperties(HTMLElement.prototype, {
    popover: {
      enumerable: true,
      configurable: true,
      get() {
        if (!this.hasAttribute("popover")) return null;
        const value = (this.getAttribute("popover") || "").toLowerCase();
        if (value === "" || value == "auto") return "auto";
        return "manual";
      },
      set(value) {
        this.setAttribute("popover", value);
      }
    },
    showPopover: {
      enumerable: true,
      configurable: true,
      value() {
        showPopover2(this);
      }
    },
    hidePopover: {
      enumerable: true,
      configurable: true,
      value() {
        hidePopover2(this, true, true);
      }
    },
    togglePopover: {
      enumerable: true,
      configurable: true,
      value(force) {
        if (visibilityState2.get(this) === "showing" && force === void 0 || force === false) {
          hidePopover2(this, true, true);
        } else if (force === void 0 || force === true) {
          showPopover2(this);
        }
      }
    }
  });
  const originalAttachShadow = Element.prototype.attachShadow;
  if (originalAttachShadow) {
    Object.defineProperties(Element.prototype, {
      attachShadow: {
        enumerable: true,
        configurable: true,
        writable: true,
        value(options) {
          const shadowRoot = originalAttachShadow.call(this, options);
          injectStyles2(shadowRoot);
          return shadowRoot;
        }
      }
    });
  }
  const originalAttachInternals = HTMLElement.prototype.attachInternals;
  if (originalAttachInternals) {
    Object.defineProperties(HTMLElement.prototype, {
      attachInternals: {
        enumerable: true,
        configurable: true,
        writable: true,
        value() {
          const internals = originalAttachInternals.call(this);
          if (internals.shadowRoot) {
            injectStyles2(internals.shadowRoot);
          }
          return internals;
        }
      }
    });
  }
  const popoverTargetAssociatedElements = /* @__PURE__ */ new WeakMap();
  function applyPopoverInvokerElementMixin(ElementClass) {
    Object.defineProperties(ElementClass.prototype, {
      popoverTargetElement: {
        enumerable: true,
        configurable: true,
        set(targetElement) {
          if (targetElement === null) {
            this.removeAttribute("popovertarget");
            popoverTargetAssociatedElements.delete(this);
          } else if (!(targetElement instanceof Element)) {
            throw new TypeError(
              `popoverTargetElement must be an element or null`
            );
          } else {
            this.setAttribute("popovertarget", "");
            popoverTargetAssociatedElements.set(this, targetElement);
          }
        },
        get() {
          if (this.localName !== "button" && this.localName !== "input") {
            return null;
          }
          if (this.localName === "input" && this.type !== "reset" && this.type !== "image" && this.type !== "button") {
            return null;
          }
          if (this.disabled) {
            return null;
          }
          if (this.form && this.type === "submit") {
            return null;
          }
          const targetElement = popoverTargetAssociatedElements.get(this);
          if (targetElement && targetElement.isConnected) {
            return targetElement;
          } else if (targetElement && !targetElement.isConnected) {
            popoverTargetAssociatedElements.delete(this);
            return null;
          }
          const root = getRootNode2(this);
          const idref = this.getAttribute("popovertarget");
          if ((root instanceof Document || root instanceof ShadowRoot23) && idref) {
            return root.getElementById(idref) || null;
          }
          return null;
        }
      },
      popoverTargetAction: {
        enumerable: true,
        configurable: true,
        get() {
          const value = (this.getAttribute("popovertargetaction") || "").toLowerCase();
          if (value === "show" || value === "hide") return value;
          return "toggle";
        },
        set(value) {
          this.setAttribute("popovertargetaction", value);
        }
      }
    });
  }
  applyPopoverInvokerElementMixin(HTMLButtonElement);
  applyPopoverInvokerElementMixin(HTMLInputElement);
  const handleInvokerActivation = (event) => {
    const composedPath = event.composedPath();
    const target = composedPath[0];
    if (!(target instanceof Element) || target?.shadowRoot) {
      return;
    }
    const root = getRootNode2(target);
    if (!(root instanceof ShadowRoot23 || root instanceof Document)) {
      return;
    }
    const invoker = composedPath.find(
      (el) => el.matches?.("[popovertargetaction],[popovertarget]")
    );
    if (invoker) {
      popoverTargetAttributeActivationBehavior2(invoker);
      event.preventDefault();
      return;
    }
  };
  const onKeydown = (event) => {
    const key = event.key;
    const target = event.target;
    if (!event.defaultPrevented && target && (key === "Escape" || key === "Esc")) {
      hideAllPopoversUntil2(target.ownerDocument, true, true);
    }
  };
  const addEventListeners = (root) => {
    root.addEventListener("click", handleInvokerActivation);
    root.addEventListener("keydown", onKeydown);
    root.addEventListener("pointerdown", lightDismissOpenPopovers2);
    root.addEventListener("pointerup", lightDismissOpenPopovers2);
  };
  addEventListeners(document);
  injectStyles2(document);
}

// js/utils.js
function inject(callback) {
  let styles = callback({
    css: (strings, ...values) => strings.raw[0] + values.join("")
  });
  if (document.adoptedStyleSheets === void 0) {
    let styleElement = document.createElement("style");
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    return;
  }
  let sheet = new CSSStyleSheet();
  sheet.replaceSync(styles);
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
}
function closest(el, condition) {
  let current = el;
  while (current) {
    if (condition(current)) return current;
    current = current.parentElement;
  }
}
function walker(el, callback) {
  let walker2 = document.createTreeWalker(
    el,
    NodeFilter.SHOW_ELEMENT,
    callback ? {
      acceptNode: (el2) => {
        let skipped, rejected;
        callback(el2, {
          skip: () => skipped = true,
          reject: () => rejected = true
        });
        if (skipped) return NodeFilter.FILTER_SKIP;
        if (rejected) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    } : {}
  );
  return new Traverse(walker2);
}
var Traverse = class {
  constructor(walker2) {
    this.walker = walker2;
  }
  from(el) {
    this.walker.currentNode = el;
    return this;
  }
  first() {
    return this.walker.firstChild();
  }
  last() {
    return this.walker.lastChild();
  }
  next(el) {
    this.walker.currentNode = el;
    return this.walker.nextSibling();
  }
  nextOrFirst(el) {
    let found = this.next(el);
    if (found) return found;
    this.walker.currentNode = this.walker.root;
    return this.first();
  }
  prev(el) {
    this.walker.currentNode = el;
    return this.walker.previousSibling();
  }
  prevOrLast(el) {
    let found = this.prev(el);
    if (found) return found;
    this.walker.currentNode = this.walker.root;
    return this.last();
  }
  closest(el, condition) {
    let walker2 = this.from(el).walker;
    while (walker2.currentNode) {
      if (condition(walker2.currentNode)) return walker2.currentNode;
      walker2.parentNode();
    }
  }
  contains(el) {
    return this.find((i) => i === el);
  }
  find(callback) {
    return this.walk((el, bail) => {
      callback(el) && bail(el);
    });
  }
  findOrFirst(callback) {
    let found = this.find(callback);
    if (!found) this.walker.currentNode = this.walker.root;
    return this.first();
  }
  each(callback) {
    this.walk((el) => callback(el));
  }
  some(callback) {
    return !!this.find(callback);
  }
  every(callback) {
    let every = true;
    this.walk((el) => {
      callback(el) || (every = false);
    });
    return every;
  }
  map(callback) {
    let els = [];
    this.walk((el) => els.push(callback(el)));
    return els;
  }
  filter(callback) {
    let els = [];
    this.walk((el) => callback(el) && els.push(el));
    return els;
  }
  walk(callback) {
    let current;
    let walker2 = this.walker;
    let bailed;
    while (walker2.nextNode()) {
      current = walker2.currentNode;
      callback(current, (bailValue) => bailed = bailValue);
      if (bailed !== void 0) {
        break;
      }
    }
    return bailed;
  }
};
function element(name, type) {
  customElements.define(`ui-${name}`, type);
}
function on(target, event, handler, options = {}) {
  target.addEventListener(event, handler, options);
  return {
    off: () => target.removeEventListener(event, handler),
    pause: (callback) => {
      target.removeEventListener(event, handler), callback();
      target.addEventListener(event, handler);
    }
  };
}
function isFocusable3(el) {
  let selectors = [
    "a[href]",
    "area[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "button:not([disabled])",
    "iframe",
    "object",
    "embed",
    "[tabindex]",
    "[contenteditable]"
  ];
  return selectors.some((selector) => el.matches(selector)) && el.tabIndex >= 0;
}
function throttle(func, limit) {
  let inThrottle;
  return function() {
    let context = this, args = arguments;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
var using = "pointer";
document.addEventListener("keydown", () => using = "keyboard", { capture: true });
document.addEventListener("pointerdown", (e) => {
  using = e.pointerType === "mouse" ? "mouse" : "touch";
}, { capture: true });
function isUsingKeyboard() {
  return using === "keyboard";
}
function isUsingTouch() {
  return using === "touch";
}
function search(el, callback) {
  el.addEventListener("keydown", (e) => {
    if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
      callback(e.key);
      e.stopPropagation();
    }
  });
}
function dispenseId(el, prefix) {
  return "lofi-" + (prefix ? prefix + "-" : "") + Math.random().toString(16).slice(2);
}
function assignId(el, prefix) {
  let id = el.hasAttribute("id") ? el.getAttribute("id") : dispenseId(el, prefix);
  setAttribute2(el, "id", id);
  if (!el._x_bindings) el._x_bindings = {};
  if (!el._x_bindings.id) el._x_bindings.id = id;
  return id;
}
function detangle() {
  let blocked = false;
  return (callback) => (...args) => {
    if (blocked) return;
    blocked = true;
    callback(...args);
    blocked = false;
  };
}
function interest(trigger, panel, { gain, lose, focusable, safeArea }) {
  let engaged = false;
  focusable && document.addEventListener("focusin", (e) => {
    if (!isUsingKeyboard()) return;
    if (trigger.contains(e.target) || panel.contains(e.target)) {
      engaged = true;
      gain();
    } else {
      engaged = false;
      lose();
    }
  });
  let removeSafeArea = () => {
  };
  let removePointerMoveHandler = () => {
  };
  let disinterest = () => {
    engaged = false;
    lose();
    removeSafeArea();
    removePointerMoveHandler();
  };
  let clear = () => {
    engaged = false;
    removeSafeArea();
    removePointerMoveHandler();
  };
  trigger.addEventListener("pointerenter", (e) => {
    if (isUsingTouch()) return;
    if (engaged) return;
    engaged = true;
    gain();
    setTimeout(() => {
      let { safeArea: safeArea2, redraw: redrawSafeArea, remove } = createSafeArea(trigger, panel, e.clientX, e.clientY);
      removeSafeArea = remove;
      let pointerStoppedOverSafeAreaTimeout;
      let pointerMoveHandler = throttle((e2) => {
        let panelRect = panel.getBoundingClientRect();
        let triggerRect = trigger.getBoundingClientRect();
        let mouseState;
        if (safeArea2.contains(e2.target) && mouseIsExclusivelyInsideSafeArea(triggerRect, panelRect, e2.clientX, e2.clientY)) mouseState = "safeArea";
        else if (panel.contains(e2.target)) mouseState = "panel";
        else if (trigger.contains(e2.target)) mouseState = "trigger";
        else mouseState = "outside";
        if (pointerStoppedOverSafeAreaTimeout) {
          clearTimeout(pointerStoppedOverSafeAreaTimeout);
        }
        switch (mouseState) {
          case "outside":
            disinterest();
            break;
          case "trigger":
            redrawSafeArea(e2.clientX, e2.clientY);
            break;
          case "panel":
            removeSafeArea();
            break;
          case "safeArea":
            redrawSafeArea(e2.clientX, e2.clientY);
            pointerStoppedOverSafeAreaTimeout = setTimeout(() => {
              disinterest();
            }, 300);
            break;
          default:
            break;
        }
      }, 100);
      document.addEventListener("pointermove", pointerMoveHandler);
      removePointerMoveHandler = () => document.removeEventListener("pointermove", pointerMoveHandler);
    });
  });
  return { clear };
}
function createSafeArea(trigger, panel, x, y) {
  let safeArea = document.createElement("div");
  let panelRect = panel.getBoundingClientRect();
  let triggerRect = trigger.getBoundingClientRect();
  safeArea.style.position = "fixed";
  setAttribute2(safeArea, "data-safe-area", "");
  let draw = (x2, y2) => {
    if (panelRect.top === 0 && panelRect.bottom === 0) return;
    let direction;
    if (panelRect.left < triggerRect.left) direction = "left";
    if (panelRect.right > triggerRect.right) direction = "right";
    if (panelRect.top < triggerRect.top && panelRect.bottom < y2) direction = "up";
    if (panelRect.bottom > triggerRect.bottom && panelRect.top > y2) direction = "down";
    if (direction === void 0) direction = "right";
    let left, right, width, top, bottom, height, offset3, shape;
    let padding = 10;
    switch (direction) {
      case "left":
        left = panelRect.right;
        right = Math.max(panelRect.right, x2) + 5;
        width = right - left;
        top = Math.min(triggerRect.top, panelRect.top) - padding;
        bottom = Math.max(triggerRect.bottom, panelRect.bottom) + padding;
        height = bottom - top;
        offset3 = y2 - top;
        shape = `polygon(0% 0%, 100% ${offset3}px, 0% 100%)`;
        break;
      case "right":
        left = Math.min(panelRect.left, x2) - 5;
        right = panelRect.left;
        width = right - left;
        top = Math.min(triggerRect.top, panelRect.top) - padding;
        bottom = Math.max(triggerRect.bottom, panelRect.bottom) + padding;
        height = bottom - top;
        offset3 = y2 - top;
        shape = `polygon(0% ${offset3}px, 100% 0%, 100% 100%)`;
        break;
      case "up":
        left = Math.min(x2, panelRect.left) - padding;
        right = Math.max(x2, panelRect.right) + padding;
        width = right - left;
        top = panelRect.bottom;
        bottom = Math.max(panelRect.bottom, y2) + 5;
        height = bottom - top;
        offset3 = x2 - left;
        shape = `polygon(0% 0%, 100% 0%, ${offset3}px 100%)`;
        break;
      case "down":
        left = Math.min(x2, panelRect.left) - padding;
        right = Math.max(x2, panelRect.right) + padding;
        width = right - left;
        top = Math.min(panelRect.top, y2) - 5;
        bottom = panelRect.top;
        height = bottom - top;
        offset3 = x2 - left;
        shape = `polygon(${offset3}px 0%, 100% 100%, 0% 100%)`;
        break;
    }
    safeArea.style.left = `${left}px`;
    safeArea.style.top = `${top}px`;
    safeArea.style.width = `${width}px`;
    safeArea.style.height = `${height}px`;
    safeArea.style.clipPath = shape;
  };
  return {
    safeArea,
    redraw: (x2, y2) => {
      if (!safeArea.isConnected) trigger.appendChild(safeArea);
      draw(x2, y2);
    },
    remove: () => {
      safeArea.remove();
    }
  };
}
function mouseIsExclusivelyInsideSafeArea(triggerRect, panelRect, x, y) {
  return !mouseIsOverTrigger(triggerRect, x, y) && !mouseIsOverPanel(panelRect, x, y);
}
function mouseIsOverTrigger(triggerRect, x, y) {
  if (triggerRect.left <= x && x <= triggerRect.right && (triggerRect.top <= y && y <= triggerRect.bottom)) return true;
  return false;
}
function mouseIsOverPanel(panelRect, x, y) {
  if (panelRect.left <= x && x <= panelRect.right && (panelRect.top <= y && y <= panelRect.bottom)) return true;
  return false;
}
function setAttribute2(el, name, value) {
  if (el._durableAttributeObserver === void 0) {
    el._durableAttributeObserver = attributeObserver(el, [name]);
  }
  if (!el._durableAttributeObserver.hasAttribute(name)) {
    el._durableAttributeObserver.addAttribute(name);
  }
  el._durableAttributeObserver.pause(() => {
    el.setAttribute(name, value);
  });
}
function removeAttribute(el, name) {
  if (el._durableAttributeObserver === void 0) {
    el._durableAttributeObserver = attributeObserver(el, [name]);
  }
  if (!el._durableAttributeObserver.hasAttribute(name)) {
    el._durableAttributeObserver.addAttribute(name);
  }
  el._durableAttributeObserver.pause(() => {
    el.removeAttribute(name);
  });
}
function attributeObserver(el, initialAttributes) {
  let processMutations = (mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.oldValue === null) {
        el._durableAttributeObserver.pause(() => removeAttribute(el, mutation.attributeName));
      } else {
        el._durableAttributeObserver.pause(() => setAttribute2(el, mutation.attributeName, mutation.oldValue));
      }
    });
  };
  let observer = new MutationObserver((mutations) => processMutations(mutations));
  observer.observe(el, { attributeFilter: initialAttributes, attributeOldValue: true });
  return {
    attributes: initialAttributes,
    hasAttribute(name) {
      return this.attributes.includes(name);
    },
    addAttribute(name) {
      this.attributes.includes(name) || this.attributes.push(name);
      observer.observe(el, { attributeFilter: this.attributes, attributeOldValue: true });
    },
    pause(callback) {
      processMutations(observer.takeRecords());
      observer.disconnect();
      callback();
      observer.observe(el, { attributeFilter: this.attributes, attributeOldValue: true });
    }
  };
}

// js/element.js
var UIElement = class extends HTMLElement {
  constructor() {
    super();
    this.boot?.();
  }
  connectedCallback() {
    queueMicrotask(() => {
      this.mount?.();
    });
  }
  mixin(func, options = {}) {
    return new func(this, options);
  }
  // @todo: this is redundant now...
  appendMixin(func, options = {}) {
    return new func(this, options);
  }
  use(func) {
    let found;
    this.mixins.forEach((mixin) => {
      if (mixin instanceof func) found = mixin;
    });
    return found;
  }
  uses(func) {
    let found;
    this.mixins.forEach((mixin) => {
      if (mixin instanceof func) found = true;
    });
    return !!found;
  }
  on(event, handler) {
    return on(this, event, handler);
  }
  root(name, attributes = {}) {
    if (name === void 0) return this.__root;
    let el = document.createElement(name);
    for (let name2 in attributes) {
      setAttribute(el, name2, attributes[name2]);
    }
    let shadow = this.attachShadow({ mode: "open" });
    el.appendChild(document.createElement("slot"));
    shadow.appendChild(el);
    this.__root = el;
    return this.__root;
  }
};
var UIControl = class extends UIElement {
  //
};

// js/mixins/mixin.js
var Mixin = class {
  constructor(el, options = {}) {
    this.el = el;
    this.grouped = options.grouped === void 0 ? true : false;
    this.el.mixins = this.el.mixins ? this.el.mixins : /* @__PURE__ */ new Map();
    this.el.mixins.set(this.constructor.name, this);
    this.el[this.constructor.name] = true;
    if (!this.el.use) this.el.use = UIElement.prototype.use.bind(this.el);
    this.opts = options;
    this.boot?.({
      options: (defaults) => {
        let options2 = defaults;
        Object.entries(this.opts).forEach(([key, value]) => {
          if (value !== void 0) {
            options2[key] = value;
          }
        });
        this.opts = options2;
      }
    });
    queueMicrotask(() => {
      this.mount?.();
    });
  }
  options() {
    return this.opts;
  }
  hasGroup() {
    return !!this.group();
  }
  group() {
    if (this.grouped === false) return;
    return closest(this.el, (i) => i[this.groupedByType.name])?.use(this.groupedByType);
  }
  on(event, handler) {
    return on(this.el, event, handler);
  }
};
var MixinGroup = class extends Mixin {
  constructor(el, options = {}) {
    super(el, options);
  }
  walker() {
    return walker(this.el, (el, { skip, reject }) => {
      if (el[this.constructor.name] && el !== this.el) return reject();
      if (!el[this.groupOfType.name]) return skip();
      if (!el.mixins.get(this.groupOfType.name).grouped) return skip();
    });
  }
};

// js/mixins/controllable.js
var Controllable = class extends Mixin {
  boot({ options }) {
    this.initialState = this.el.value;
    this.getterFunc = () => {
    };
    this.setterFunc = (value) => this.initialState = value;
    Object.defineProperty(this.el, "value", {
      get: () => {
        return this.getterFunc();
      },
      set: (value) => {
        this.setterFunc(value);
      }
    });
  }
  initial(callback) {
    callback(this.initialState);
  }
  getter(func) {
    this.getterFunc = func;
  }
  setter(func) {
    this.setterFunc = func;
  }
  dispatch() {
    this.el.dispatchEvent(new Event("input", {
      bubbles: false,
      cancelable: true
    }));
    this.el.dispatchEvent(new Event("change", {
      bubbles: false,
      cancelable: true
    }));
  }
};

// js/mixins/disclosable.js
var Disclosable = class extends Mixin {
  boot({ options }) {
    this.onChanges = [];
    this.state = false;
  }
  onChange(callback) {
    this.onChanges.push(callback);
  }
  getState() {
    return this.state;
  }
  setState(value) {
    let oldState = this.state;
    this.state = !!value;
    if (this.state !== oldState) {
      this.onChanges.forEach((i) => i());
    }
  }
};

// js/disclosure.js
var UIDisclosure = class extends UIElement {
  boot() {
    let button = this.button();
    let details = this.details();
    if (!button) {
      return console.warn("ui-disclosure: no trigger element found", this);
    } else if (!details) {
      return console.warn("ui-disclosure: no panel element found", this);
    }
    this._disabled = this.hasAttribute("disabled");
    this._controllable = new Controllable(this, { disabled: this._disabled });
    details._disclosable = new Disclosable(details);
    this._controllable.initial((initial) => initial && details._disclosable.setState(true));
    this._controllable.getter(() => details._disclosable.getState());
    this._controllable.setter((value) => details._disclosable.setState(value));
    details._disclosable.onChange(() => {
      this.dispatchEvent(new CustomEvent("lofi-disclosable-change", { bubbles: true }));
      this._controllable.dispatch();
    });
    let refresh = () => {
      if (details._disclosable.getState()) {
        setAttribute2(this, "data-open", "");
        setAttribute2(button, "data-open", "");
        setAttribute2(details, "data-open", "");
      } else {
        removeAttribute(this, "data-open");
        removeAttribute(button, "data-open");
        removeAttribute(details, "data-open");
      }
    };
    details._disclosable.onChange(() => refresh());
    refresh();
    if (!this._disabled) {
      on(button, "click", (e) => {
        details._disclosable.setState(!details._disclosable.getState());
      });
    }
    let id = assignId(details, "disclosure");
    setAttribute2(button, "aria-controls", id);
    setAttribute2(button, "aria-expanded", "false");
    details._disclosable.onChange(() => {
      details._disclosable.getState() ? setAttribute2(button, "aria-expanded", "true") : setAttribute2(button, "aria-expanded", "false");
    });
    if (this.hasAttribute("open")) {
      details._disclosable.setState(true);
    }
  }
  button() {
    return this.querySelector("button");
  }
  details() {
    return this.lastElementChild;
  }
};
var UIDisclosureGroup = class _UIDisclosureGroup extends UIElement {
  boot() {
    this.exclusive = this.hasAttribute("exclusive");
    if (this.exclusive) {
      on(this, "lofi-disclosable-change", (e) => {
        if (e.target.localName === "ui-disclosure" && e.target.value) {
          this.disclosureWalker().each((el) => {
            if (el === e.target) return;
            el.value = false;
          });
        }
      });
    }
  }
  disclosureWalker() {
    return walker(this, (el, { skip, reject }) => {
      if (el instanceof _UIDisclosureGroup && el !== this) return reject();
      if (el.localName !== "ui-disclosure") return reject();
    });
  }
};
inject(({ css }) => css`ui-disclosure { display: block; }`);
element("disclosure", UIDisclosure);
element("disclosure-group", UIDisclosureGroup);

// js/resizable.js
var UIResizable = class extends UIElement {
  boot() {
  }
};
var UIGrip = class extends UIElement {
  boot() {
    let dimension = this.hasAttribute("resize") ? this.getAttribute("resize") : "both";
    let shrink = this.hasAttribute("shrink");
    let container = this.closest("ui-resizable");
    let maxWidth, maxHeight;
    let hasAttemptedAResizeYet = false;
    if (!container) throw "Resizable container not found";
    this.addEventListener("pointerdown", (e) => {
      if (!hasAttemptedAResizeYet) {
        maxWidth = container.offsetWidth;
        maxHeight = container.offsetHeight;
        hasAttemptedAResizeYet = true;
      }
      let startX = e.clientX;
      let startY = e.clientY;
      let startWidth = parseInt(getComputedStyle(container).width, 10);
      let startHeight = parseInt(getComputedStyle(container).height, 10);
      let resize = (e2) => {
        let width = startWidth + (e2.clientX - startX);
        let height = startHeight + (e2.clientY - startY);
        if (dimension === "width" || dimension === "both") {
          if (shrink) {
            container.style.width = `${Math.min(width, maxWidth)}px`;
          } else {
            container.style.width = `${width}px`;
          }
        }
        if (dimension === "height" || dimension === "both") {
          if (shrink) {
            container.style.height = `${Math.min(height, maxHeight)}px`;
          } else {
            container.style.height = `${height}px`;
          }
        }
      };
      document.addEventListener("pointermove", resize);
      document.addEventListener("pointerup", () => {
        this.releasePointerCapture(e.pointerId);
        document.removeEventListener("pointermove", resize);
      }, { once: true });
      this.setPointerCapture(e.pointerId);
    });
  }
};
inject(({ css }) => css`ui-resizable { display: block; }`);
element("resizable", UIResizable);
element("grip", UIGrip);

// js/mixins/selectable.js
var SelectableGroup = class extends MixinGroup {
  groupOfType = Selectable;
  boot({ options }) {
    options({
      multiple: false
    });
    this.state = this.options().multiple ? /* @__PURE__ */ new Set() : null;
    this.onChanges = [];
  }
  onInitAndChange(callback) {
    callback();
    this.onChanges.push(callback);
  }
  onChange(callback) {
    this.onChanges.push(callback);
  }
  changed(selectable, silent = false) {
    if (selectable.ungrouped) return;
    let value = selectable.value;
    let selected = selectable.isSelected();
    let multiple = this.options().multiple;
    if (selected) {
      multiple ? this.state.add(value) : this.state = value;
    } else {
      multiple ? this.state.delete(value) : this.state = null;
    }
    if (!silent) {
      this.onChanges.forEach((i) => i());
    }
  }
  getState() {
    return this.options().multiple ? Array.from(this.state) : this.state;
  }
  hasValue(value) {
    return this.options().multiple ? this.state.has(value) : this.state === value;
  }
  setState(value) {
    if (value === null) value = this.multiple ? [] : "";
    value = this.options().multiple ? (value || []).map((i) => i + "") : value + "";
    this.state = this.options().multiple ? new Set(value) : value;
    let values = this.options().multiple ? value : [value];
    this.walker().each((el) => {
      let selectable = el.use(Selectable);
      if (selectable.ungrouped) return;
      let selected = values.includes(selectable.value);
      if (selected && !selectable.isSelected()) {
        selectable.surgicallySelect();
      } else if (!selected && selectable.isSelected()) {
        selectable.surgicallyDeselect();
      }
    });
    this.onChanges.forEach((i) => i());
  }
  selected() {
    return this.walker().find((item) => item.use(Selectable).isSelected()).use(Selectable);
  }
  selecteds() {
    return this.walker().filter((el) => el.use(Selectable).isSelected()).map((el) => el.use(Selectable));
  }
  selectFirst() {
    this.walker().first()?.use(Selectable).select();
  }
  selectAll() {
    this.walker().filter((el) => !el.use(Selectable).isSelected()).map((el) => el.use(Selectable).select());
  }
  deselectAll() {
    this.walker().filter((el) => el.use(Selectable).isSelected()).map((el) => el.use(Selectable).deselect());
  }
  allAreSelected() {
    return this.walker().filter((el) => el.use(Selectable).isSelected()).length === this.walker().filter((el) => true).length;
  }
  noneAreSelected() {
    return this.state === null || this.state?.size === 0;
  }
  selectableByValue(value) {
    return this.walker().find((el) => el.use(Selectable).value === value)?.use(Selectable);
  }
  deselectOthers(except) {
    this.walker().each((el) => {
      if (el === except) return;
      el.use(Selectable).surgicallyDeselect();
    });
  }
  selectedTextValue() {
    if (!this.options().multiple) return this.convertValueStringToElementText(this.state);
    return Array.from(this.state).map((i) => {
      return this.convertValueStringToElementText(i);
    }).join(", ");
  }
  convertValueStringToElementText(value) {
    let selected = this.findByValue(value);
    if (selected) {
      return selected.label || selected.value;
    } else {
      return value;
    }
  }
  findByValue(value) {
    return this.selecteds().find((i) => i.value === value);
  }
  walker() {
    return walker(this.el, (el, { skip, reject }) => {
      if (el[this.constructor.name] && el !== this.el) return reject();
      if (!el[this.groupOfType.name]) return skip();
      if (el.mixins.get(this.groupOfType.name).ungrouped) return skip();
    });
  }
};
var Selectable = class extends Mixin {
  boot({ options }) {
    this.groupedByType = SelectableGroup;
    options({
      ungrouped: false,
      togglable: false,
      value: void 0,
      label: void 0,
      selectedInitially: false,
      dataAttr: "data-selected",
      ariaAttr: "aria-selected"
    });
    this.ungrouped = this.options().ungrouped;
    this.value = this.options().value === void 0 ? this.el.value : this.options().value;
    this.value = this.value + "";
    this.label = this.options().label;
    let state = this.options().selectedInitially;
    if (this.group()) {
      if (this.group().hasValue(this.value)) state = true;
    }
    this.multiple = this.hasGroup() ? this.group().options().multiple : false;
    this.toggleable = this.options().toggleable || this.multiple;
    this.onSelects = [];
    this.onUnselects = [];
    this.onChanges = [];
    if (state) {
      this.select(true);
    } else {
      this.state = state;
      this.surgicallyDeselect(true);
    }
  }
  mount() {
    this.el.hasAttribute(this.options().ariaAttr) || setAttribute2(this.el, this.options().ariaAttr, "false");
  }
  onChange(callback) {
    this.onChanges.push(callback);
  }
  onSelect(callback) {
    this.onSelects.push(callback);
  }
  onUnselect(callback) {
    this.onUnselects.push(callback);
  }
  setState(value) {
    value ? this.select() : this.deselect();
  }
  getState() {
    return this.state;
  }
  // @todo: depricate in favor of "trigger"...
  press() {
    this.toggleable ? this.toggle() : this.select();
  }
  trigger() {
    this.toggleable ? this.toggle() : this.select();
  }
  toggle() {
    this.isSelected() ? this.deselect() : this.select();
  }
  isSelected() {
    return this.state;
  }
  select(silent = false) {
    let changed = !this.isSelected();
    this.toggleable || this.group()?.deselectOthers(this.el);
    this.state = true;
    setAttribute2(this.el, this.options().ariaAttr, "true");
    setAttribute2(this.el, this.options().dataAttr, "");
    if (changed) {
      if (!silent) {
        this.onSelects.forEach((i) => i());
        this.onChanges.forEach((i) => i());
      }
      this.group()?.changed(this, silent);
    }
  }
  surgicallySelect() {
    let changed = !this.isSelected();
    this.state = true;
    setAttribute2(this.el, this.options().ariaAttr, "true");
    setAttribute2(this.el, this.options().dataAttr, "");
    if (changed) {
      this.onSelects.forEach((i) => i());
      this.onChanges.forEach((i) => i());
    }
  }
  deselect(notify = true) {
    let changed = this.isSelected();
    this.state = false;
    setAttribute2(this.el, this.options().ariaAttr, "false");
    removeAttribute(this.el, this.options().dataAttr);
    if (changed) {
      this.onUnselects.forEach((i) => i());
      this.onChanges.forEach((i) => i());
      notify && this.group()?.changed(this);
    }
  }
  surgicallyDeselect(silent = false) {
    let changed = this.isSelected();
    this.state = false;
    setAttribute2(this.el, this.options().ariaAttr, "false");
    removeAttribute(this.el, this.options().dataAttr);
    if (changed && !silent) {
      this.onUnselects.forEach((i) => i());
      this.onChanges.forEach((i) => i());
    }
  }
  getValue() {
    return this.value;
  }
  getLabel() {
    return this.label;
  }
};

// js/mixins/disableable.js
var Disableable = class extends Mixin {
  boot({ options }) {
    this.onChanges = [];
    Object.defineProperty(this.el, "disabled", {
      get: () => {
        return this.el.hasAttribute("disabled");
      },
      set: (value) => {
        if (value) {
          this.el.setAttribute("disabled", "");
        } else {
          this.el.removeAttribute("disabled");
        }
      }
    });
    if (this.el.hasAttribute("disabled")) {
      this.el.disabled = true;
    } else if (this.el.closest("[disabled]")) {
      this.el.disabled = true;
    }
    let observer = new MutationObserver((mutations) => {
      this.onChanges.forEach((i) => i(this.el.disabled));
    });
    observer.observe(this.el, { attributeFilter: ["disabled"] });
  }
  onChange(callback) {
    this.onChanges.push(callback);
  }
  onInitAndChange(callback) {
    callback(this.el.disabled);
    this.onChanges.push(callback);
  }
  enabled(callback) {
    return (...args) => {
      if (this.el.disabled) return;
      return callback(...args);
    };
  }
  disabled(callback) {
    return (...args) => {
      if (!this.el.disabled) return;
      return callback(...args);
    };
  }
};

// js/checkbox.js
var UICheckboxGroup = class _UICheckboxGroup extends UIControl {
  boot() {
    this._disableable = new Disableable(this);
    let undoDisableds = [];
    this._disableable.onInitAndChange((disabled) => {
      if (disabled) {
        this.walker().each((el) => {
          if (!el.hasAttribute("disabled")) {
            el.setAttribute("disabled", "");
            undoDisableds.push(() => el.removeAttribute("disabled"));
          }
        });
      } else {
        undoDisableds.forEach((fn) => fn());
        undoDisableds = [];
      }
    });
    this._selectable = new SelectableGroup(this, { multiple: true });
    this._controllable = new Controllable(this, { disabled: this._disabled });
    this._controllable.initial((initial) => initial && this._selectable.setState(initial));
    this._controllable.getter(() => this._selectable.getState());
    this._detangled = detangle();
    this._controllable.setter(this._detangled((value) => {
      this._selectable.setState(value);
    }));
    this._selectable.onChange(this._detangled(() => {
      this._controllable.dispatch();
    }));
    setAttribute2(this, "role", "group");
  }
  initCheckAll(checkAll) {
    let detangled = detangle();
    checkAll._selectable.onChange(detangled(() => {
      if (checkAll.indeterminate) {
        this._selectable.selectAll();
        checkAll.checked = true;
        checkAll.indeterminate = false;
      } else if (checkAll.checked) {
        this._selectable.selectAll();
        checkAll.checked = true;
        checkAll.indeterminate = false;
      } else {
        this._selectable.deselectAll();
        checkAll.checked = false;
        checkAll.indeterminate = false;
      }
    }));
    let setCheckAllIndeterminate = () => {
      if (this._selectable.allAreSelected()) {
        checkAll.indeterminate = false;
        checkAll.checked = true;
      } else if (this._selectable.noneAreSelected()) {
        checkAll.indeterminate = false;
        checkAll.checked = false;
      } else {
        checkAll.indeterminate = true;
      }
    };
    this._selectable.onChange(detangled(() => {
      setCheckAllIndeterminate();
    }));
    setCheckAllIndeterminate();
  }
  walker() {
    return walker(this, (el, { skip, reject }) => {
      if (el instanceof _UICheckboxGroup) return reject();
      if (!(el.localName === "ui-checkbox")) return skip();
    });
  }
};
var UICheckbox = class extends UIControl {
  boot() {
    let button = this;
    this.isIndeterminate = false;
    this._disableable = new Disableable(this);
    if (this.hasAttribute("all")) {
      this._selectable = new Selectable(button, {
        ungrouped: true,
        toggleable: true,
        value: this.hasAttribute("value") ? this.getAttribute("value") : Math.random().toString(36).substring(2, 10),
        label: this.hasAttribute("label") ? this.getAttribute("label") : null,
        selectedInitially: this.hasAttribute("checked"),
        dataAttr: "data-checked",
        ariaAttr: "aria-checked"
      });
      queueMicrotask(() => {
        this.closest("ui-checkbox-group")?.initCheckAll(this);
      });
    } else {
      this._selectable = new Selectable(button, {
        toggleable: true,
        dataAttr: "data-checked",
        ariaAttr: "aria-checked",
        value: this.hasAttribute("value") ? this.getAttribute("value") : Math.random().toString(36).substring(2, 10),
        label: this.hasAttribute("label") ? this.getAttribute("label") : null,
        selectedInitially: this.hasAttribute("checked")
      });
      this._selectable.onChange(() => {
        if (this.indeterminate) this.indeterminate = false;
      });
      this.value = this._selectable.getValue();
    }
    this._detangled = detangle();
    this._selectable.onChange(this._detangled(() => {
      this.dispatchEvent(new Event("input", { bubbles: false, cancelable: true }));
      this.dispatchEvent(new Event("change", { bubbles: false, cancelable: true }));
    }));
    setAttribute2(button, "role", "checkbox");
    this._disableable.onInitAndChange((disabled) => {
      disabled ? removeAttribute(button, "tabindex", "0") : setAttribute2(button, "tabindex", "0");
    });
    on(button, "click", this._disableable.disabled((e) => {
      e.preventDefault();
      e.stopPropagation();
    }), { capture: true });
    on(button, "click", this._disableable.enabled((e) => {
      this._selectable.press();
    }));
    on(button, "keydown", this._disableable.enabled((e) => {
      if (e.key === "Enter") {
        this._selectable.press();
        e.preventDefault();
        e.stopPropagation();
      }
    }));
    on(button, "keydown", this._disableable.enabled((e) => {
      if (e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
      }
    }));
    on(button, "keyup", this._disableable.enabled((e) => {
      if (e.key === " ") {
        this._selectable.press();
        e.preventDefault();
        e.stopPropagation();
      }
    }));
    respondToLabelClick(button);
  }
  get checked() {
    return this._selectable.isSelected();
  }
  set checked(value) {
    let groupDetangled = this.closest("ui-checkbox-group")?._detangled || ((i) => i);
    this._detangled(groupDetangled(() => {
      value ? this._selectable.select() : this._selectable.deselect();
    }))();
  }
  get indeterminate() {
    return this.isIndeterminate;
  }
  set indeterminate(value) {
    this.isIndeterminate = !!value;
    if (this.isIndeterminate) {
      setAttribute2(this, "data-indeterminate", "");
    } else {
      removeAttribute(this, "data-indeterminate");
    }
  }
};
element("checkbox-group", UICheckboxGroup);
element("checkbox", UICheckbox);
inject(({ css }) => css`ui-checkbox-group { display: block; user-select: none; }`);
inject(({ css }) => css`ui-checkbox { display: inline-block; user-select: none; }`);
function respondToLabelClick(el) {
  el.closest("label")?.addEventListener("click", (e) => {
    if (!el.contains(e.target)) {
      el._selectable.press();
    }
  });
}

// js/mixins/popoverable.js
var currentlyOpenPopovers = /* @__PURE__ */ new Set();
var Popoverable = class extends Mixin {
  boot({ options }) {
    options({ trigger: null });
    setAttribute2(this.el, "popover", "manual");
    this.trigger = this.options().trigger;
    this.onChanges = [];
    this.state = false;
    on(this.el, "beforetoggle", (e) => {
      let oldState = this.state;
      this.state = e.newState === "open";
      if (this.state) {
        closeOtherOpenPopovers(this.el, currentlyOpenPopovers);
        let controller = new AbortController();
        let trigger = document.activeElement;
        setTimeout(() => {
          closeOnClickOutside(this.el, trigger, controller);
          closeOnFocusAway(this.el, trigger, controller);
          closeOnEscape(this.el, trigger, controller);
        });
        this.el.addEventListener("beforetoggle", (e2) => {
          if (e2.newState === "closed") {
            controller.abort();
            trigger.focus();
          }
        }, { signal: controller.signal });
      }
      if (oldState !== this.state) {
        this.onChanges.forEach((i) => i(this.state, oldState));
      }
    });
    on(this.el, "toggle", (e) => {
      if (e.newState === "open") currentlyOpenPopovers.add(this.el);
      if (e.newState === "closed") currentlyOpenPopovers.delete(this.el);
    });
  }
  onChange(callback) {
    this.onChanges.push(callback);
  }
  setState(value) {
    value ? this.show() : this.hide();
  }
  getState() {
    return this.state;
  }
  toggle() {
    this.el.togglePopover();
  }
  show() {
    this.el.showPopover();
  }
  hide() {
    this.el.hidePopover();
  }
};
function closeOtherOpenPopovers(el, currentlyOpenPopovers2) {
  currentlyOpenPopovers2.forEach((popoverEl) => {
    if (el.contains(popoverEl) || popoverEl.contains(el)) return;
    popoverEl.hidePopover();
  });
}
function closeOnClickOutside(el, except, controller) {
  document.addEventListener("click", (e) => {
    if (el.contains(e.target) || except === e.target) return;
    el.hidePopover();
  }, { signal: controller.signal });
}
function closeOnFocusAway(el, except, controller) {
  document.addEventListener("focusin", (e) => {
    if (el.contains(e.target) || except === e.target) return;
    controller.abort();
    el.hidePopover();
  }, {
    // Without "capture: true", when you focus away from the popover onto an element that triggers a popover
    // on focus (a tooltip), it will focus back this popover's trigger instead of keeping focus on the tooltip button.
    // It does this because only one popover can be open at a time, so focusing the tooltip, opens a popover, closing this one,
    // which will trigger the "focus back" behavior.
    capture: true,
    signal: controller.signal
  });
}
function closeOnEscape(el, except, controller) {
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    el.hidePopover();
  }, { signal: controller.signal });
}

// node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
var min = Math.min;
var max = Math.max;
var round = Math.round;
var floor = Math.floor;
var createCoords = (v) => ({
  x: v,
  y: v
});
var oppositeSideMap = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
var oppositeAlignmentMap = {
  start: "end",
  end: "start"
};
function clamp(start, value, end) {
  return max(start, min(value, end));
}
function evaluate(value, param) {
  return typeof value === "function" ? value(param) : value;
}
function getSide(placement) {
  return placement.split("-")[0];
}
function getAlignment(placement) {
  return placement.split("-")[1];
}
function getOppositeAxis(axis) {
  return axis === "x" ? "y" : "x";
}
function getAxisLength(axis) {
  return axis === "y" ? "height" : "width";
}
function getSideAxis(placement) {
  return ["top", "bottom"].includes(getSide(placement)) ? "y" : "x";
}
function getAlignmentAxis(placement) {
  return getOppositeAxis(getSideAxis(placement));
}
function getAlignmentSides(placement, rects, rtl) {
  if (rtl === void 0) {
    rtl = false;
  }
  const alignment = getAlignment(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const length = getAxisLength(alignmentAxis);
  let mainAlignmentSide = alignmentAxis === "x" ? alignment === (rtl ? "end" : "start") ? "right" : "left" : alignment === "start" ? "bottom" : "top";
  if (rects.reference[length] > rects.floating[length]) {
    mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
  }
  return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
}
function getExpandedPlacements(placement) {
  const oppositePlacement = getOppositePlacement(placement);
  return [getOppositeAlignmentPlacement(placement), oppositePlacement, getOppositeAlignmentPlacement(oppositePlacement)];
}
function getOppositeAlignmentPlacement(placement) {
  return placement.replace(/start|end/g, (alignment) => oppositeAlignmentMap[alignment]);
}
function getSideList(side, isStart, rtl) {
  const lr = ["left", "right"];
  const rl = ["right", "left"];
  const tb = ["top", "bottom"];
  const bt = ["bottom", "top"];
  switch (side) {
    case "top":
    case "bottom":
      if (rtl) return isStart ? rl : lr;
      return isStart ? lr : rl;
    case "left":
    case "right":
      return isStart ? tb : bt;
    default:
      return [];
  }
}
function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
  const alignment = getAlignment(placement);
  let list = getSideList(getSide(placement), direction === "start", rtl);
  if (alignment) {
    list = list.map((side) => side + "-" + alignment);
    if (flipAlignment) {
      list = list.concat(list.map(getOppositeAlignmentPlacement));
    }
  }
  return list;
}
function getOppositePlacement(placement) {
  return placement.replace(/left|right|bottom|top/g, (side) => oppositeSideMap[side]);
}
function expandPaddingObject(padding) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...padding
  };
}
function getPaddingObject(padding) {
  return typeof padding !== "number" ? expandPaddingObject(padding) : {
    top: padding,
    right: padding,
    bottom: padding,
    left: padding
  };
}
function rectToClientRect(rect) {
  const {
    x,
    y,
    width,
    height
  } = rect;
  return {
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    x,
    y
  };
}

// node_modules/@floating-ui/core/dist/floating-ui.core.mjs
function computeCoordsFromPlacement(_ref, placement, rtl) {
  let {
    reference,
    floating
  } = _ref;
  const sideAxis = getSideAxis(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const alignLength = getAxisLength(alignmentAxis);
  const side = getSide(placement);
  const isVertical = sideAxis === "y";
  const commonX = reference.x + reference.width / 2 - floating.width / 2;
  const commonY = reference.y + reference.height / 2 - floating.height / 2;
  const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
  let coords;
  switch (side) {
    case "top":
      coords = {
        x: commonX,
        y: reference.y - floating.height
      };
      break;
    case "bottom":
      coords = {
        x: commonX,
        y: reference.y + reference.height
      };
      break;
    case "right":
      coords = {
        x: reference.x + reference.width,
        y: commonY
      };
      break;
    case "left":
      coords = {
        x: reference.x - floating.width,
        y: commonY
      };
      break;
    default:
      coords = {
        x: reference.x,
        y: reference.y
      };
  }
  switch (getAlignment(placement)) {
    case "start":
      coords[alignmentAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
      break;
    case "end":
      coords[alignmentAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
      break;
  }
  return coords;
}
var computePosition = async (reference, floating, config) => {
  const {
    placement = "bottom",
    strategy = "absolute",
    middleware = [],
    platform: platform2
  } = config;
  const validMiddleware = middleware.filter(Boolean);
  const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(floating));
  let rects = await platform2.getElementRects({
    reference,
    floating,
    strategy
  });
  let {
    x,
    y
  } = computeCoordsFromPlacement(rects, placement, rtl);
  let statefulPlacement = placement;
  let middlewareData = {};
  let resetCount = 0;
  for (let i = 0; i < validMiddleware.length; i++) {
    const {
      name,
      fn
    } = validMiddleware[i];
    const {
      x: nextX,
      y: nextY,
      data,
      reset
    } = await fn({
      x,
      y,
      initialPlacement: placement,
      placement: statefulPlacement,
      strategy,
      middlewareData,
      rects,
      platform: platform2,
      elements: {
        reference,
        floating
      }
    });
    x = nextX != null ? nextX : x;
    y = nextY != null ? nextY : y;
    middlewareData = {
      ...middlewareData,
      [name]: {
        ...middlewareData[name],
        ...data
      }
    };
    if (reset && resetCount <= 50) {
      resetCount++;
      if (typeof reset === "object") {
        if (reset.placement) {
          statefulPlacement = reset.placement;
        }
        if (reset.rects) {
          rects = reset.rects === true ? await platform2.getElementRects({
            reference,
            floating,
            strategy
          }) : reset.rects;
        }
        ({
          x,
          y
        } = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
      }
      i = -1;
    }
  }
  return {
    x,
    y,
    placement: statefulPlacement,
    strategy,
    middlewareData
  };
};
async function detectOverflow(state, options) {
  var _await$platform$isEle;
  if (options === void 0) {
    options = {};
  }
  const {
    x,
    y,
    platform: platform2,
    rects,
    elements,
    strategy
  } = state;
  const {
    boundary = "clippingAncestors",
    rootBoundary = "viewport",
    elementContext = "floating",
    altBoundary = false,
    padding = 0
  } = evaluate(options, state);
  const paddingObject = getPaddingObject(padding);
  const altContext = elementContext === "floating" ? "reference" : "floating";
  const element2 = elements[altBoundary ? altContext : elementContext];
  const clippingClientRect = rectToClientRect(await platform2.getClippingRect({
    element: ((_await$platform$isEle = await (platform2.isElement == null ? void 0 : platform2.isElement(element2))) != null ? _await$platform$isEle : true) ? element2 : element2.contextElement || await (platform2.getDocumentElement == null ? void 0 : platform2.getDocumentElement(elements.floating)),
    boundary,
    rootBoundary,
    strategy
  }));
  const rect = elementContext === "floating" ? {
    x,
    y,
    width: rects.floating.width,
    height: rects.floating.height
  } : rects.reference;
  const offsetParent = await (platform2.getOffsetParent == null ? void 0 : platform2.getOffsetParent(elements.floating));
  const offsetScale = await (platform2.isElement == null ? void 0 : platform2.isElement(offsetParent)) ? await (platform2.getScale == null ? void 0 : platform2.getScale(offsetParent)) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  };
  const elementClientRect = rectToClientRect(platform2.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform2.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements,
    rect,
    offsetParent,
    strategy
  }) : rect);
  return {
    top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
    bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
    left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
    right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
  };
}
var flip = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "flip",
    options,
    async fn(state) {
      var _middlewareData$arrow, _middlewareData$flip;
      const {
        placement,
        middlewareData,
        rects,
        initialPlacement,
        platform: platform2,
        elements
      } = state;
      const {
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = true,
        fallbackPlacements: specifiedFallbackPlacements,
        fallbackStrategy = "bestFit",
        fallbackAxisSideDirection = "none",
        flipAlignment = true,
        ...detectOverflowOptions
      } = evaluate(options, state);
      if ((_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
        return {};
      }
      const side = getSide(placement);
      const initialSideAxis = getSideAxis(initialPlacement);
      const isBasePlacement = getSide(initialPlacement) === initialPlacement;
      const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating));
      const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
      const hasFallbackAxisSideDirection = fallbackAxisSideDirection !== "none";
      if (!specifiedFallbackPlacements && hasFallbackAxisSideDirection) {
        fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
      }
      const placements2 = [initialPlacement, ...fallbackPlacements];
      const overflow = await detectOverflow(state, detectOverflowOptions);
      const overflows = [];
      let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? void 0 : _middlewareData$flip.overflows) || [];
      if (checkMainAxis) {
        overflows.push(overflow[side]);
      }
      if (checkCrossAxis) {
        const sides2 = getAlignmentSides(placement, rects, rtl);
        overflows.push(overflow[sides2[0]], overflow[sides2[1]]);
      }
      overflowsData = [...overflowsData, {
        placement,
        overflows
      }];
      if (!overflows.every((side2) => side2 <= 0)) {
        var _middlewareData$flip2, _overflowsData$filter;
        const nextIndex = (((_middlewareData$flip2 = middlewareData.flip) == null ? void 0 : _middlewareData$flip2.index) || 0) + 1;
        const nextPlacement = placements2[nextIndex];
        if (nextPlacement) {
          return {
            data: {
              index: nextIndex,
              overflows: overflowsData
            },
            reset: {
              placement: nextPlacement
            }
          };
        }
        let resetPlacement = (_overflowsData$filter = overflowsData.filter((d) => d.overflows[0] <= 0).sort((a, b) => a.overflows[1] - b.overflows[1])[0]) == null ? void 0 : _overflowsData$filter.placement;
        if (!resetPlacement) {
          switch (fallbackStrategy) {
            case "bestFit": {
              var _overflowsData$filter2;
              const placement2 = (_overflowsData$filter2 = overflowsData.filter((d) => {
                if (hasFallbackAxisSideDirection) {
                  const currentSideAxis = getSideAxis(d.placement);
                  return currentSideAxis === initialSideAxis || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  currentSideAxis === "y";
                }
                return true;
              }).map((d) => [d.placement, d.overflows.filter((overflow2) => overflow2 > 0).reduce((acc, overflow2) => acc + overflow2, 0)]).sort((a, b) => a[1] - b[1])[0]) == null ? void 0 : _overflowsData$filter2[0];
              if (placement2) {
                resetPlacement = placement2;
              }
              break;
            }
            case "initialPlacement":
              resetPlacement = initialPlacement;
              break;
          }
        }
        if (placement !== resetPlacement) {
          return {
            reset: {
              placement: resetPlacement
            }
          };
        }
      }
      return {};
    }
  };
};
async function convertValueToCoords(state, options) {
  const {
    placement,
    platform: platform2,
    elements
  } = state;
  const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating));
  const side = getSide(placement);
  const alignment = getAlignment(placement);
  const isVertical = getSideAxis(placement) === "y";
  const mainAxisMulti = ["left", "top"].includes(side) ? -1 : 1;
  const crossAxisMulti = rtl && isVertical ? -1 : 1;
  const rawValue = evaluate(options, state);
  let {
    mainAxis,
    crossAxis,
    alignmentAxis
  } = typeof rawValue === "number" ? {
    mainAxis: rawValue,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: 0,
    crossAxis: 0,
    alignmentAxis: null,
    ...rawValue
  };
  if (alignment && typeof alignmentAxis === "number") {
    crossAxis = alignment === "end" ? alignmentAxis * -1 : alignmentAxis;
  }
  return isVertical ? {
    x: crossAxis * crossAxisMulti,
    y: mainAxis * mainAxisMulti
  } : {
    x: mainAxis * mainAxisMulti,
    y: crossAxis * crossAxisMulti
  };
}
var offset = function(options) {
  if (options === void 0) {
    options = 0;
  }
  return {
    name: "offset",
    options,
    async fn(state) {
      var _middlewareData$offse, _middlewareData$arrow;
      const {
        x,
        y,
        placement,
        middlewareData
      } = state;
      const diffCoords = await convertValueToCoords(state, options);
      if (placement === ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse.placement) && (_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
        return {};
      }
      return {
        x: x + diffCoords.x,
        y: y + diffCoords.y,
        data: {
          ...diffCoords,
          placement
        }
      };
    }
  };
};
var shift = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "shift",
    options,
    async fn(state) {
      const {
        x,
        y,
        placement
      } = state;
      const {
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = false,
        limiter = {
          fn: (_ref) => {
            let {
              x: x2,
              y: y2
            } = _ref;
            return {
              x: x2,
              y: y2
            };
          }
        },
        ...detectOverflowOptions
      } = evaluate(options, state);
      const coords = {
        x,
        y
      };
      const overflow = await detectOverflow(state, detectOverflowOptions);
      const crossAxis = getSideAxis(getSide(placement));
      const mainAxis = getOppositeAxis(crossAxis);
      let mainAxisCoord = coords[mainAxis];
      let crossAxisCoord = coords[crossAxis];
      if (checkMainAxis) {
        const minSide = mainAxis === "y" ? "top" : "left";
        const maxSide = mainAxis === "y" ? "bottom" : "right";
        const min2 = mainAxisCoord + overflow[minSide];
        const max2 = mainAxisCoord - overflow[maxSide];
        mainAxisCoord = clamp(min2, mainAxisCoord, max2);
      }
      if (checkCrossAxis) {
        const minSide = crossAxis === "y" ? "top" : "left";
        const maxSide = crossAxis === "y" ? "bottom" : "right";
        const min2 = crossAxisCoord + overflow[minSide];
        const max2 = crossAxisCoord - overflow[maxSide];
        crossAxisCoord = clamp(min2, crossAxisCoord, max2);
      }
      const limitedCoords = limiter.fn({
        ...state,
        [mainAxis]: mainAxisCoord,
        [crossAxis]: crossAxisCoord
      });
      return {
        ...limitedCoords,
        data: {
          x: limitedCoords.x - x,
          y: limitedCoords.y - y
        }
      };
    }
  };
};
var size = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "size",
    options,
    async fn(state) {
      const {
        placement,
        rects,
        platform: platform2,
        elements
      } = state;
      const {
        apply: apply3 = () => {
        },
        ...detectOverflowOptions
      } = evaluate(options, state);
      const overflow = await detectOverflow(state, detectOverflowOptions);
      const side = getSide(placement);
      const alignment = getAlignment(placement);
      const isYAxis = getSideAxis(placement) === "y";
      const {
        width,
        height
      } = rects.floating;
      let heightSide;
      let widthSide;
      if (side === "top" || side === "bottom") {
        heightSide = side;
        widthSide = alignment === (await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating)) ? "start" : "end") ? "left" : "right";
      } else {
        widthSide = side;
        heightSide = alignment === "end" ? "top" : "bottom";
      }
      const maximumClippingHeight = height - overflow.top - overflow.bottom;
      const maximumClippingWidth = width - overflow.left - overflow.right;
      const overflowAvailableHeight = min(height - overflow[heightSide], maximumClippingHeight);
      const overflowAvailableWidth = min(width - overflow[widthSide], maximumClippingWidth);
      const noShift = !state.middlewareData.shift;
      let availableHeight = overflowAvailableHeight;
      let availableWidth = overflowAvailableWidth;
      if (isYAxis) {
        availableWidth = alignment || noShift ? min(overflowAvailableWidth, maximumClippingWidth) : maximumClippingWidth;
      } else {
        availableHeight = alignment || noShift ? min(overflowAvailableHeight, maximumClippingHeight) : maximumClippingHeight;
      }
      if (noShift && !alignment) {
        const xMin = max(overflow.left, 0);
        const xMax = max(overflow.right, 0);
        const yMin = max(overflow.top, 0);
        const yMax = max(overflow.bottom, 0);
        if (isYAxis) {
          availableWidth = width - 2 * (xMin !== 0 || xMax !== 0 ? xMin + xMax : max(overflow.left, overflow.right));
        } else {
          availableHeight = height - 2 * (yMin !== 0 || yMax !== 0 ? yMin + yMax : max(overflow.top, overflow.bottom));
        }
      }
      await apply3({
        ...state,
        availableWidth,
        availableHeight
      });
      const nextDimensions = await platform2.getDimensions(elements.floating);
      if (width !== nextDimensions.width || height !== nextDimensions.height) {
        return {
          reset: {
            rects: true
          }
        };
      }
      return {};
    }
  };
};

// node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs
function getNodeName(node) {
  if (isNode(node)) {
    return (node.nodeName || "").toLowerCase();
  }
  return "#document";
}
function getWindow(node) {
  var _node$ownerDocument;
  return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
}
function getDocumentElement(node) {
  var _ref;
  return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
}
function isNode(value) {
  return value instanceof Node || value instanceof getWindow(value).Node;
}
function isElement(value) {
  return value instanceof Element || value instanceof getWindow(value).Element;
}
function isHTMLElement(value) {
  return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
}
function isShadowRoot(value) {
  if (typeof ShadowRoot === "undefined") {
    return false;
  }
  return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
}
function isOverflowElement(element2) {
  const {
    overflow,
    overflowX,
    overflowY,
    display
  } = getComputedStyle2(element2);
  return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && !["inline", "contents"].includes(display);
}
function isTableElement(element2) {
  return ["table", "td", "th"].includes(getNodeName(element2));
}
function isTopLayer(element2) {
  return [":popover-open", ":modal"].some((selector) => {
    try {
      return element2.matches(selector);
    } catch (e) {
      return false;
    }
  });
}
function isContainingBlock(elementOrCss) {
  const webkit = isWebKit();
  const css = isElement(elementOrCss) ? getComputedStyle2(elementOrCss) : elementOrCss;
  return css.transform !== "none" || css.perspective !== "none" || (css.containerType ? css.containerType !== "normal" : false) || !webkit && (css.backdropFilter ? css.backdropFilter !== "none" : false) || !webkit && (css.filter ? css.filter !== "none" : false) || ["transform", "perspective", "filter"].some((value) => (css.willChange || "").includes(value)) || ["paint", "layout", "strict", "content"].some((value) => (css.contain || "").includes(value));
}
function getContainingBlock(element2) {
  let currentNode = getParentNode(element2);
  while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
    if (isContainingBlock(currentNode)) {
      return currentNode;
    } else if (isTopLayer(currentNode)) {
      return null;
    }
    currentNode = getParentNode(currentNode);
  }
  return null;
}
function isWebKit() {
  if (typeof CSS === "undefined" || !CSS.supports) return false;
  return CSS.supports("-webkit-backdrop-filter", "none");
}
function isLastTraversableNode(node) {
  return ["html", "body", "#document"].includes(getNodeName(node));
}
function getComputedStyle2(element2) {
  return getWindow(element2).getComputedStyle(element2);
}
function getNodeScroll(element2) {
  if (isElement(element2)) {
    return {
      scrollLeft: element2.scrollLeft,
      scrollTop: element2.scrollTop
    };
  }
  return {
    scrollLeft: element2.scrollX,
    scrollTop: element2.scrollY
  };
}
function getParentNode(node) {
  if (getNodeName(node) === "html") {
    return node;
  }
  const result = (
    // Step into the shadow DOM of the parent of a slotted node.
    node.assignedSlot || // DOM Element detected.
    node.parentNode || // ShadowRoot detected.
    isShadowRoot(node) && node.host || // Fallback.
    getDocumentElement(node)
  );
  return isShadowRoot(result) ? result.host : result;
}
function getNearestOverflowAncestor(node) {
  const parentNode = getParentNode(node);
  if (isLastTraversableNode(parentNode)) {
    return node.ownerDocument ? node.ownerDocument.body : node.body;
  }
  if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
    return parentNode;
  }
  return getNearestOverflowAncestor(parentNode);
}
function getOverflowAncestors(node, list, traverseIframes) {
  var _node$ownerDocument2;
  if (list === void 0) {
    list = [];
  }
  if (traverseIframes === void 0) {
    traverseIframes = true;
  }
  const scrollableAncestor = getNearestOverflowAncestor(node);
  const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
  const win = getWindow(scrollableAncestor);
  if (isBody) {
    const frameElement = getFrameElement(win);
    return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], frameElement && traverseIframes ? getOverflowAncestors(frameElement) : []);
  }
  return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
}
function getFrameElement(win) {
  return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
}

// node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function getCssDimensions(element2) {
  const css = getComputedStyle2(element2);
  let width = parseFloat(css.width) || 0;
  let height = parseFloat(css.height) || 0;
  const hasOffset = isHTMLElement(element2);
  const offsetWidth = hasOffset ? element2.offsetWidth : width;
  const offsetHeight = hasOffset ? element2.offsetHeight : height;
  const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
  if (shouldFallback) {
    width = offsetWidth;
    height = offsetHeight;
  }
  return {
    width,
    height,
    $: shouldFallback
  };
}
function unwrapElement(element2) {
  return !isElement(element2) ? element2.contextElement : element2;
}
function getScale(element2) {
  const domElement = unwrapElement(element2);
  if (!isHTMLElement(domElement)) {
    return createCoords(1);
  }
  const rect = domElement.getBoundingClientRect();
  const {
    width,
    height,
    $
  } = getCssDimensions(domElement);
  let x = ($ ? round(rect.width) : rect.width) / width;
  let y = ($ ? round(rect.height) : rect.height) / height;
  if (!x || !Number.isFinite(x)) {
    x = 1;
  }
  if (!y || !Number.isFinite(y)) {
    y = 1;
  }
  return {
    x,
    y
  };
}
var noOffsets = /* @__PURE__ */ createCoords(0);
function getVisualOffsets(element2) {
  const win = getWindow(element2);
  if (!isWebKit() || !win.visualViewport) {
    return noOffsets;
  }
  return {
    x: win.visualViewport.offsetLeft,
    y: win.visualViewport.offsetTop
  };
}
function shouldAddVisualOffsets(element2, isFixed, floatingOffsetParent) {
  if (isFixed === void 0) {
    isFixed = false;
  }
  if (!floatingOffsetParent || isFixed && floatingOffsetParent !== getWindow(element2)) {
    return false;
  }
  return isFixed;
}
function getBoundingClientRect(element2, includeScale, isFixedStrategy, offsetParent) {
  if (includeScale === void 0) {
    includeScale = false;
  }
  if (isFixedStrategy === void 0) {
    isFixedStrategy = false;
  }
  const clientRect = element2.getBoundingClientRect();
  const domElement = unwrapElement(element2);
  let scale = createCoords(1);
  if (includeScale) {
    if (offsetParent) {
      if (isElement(offsetParent)) {
        scale = getScale(offsetParent);
      }
    } else {
      scale = getScale(element2);
    }
  }
  const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
  let x = (clientRect.left + visualOffsets.x) / scale.x;
  let y = (clientRect.top + visualOffsets.y) / scale.y;
  let width = clientRect.width / scale.x;
  let height = clientRect.height / scale.y;
  if (domElement) {
    const win = getWindow(domElement);
    const offsetWin = offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
    let currentWin = win;
    let currentIFrame = getFrameElement(currentWin);
    while (currentIFrame && offsetParent && offsetWin !== currentWin) {
      const iframeScale = getScale(currentIFrame);
      const iframeRect = currentIFrame.getBoundingClientRect();
      const css = getComputedStyle2(currentIFrame);
      const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
      const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
      x *= iframeScale.x;
      y *= iframeScale.y;
      width *= iframeScale.x;
      height *= iframeScale.y;
      x += left;
      y += top;
      currentWin = getWindow(currentIFrame);
      currentIFrame = getFrameElement(currentWin);
    }
  }
  return rectToClientRect({
    width,
    height,
    x,
    y
  });
}
function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
  let {
    elements,
    rect,
    offsetParent,
    strategy
  } = _ref;
  const isFixed = strategy === "fixed";
  const documentElement = getDocumentElement(offsetParent);
  const topLayer = elements ? isTopLayer(elements.floating) : false;
  if (offsetParent === documentElement || topLayer && isFixed) {
    return rect;
  }
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  let scale = createCoords(1);
  const offsets = createCoords(0);
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isHTMLElement(offsetParent)) {
      const offsetRect = getBoundingClientRect(offsetParent);
      scale = getScale(offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    }
  }
  return {
    width: rect.width * scale.x,
    height: rect.height * scale.y,
    x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x,
    y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y
  };
}
function getClientRects(element2) {
  return Array.from(element2.getClientRects());
}
function getWindowScrollBarX(element2) {
  return getBoundingClientRect(getDocumentElement(element2)).left + getNodeScroll(element2).scrollLeft;
}
function getDocumentRect(element2) {
  const html = getDocumentElement(element2);
  const scroll = getNodeScroll(element2);
  const body = element2.ownerDocument.body;
  const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
  const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
  let x = -scroll.scrollLeft + getWindowScrollBarX(element2);
  const y = -scroll.scrollTop;
  if (getComputedStyle2(body).direction === "rtl") {
    x += max(html.clientWidth, body.clientWidth) - width;
  }
  return {
    width,
    height,
    x,
    y
  };
}
function getViewportRect(element2, strategy) {
  const win = getWindow(element2);
  const html = getDocumentElement(element2);
  const visualViewport = win.visualViewport;
  let width = html.clientWidth;
  let height = html.clientHeight;
  let x = 0;
  let y = 0;
  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height;
    const visualViewportBased = isWebKit();
    if (!visualViewportBased || visualViewportBased && strategy === "fixed") {
      x = visualViewport.offsetLeft;
      y = visualViewport.offsetTop;
    }
  }
  return {
    width,
    height,
    x,
    y
  };
}
function getInnerBoundingClientRect(element2, strategy) {
  const clientRect = getBoundingClientRect(element2, true, strategy === "fixed");
  const top = clientRect.top + element2.clientTop;
  const left = clientRect.left + element2.clientLeft;
  const scale = isHTMLElement(element2) ? getScale(element2) : createCoords(1);
  const width = element2.clientWidth * scale.x;
  const height = element2.clientHeight * scale.y;
  const x = left * scale.x;
  const y = top * scale.y;
  return {
    width,
    height,
    x,
    y
  };
}
function getClientRectFromClippingAncestor(element2, clippingAncestor, strategy) {
  let rect;
  if (clippingAncestor === "viewport") {
    rect = getViewportRect(element2, strategy);
  } else if (clippingAncestor === "document") {
    rect = getDocumentRect(getDocumentElement(element2));
  } else if (isElement(clippingAncestor)) {
    rect = getInnerBoundingClientRect(clippingAncestor, strategy);
  } else {
    const visualOffsets = getVisualOffsets(element2);
    rect = {
      ...clippingAncestor,
      x: clippingAncestor.x - visualOffsets.x,
      y: clippingAncestor.y - visualOffsets.y
    };
  }
  return rectToClientRect(rect);
}
function hasFixedPositionAncestor(element2, stopNode) {
  const parentNode = getParentNode(element2);
  if (parentNode === stopNode || !isElement(parentNode) || isLastTraversableNode(parentNode)) {
    return false;
  }
  return getComputedStyle2(parentNode).position === "fixed" || hasFixedPositionAncestor(parentNode, stopNode);
}
function getClippingElementAncestors(element2, cache) {
  const cachedResult = cache.get(element2);
  if (cachedResult) {
    return cachedResult;
  }
  let result = getOverflowAncestors(element2, [], false).filter((el) => isElement(el) && getNodeName(el) !== "body");
  let currentContainingBlockComputedStyle = null;
  const elementIsFixed = getComputedStyle2(element2).position === "fixed";
  let currentNode = elementIsFixed ? getParentNode(element2) : element2;
  while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
    const computedStyle = getComputedStyle2(currentNode);
    const currentNodeIsContaining = isContainingBlock(currentNode);
    if (!currentNodeIsContaining && computedStyle.position === "fixed") {
      currentContainingBlockComputedStyle = null;
    }
    const shouldDropCurrentNode = elementIsFixed ? !currentNodeIsContaining && !currentContainingBlockComputedStyle : !currentNodeIsContaining && computedStyle.position === "static" && !!currentContainingBlockComputedStyle && ["absolute", "fixed"].includes(currentContainingBlockComputedStyle.position) || isOverflowElement(currentNode) && !currentNodeIsContaining && hasFixedPositionAncestor(element2, currentNode);
    if (shouldDropCurrentNode) {
      result = result.filter((ancestor) => ancestor !== currentNode);
    } else {
      currentContainingBlockComputedStyle = computedStyle;
    }
    currentNode = getParentNode(currentNode);
  }
  cache.set(element2, result);
  return result;
}
function getClippingRect(_ref) {
  let {
    element: element2,
    boundary,
    rootBoundary,
    strategy
  } = _ref;
  const elementClippingAncestors = boundary === "clippingAncestors" ? isTopLayer(element2) ? [] : getClippingElementAncestors(element2, this._c) : [].concat(boundary);
  const clippingAncestors = [...elementClippingAncestors, rootBoundary];
  const firstClippingAncestor = clippingAncestors[0];
  const clippingRect = clippingAncestors.reduce((accRect, clippingAncestor) => {
    const rect = getClientRectFromClippingAncestor(element2, clippingAncestor, strategy);
    accRect.top = max(rect.top, accRect.top);
    accRect.right = min(rect.right, accRect.right);
    accRect.bottom = min(rect.bottom, accRect.bottom);
    accRect.left = max(rect.left, accRect.left);
    return accRect;
  }, getClientRectFromClippingAncestor(element2, firstClippingAncestor, strategy));
  return {
    width: clippingRect.right - clippingRect.left,
    height: clippingRect.bottom - clippingRect.top,
    x: clippingRect.left,
    y: clippingRect.top
  };
}
function getDimensions(element2) {
  const {
    width,
    height
  } = getCssDimensions(element2);
  return {
    width,
    height
  };
}
function getRectRelativeToOffsetParent(element2, offsetParent, strategy) {
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  const documentElement = getDocumentElement(offsetParent);
  const isFixed = strategy === "fixed";
  const rect = getBoundingClientRect(element2, true, isFixed, offsetParent);
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const offsets = createCoords(0);
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isOffsetParentAnElement) {
      const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    } else if (documentElement) {
      offsets.x = getWindowScrollBarX(documentElement);
    }
  }
  const x = rect.left + scroll.scrollLeft - offsets.x;
  const y = rect.top + scroll.scrollTop - offsets.y;
  return {
    x,
    y,
    width: rect.width,
    height: rect.height
  };
}
function isStaticPositioned(element2) {
  return getComputedStyle2(element2).position === "static";
}
function getTrueOffsetParent(element2, polyfill) {
  if (!isHTMLElement(element2) || getComputedStyle2(element2).position === "fixed") {
    return null;
  }
  if (polyfill) {
    return polyfill(element2);
  }
  return element2.offsetParent;
}
function getOffsetParent(element2, polyfill) {
  const win = getWindow(element2);
  if (isTopLayer(element2)) {
    return win;
  }
  if (!isHTMLElement(element2)) {
    let svgOffsetParent = getParentNode(element2);
    while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
      if (isElement(svgOffsetParent) && !isStaticPositioned(svgOffsetParent)) {
        return svgOffsetParent;
      }
      svgOffsetParent = getParentNode(svgOffsetParent);
    }
    return win;
  }
  let offsetParent = getTrueOffsetParent(element2, polyfill);
  while (offsetParent && isTableElement(offsetParent) && isStaticPositioned(offsetParent)) {
    offsetParent = getTrueOffsetParent(offsetParent, polyfill);
  }
  if (offsetParent && isLastTraversableNode(offsetParent) && isStaticPositioned(offsetParent) && !isContainingBlock(offsetParent)) {
    return win;
  }
  return offsetParent || getContainingBlock(element2) || win;
}
var getElementRects = async function(data) {
  const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
  const getDimensionsFn = this.getDimensions;
  const floatingDimensions = await getDimensionsFn(data.floating);
  return {
    reference: getRectRelativeToOffsetParent(data.reference, await getOffsetParentFn(data.floating), data.strategy),
    floating: {
      x: 0,
      y: 0,
      width: floatingDimensions.width,
      height: floatingDimensions.height
    }
  };
};
function isRTL(element2) {
  return getComputedStyle2(element2).direction === "rtl";
}
var platform = {
  convertOffsetParentRelativeRectToViewportRelativeRect,
  getDocumentElement,
  getClippingRect,
  getOffsetParent,
  getElementRects,
  getClientRects,
  getDimensions,
  getScale,
  isElement,
  isRTL
};
function observeMove(element2, onMove) {
  let io = null;
  let timeoutId;
  const root = getDocumentElement(element2);
  function cleanup() {
    var _io;
    clearTimeout(timeoutId);
    (_io = io) == null || _io.disconnect();
    io = null;
  }
  function refresh(skip, threshold) {
    if (skip === void 0) {
      skip = false;
    }
    if (threshold === void 0) {
      threshold = 1;
    }
    cleanup();
    const {
      left,
      top,
      width,
      height
    } = element2.getBoundingClientRect();
    if (!skip) {
      onMove();
    }
    if (!width || !height) {
      return;
    }
    const insetTop = floor(top);
    const insetRight = floor(root.clientWidth - (left + width));
    const insetBottom = floor(root.clientHeight - (top + height));
    const insetLeft = floor(left);
    const rootMargin = -insetTop + "px " + -insetRight + "px " + -insetBottom + "px " + -insetLeft + "px";
    const options = {
      rootMargin,
      threshold: max(0, min(1, threshold)) || 1
    };
    let isFirstUpdate = true;
    function handleObserve(entries) {
      const ratio = entries[0].intersectionRatio;
      if (ratio !== threshold) {
        if (!isFirstUpdate) {
          return refresh();
        }
        if (!ratio) {
          timeoutId = setTimeout(() => {
            refresh(false, 1e-7);
          }, 1e3);
        } else {
          refresh(false, ratio);
        }
      }
      isFirstUpdate = false;
    }
    try {
      io = new IntersectionObserver(handleObserve, {
        ...options,
        // Handle <iframe>s
        root: root.ownerDocument
      });
    } catch (e) {
      io = new IntersectionObserver(handleObserve, options);
    }
    io.observe(element2);
  }
  refresh(true);
  return cleanup;
}
function autoUpdate(reference, floating, update, options) {
  if (options === void 0) {
    options = {};
  }
  const {
    ancestorScroll = true,
    ancestorResize = true,
    elementResize = typeof ResizeObserver === "function",
    layoutShift = typeof IntersectionObserver === "function",
    animationFrame = false
  } = options;
  const referenceEl = unwrapElement(reference);
  const ancestors = ancestorScroll || ancestorResize ? [...referenceEl ? getOverflowAncestors(referenceEl) : [], ...getOverflowAncestors(floating)] : [];
  ancestors.forEach((ancestor) => {
    ancestorScroll && ancestor.addEventListener("scroll", update, {
      passive: true
    });
    ancestorResize && ancestor.addEventListener("resize", update);
  });
  const cleanupIo = referenceEl && layoutShift ? observeMove(referenceEl, update) : null;
  let reobserveFrame = -1;
  let resizeObserver = null;
  if (elementResize) {
    resizeObserver = new ResizeObserver((_ref) => {
      let [firstEntry] = _ref;
      if (firstEntry && firstEntry.target === referenceEl && resizeObserver) {
        resizeObserver.unobserve(floating);
        cancelAnimationFrame(reobserveFrame);
        reobserveFrame = requestAnimationFrame(() => {
          var _resizeObserver;
          (_resizeObserver = resizeObserver) == null || _resizeObserver.observe(floating);
        });
      }
      update();
    });
    if (referenceEl && !animationFrame) {
      resizeObserver.observe(referenceEl);
    }
    resizeObserver.observe(floating);
  }
  let frameId;
  let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;
  if (animationFrame) {
    frameLoop();
  }
  function frameLoop() {
    const nextRefRect = getBoundingClientRect(reference);
    if (prevRefRect && (nextRefRect.x !== prevRefRect.x || nextRefRect.y !== prevRefRect.y || nextRefRect.width !== prevRefRect.width || nextRefRect.height !== prevRefRect.height)) {
      update();
    }
    prevRefRect = nextRefRect;
    frameId = requestAnimationFrame(frameLoop);
  }
  update();
  return () => {
    var _resizeObserver2;
    ancestors.forEach((ancestor) => {
      ancestorScroll && ancestor.removeEventListener("scroll", update);
      ancestorResize && ancestor.removeEventListener("resize", update);
    });
    cleanupIo == null || cleanupIo();
    (_resizeObserver2 = resizeObserver) == null || _resizeObserver2.disconnect();
    resizeObserver = null;
    if (animationFrame) {
      cancelAnimationFrame(frameId);
    }
  };
}
var offset2 = offset;
var shift2 = shift;
var flip2 = flip;
var size2 = size;
var computePosition2 = (reference, floating, options) => {
  const cache = /* @__PURE__ */ new Map();
  const mergedOptions = {
    platform,
    ...options
  };
  const platformWithCache = {
    ...mergedOptions.platform,
    _c: cache
  };
  return computePosition(reference, floating, {
    ...mergedOptions,
    platform: platformWithCache
  });
};

// js/mixins/anchorable.js
var Anchorable = class extends Mixin {
  boot({ options }) {
    options({
      reference: null,
      auto: true,
      position: "bottom start",
      gap: "5",
      offset: "0",
      matchWidth: false
    });
    if (this.options().reference === null) return;
    if (this.options().position === null) return;
    let [setPosition, cleanupDurablePositioning] = createDurablePositionSetter(this.el);
    let reposition = anchor(this.el, this.options().reference, setPosition, {
      position: this.options().position,
      gap: this.options().gap,
      offset: this.options().offset,
      matchWidth: this.options().matchWidth
    });
    let cleanupAutoUpdate = () => {
    };
    this.reposition = (...args) => {
      if (this.options().auto) {
        cleanupAutoUpdate = autoUpdate(this.options().reference, this.el, reposition, {
          ancestorScroll: true,
          ancestorResize: true,
          elementResize: true,
          layoutShift: true,
          animationFrame: true
          // This may be too slow, but otherwise the anchoring is pretty janky...
        });
      } else {
        reposition(...args);
      }
    };
    this.cleanup = () => {
      cleanupAutoUpdate();
      cleanupDurablePositioning();
    };
  }
};
function anchor(target, invoke, setPosition, { position, offset: offsetValue, gap, matchWidth }) {
  return (forceX = null, forceY = null) => {
    computePosition2(invoke, target, {
      placement: compilePlacement(position),
      // Placements: ['top', 'top-start', 'top-end', 'right', 'right-start', 'right-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'left-start', 'left-end']
      middleware: [
        flip2(),
        shift2({ padding: 5, crossAxis: true }),
        offset2({
          mainAxis: Number(gap),
          alignmentAxis: Number(offsetValue)
        }),
        matchWidth ? size2({
          apply({ rects, elements }) {
            Object.assign(elements.floating.style, {
              width: `${rects.reference.width}px`
            });
          }
        }) : void 0
      ]
    }).then(({ x, y }) => {
      setPosition(forceX || x, forceY || y);
    });
  };
}
function compilePlacement(anchor2) {
  return anchor2.split(" ").join("-");
}
function createDurablePositionSetter(target) {
  let position = (x, y) => {
    Object.assign(target.style, {
      position: "absolute",
      inset: `${y}px auto auto ${x}px`
    });
  };
  let lastX, lastY;
  let observer = new MutationObserver(() => position(lastX, lastY));
  return [
    (x, y) => {
      lastX = x;
      lastY = y;
      observer.disconnect();
      position(lastX, lastY);
      observer.observe(target, { attributeFilter: ["style"] });
    },
    () => {
      observer.disconnect();
    }
  ];
}

// js/dropdown.js
var UIDropdown = class extends UIElement {
  boot() {
    let trigger = this.trigger();
    let overlay = this.overlay();
    if (!trigger) {
      return console.warn("ui-dropdown: no trigger element found", this);
    } else if (!overlay) {
      return console.warn("ui-dropdown: no [popover] overlay found", this);
    }
    this._disabled = this.hasAttribute("disabled");
    this._controllable = new Controllable(this);
    overlay._popoverable = new Popoverable(overlay);
    overlay._anchorable = new Anchorable(overlay, {
      reference: trigger,
      position: this.hasAttribute("position") ? this.getAttribute("position") : void 0,
      gap: this.hasAttribute("gap") ? this.getAttribute("gap") : void 0,
      offset: this.hasAttribute("offset") ? this.getAttribute("offset") : void 0
    });
    overlay._popoverable.onChange(() => {
      overlay._popoverable.getState() ? overlay._anchorable.reposition() : overlay._anchorable.cleanup();
    });
    this._controllable.initial((initial) => overlay._popoverable.setState(initial));
    this._controllable.getter(() => overlay._popoverable.getState());
    let detangled = detangle();
    this._controllable.setter((value) => overlay._popoverable.setState(value));
    overlay._popoverable.onChange(detangled(() => this._controllable.dispatch()));
    if (this.hasAttribute("hover")) {
      interest(trigger, overlay, {
        gain() {
          overlay._popoverable.setState(true);
        },
        lose() {
          overlay._popoverable.setState(false);
        },
        focusable: true
      });
    }
    on(trigger, "click", () => overlay._popoverable.toggle());
    if (overlay._popoverable.getState()) {
      setAttribute2(this, "data-open", "");
      setAttribute2(trigger, "data-open", "");
      setAttribute2(overlay, "data-open", "");
    } else {
      removeAttribute(this, "data-open");
      removeAttribute(trigger, "data-open");
      removeAttribute(overlay, "data-open");
    }
    overlay._popoverable.onChange(() => {
      if (overlay._popoverable.getState()) {
        setAttribute2(this, "data-open", "");
        setAttribute2(trigger, "data-open", "");
        setAttribute2(overlay, "data-open", "");
      } else {
        removeAttribute(this, "data-open");
        removeAttribute(trigger, "data-open");
        removeAttribute(overlay, "data-open");
      }
    });
    let id = assignId(overlay, "dropdown");
    setAttribute2(trigger, "aria-haspopup", "true");
    setAttribute2(trigger, "aria-controls", id);
    setAttribute2(trigger, "aria-expanded", overlay._popoverable.getState() ? "true" : "false");
    overlay._popoverable.onChange(() => {
      setAttribute2(trigger, "aria-expanded", overlay._popoverable.getState() ? "true" : "false");
    });
    overlay._popoverable.onChange(() => {
      overlay._popoverable.getState() ? overlay.onPopoverShow?.() : overlay.onPopoverHide?.();
    });
  }
  trigger() {
    return this.querySelector("button");
  }
  overlay() {
    return this.lastElementChild?.matches("[popover]") && this.lastElementChild;
  }
};
element("dropdown", UIDropdown);

// js/context.js
var UIContext = class extends UIElement {
  boot() {
    let trigger = this.trigger();
    let overlay = this.overlay();
    this._disabled = this.hasAttribute("disabled");
    this._popoverable = new Popoverable(overlay);
    this._anchorable = new Anchorable(overlay, {
      reference: trigger,
      auto: false,
      position: this.hasAttribute("position") ? this.getAttribute("position") : void 0,
      gap: this.hasAttribute("gap") ? this.getAttribute("gap") : void 0,
      offset: this.hasAttribute("offset") ? this.getAttribute("offset") : void 0
    });
    on(trigger, "contextmenu", (e) => {
      e.preventDefault();
      this._anchorable.reposition(e.pageX, e.pageY);
      this._popoverable.setState(true);
      if (this.hasAttribute("detail")) {
        setAttribute2(overlay, "data-detail", this.getAttribute("detail"));
      }
    });
    if (this.hasAttribute("detail")) {
      setAttribute2(overlay, "data-detail", "");
    }
  }
  trigger() {
    return this.firstElementChild;
  }
  overlay() {
    if (this.hasAttribute("target")) {
      let target = this.getAttribute("target");
      return document.getElementById(target);
    } else {
      return this.lastElementChild.matches("[popover]") && this.lastElementChild;
    }
  }
};
element("context", UIContext);

// js/mixins/activatable.js
var ActivatableGroup = class extends MixinGroup {
  groupOfType = Activatable;
  boot({ options }) {
    options({
      wrap: false,
      filter: false
    });
    this.onChanges = [];
  }
  onChange(callback) {
    this.onChanges.push(callback);
  }
  activated(activeEl) {
    this.onChanges.forEach((i) => i());
  }
  activateFirst() {
    this.filterAwareWalker().first()?.use(Activatable).activate();
  }
  activateSelectedOrFirst(selectedEl) {
    let isHidden = (el) => el.matches("ui-option") ? getComputedStyle(el).display === "none" : false;
    if (!selectedEl || isHidden(selectedEl)) {
      this.filterAwareWalker().first()?.use(Activatable).activate();
      return;
    }
    selectedEl?.use(Activatable).activate();
  }
  activateActiveOrFirst() {
    let active = this.getActive();
    if (!active) {
      this.filterAwareWalker().first()?.use(Activatable).activate();
      return;
    }
    active?.use(Activatable).activate();
  }
  activateActiveOrLast() {
    let active = this.getActive();
    if (!active) {
      this.filterAwareWalker().last()?.use(Activatable).activate();
      return;
    }
    active?.use(Activatable).activate();
  }
  activatePrev() {
    let active = this.getActive();
    if (!active) {
      this.filterAwareWalker().last()?.use(Activatable).activate();
      return;
    }
    let found;
    if (this.options.wrap) {
      found = this.filterAwareWalker().prevOrLast(active);
    } else {
      found = this.filterAwareWalker().prev(active);
    }
    found?.use(Activatable).activate();
  }
  activateNext() {
    let active = this.getActive();
    if (!active) {
      this.filterAwareWalker().first()?.use(Activatable).activate();
      return;
    }
    let found;
    if (this.options.wrap) {
      found = this.filterAwareWalker().nextOrFirst(active);
    } else {
      found = this.filterAwareWalker().next(active);
    }
    found?.use(Activatable).activate();
  }
  getActive() {
    return this.walker().find((i) => i.use(Activatable).isActive());
  }
  clearActive() {
    this.getActive()?.use(Activatable).deactivate();
  }
  filterAwareWalker() {
    let isHidden = (el) => el.matches("ui-option") ? getComputedStyle(el).display === "none" : false;
    return walker(this.el, (el, { skip, reject }) => {
      if (el[this.constructor.name] && el !== this.el) return reject();
      if (!el[this.groupOfType.name]) return skip();
      if (el.hasAttribute("disabled")) return reject();
      if (isHidden(el)) return reject();
    });
  }
};
var Activatable = class _Activatable extends Mixin {
  groupedByType = ActivatableGroup;
  mount() {
    this.el.addEventListener("mouseenter", () => {
      this.activate();
    });
    this.el.addEventListener("mouseleave", () => {
      this.deactivate();
    });
  }
  activate() {
    if (this.group()) {
      this.group().walker().each((item) => item.use(_Activatable).deactivate(false));
    }
    setAttribute2(this.el, "data-active", "");
    this.el.scrollIntoView({ block: "nearest" });
    this.group() && this.group().activated(this.el);
  }
  deactivate(notify = true) {
    removeAttribute(this.el, "data-active");
    notify && this.group() && this.group().activated(this.el);
  }
  isActive() {
    return this.el.hasAttribute("data-active");
  }
};

// js/mixins/filterable.js
var FilterableGroup = class extends MixinGroup {
  groupOfType = Filterable;
  boot({ options }) {
    options({});
    this.onChanges = [];
    this.lastSearch = "";
  }
  onChange(callback) {
    this.onChanges.push(callback);
  }
  filter(search2) {
    if (search2 === "") {
      this.walker().each((i) => {
        i.use(Filterable).unfilter();
      });
    } else {
      this.walker().each((i) => {
        if (this.matches(i, search2)) {
          i.use(Filterable).unfilter();
        } else {
          i.use(Filterable).filter();
        }
      });
    }
    if (this.lastSearch !== search2) {
      this.onChanges.forEach((i) => i());
    }
    this.lastSearch = search2;
  }
  matches(el, search2) {
    return el.textContent.toLowerCase().trim().includes(search2.toLowerCase().trim());
  }
  hasResults() {
    return this.walker().some((i) => !i.use(Filterable).isFiltered());
  }
};
var Filterable = class extends Mixin {
  groupedByType = FilterableGroup;
  boot({ options }) {
    options({ mirror: null, keep: false });
    this.onChanges = [];
  }
  filter() {
    if (this.options().keep) return;
    setAttribute2(this.el, "data-hidden", "");
    if (this.options().mirror) setAttribute2(this.options().mirror, "data-hidden", "");
  }
  unfilter() {
    removeAttribute(this.el, "data-hidden");
    if (this.options().mirror) removeAttribute(this.options().mirror, "data-hidden", "");
  }
  isFiltered() {
    return this.el.hasAttribute("data-hidden");
  }
};

// js/mixins/focusable.js
var FocusableGroup = class extends MixinGroup {
  groupOfType = Focusable;
  boot({ options }) {
    options({ wrap: false, ensureTabbable: true });
  }
  mount() {
    this.options().ensureTabbable && this.ensureTabbable();
  }
  focusFirst() {
    let target;
    target = target || this.walker().find((i) => i.hasAttribute("autofocus"));
    target = target || this.walker().find((i) => i.getAttribute("tabindex") === "0");
    target = target || this.walker().find((i) => i.getAttribute("tabindex") === "-1");
    target = target || this.walker().find((i) => isFocusable3(i));
    target?.focus();
  }
  focusPrev() {
    this.moveFocus((from) => {
      return this.options().wrap ? this.walker().prevOrLast(from) : this.walker().prev(from);
    });
  }
  focusNext() {
    this.moveFocus((from) => {
      return this.options().wrap ? this.walker().nextOrFirst(from) : this.walker().next(from);
    });
  }
  focusBySearch(query) {
    let found = this.walker().find((i) => i.textContent.toLowerCase().trim().startsWith(query.toLowerCase()));
    found?.use(Focusable).tabbable();
    found?.use(Focusable).focus();
  }
  moveFocus(callback) {
    let tabbable = this.walker().find((i) => i.use(Focusable).isTabbable());
    let to = callback(tabbable);
    to?.use(Focusable).focus();
  }
  ensureTabbable() {
    this.walker().findOrFirst((el) => {
      el.use(Focusable).isTabbable();
    })?.use(Focusable).tabbable();
  }
  wipeTabbables() {
    this.walker().each((el) => {
      el.use(Focusable).untabbable();
    });
  }
  untabbleOthers(except) {
    this.walker().each((el) => {
      if (el === except) return;
      el.use(Focusable).untabbable();
    });
  }
  walker() {
    return walker(this.el, (el, { skip, reject }) => {
      if (el[this.constructor.name] && el !== this.el) return reject();
      if (!el[this.groupOfType.name]) return skip();
      if (el.hasAttribute("disabled")) return reject();
    });
  }
};
var Focusable = class extends Mixin {
  groupedByType = FocusableGroup;
  boot({ options }) {
    options({ hover: false, disableable: null, tabbable: false, tabbableAttr: null });
  }
  mount() {
    let disableable = this.options().disableable;
    if (!disableable) throw "Focusable requires a Disableable instance...";
    if (!this.el.hasAttribute("tabindex")) {
      this.options().tabbable ? this.tabbable() : this.untabbable();
    }
    this.pauseFocusListener = this.on("focus", disableable.enabled(() => {
      this.focus(false);
    })).pause;
    this.on("focus", disableable.enabled(() => {
      isUsingKeyboard() && setAttribute2(this.el, "data-focus", "");
    }));
    this.on("blur", disableable.enabled(() => {
      removeAttribute(this.el, "data-focus");
    }));
    this.options().hover && this.on("pointerenter", disableable.enabled(() => {
      this.group()?.untabbleOthers(this.el);
      this.tabbable();
    }));
    this.options().hover && this.on("pointerleave", disableable.enabled((e) => {
      this.untabbable();
    }));
  }
  focus(focusProgramatically = true) {
    this.group()?.untabbleOthers(this.el);
    this.tabbable();
    focusProgramatically && this.pauseFocusListener(() => {
      this.el.focus({ focusVisible: false });
    });
  }
  tabbable() {
    setAttribute2(this.el, "tabindex", "0");
    this.options().tabbableAttr && setAttribute2(this.el, this.options().tabbableAttr, "");
  }
  untabbable() {
    setAttribute2(this.el, "tabindex", "-1");
    this.options().tabbableAttr && removeAttribute(this.el, this.options().tabbableAttr);
  }
  isTabbable() {
    return this.el.getAttribute("tabindex") === "0";
  }
};

// js/options.js
var UIOptions = class extends UIElement {
  boot() {
    setAttribute2(this, "tabindex", "-1");
    if (this.hasAttribute("popover")) {
      this.addEventListener("lofi-close-popovers", () => {
        this.hidePopover();
      });
    }
    setAttribute2(this, "role", "listbox");
  }
};
var UIOption = class extends UIElement {
  mount() {
    this._disabled = this.hasAttribute("disabled");
    let target = this;
    if (this._disabled) {
      setAttribute2(target, "disabled", "");
      setAttribute2(target, "aria-disabled", "true");
    }
    let id = assignId(target, "option");
    setAttribute2(target, "role", "option");
    this._filterable = new Filterable(target, {
      mirror: this,
      keep: !!this.closest("ui-empty") || this.getAttribute("filter") === "manual"
    });
    if (this._disabled) return;
    this._activatable = new Activatable(target);
    if (!this.hasAttribute("action")) {
      this._selectable = new Selectable(target, {
        value: this.getValue(),
        label: this.getLabel(),
        selectedInitially: this.hasAttribute("selected")
      });
    }
    let observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "selected") {
          if (this.hasAttribute("selected")) this._selectable.setState(true);
          else this._selectable.setState(false);
        }
      });
    });
    observer.observe(this, { attributeFilter: ["selected"] });
  }
  get selected() {
    if (this._disabled) return false;
    if (!this?._selectable) return false;
    return this._selectable.isSelected();
  }
  set selected(value) {
    if (this._disabled) return;
    if (!this?._selectable) return false;
    this._selectable.setState(value);
  }
  getLabel() {
    return this.hasAttribute("label") ? this.getAttribute("label") : this.textContent.trim();
  }
  getValue() {
    return this.hasAttribute("value") ? this.getAttribute("value") : this.textContent.trim();
  }
};
inject(({ css }) => css`ui-options:not([popover]), ui-option { display: block; cursor: default; }`);
element("options", UIOptions);
element("option", UIOption);

// js/tooltip.js
var UITooltip = class extends UIElement {
  boot() {
    let type = this.hasAttribute("label") ? "label" : "description";
    let button = this.button();
    let overlay = this.overlay();
    if (!button) {
      return console.warn("ui-tooltip: no trigger element found", this);
    } else if (!overlay) {
      return;
    }
    this._disabled = this.hasAttribute("disabled");
    overlay._popoverable = new Popoverable(overlay);
    overlay._anchorable = new Anchorable(overlay, {
      reference: button,
      position: this.hasAttribute("position") ? this.getAttribute("position") : void 0,
      gap: this.hasAttribute("gap") ? this.getAttribute("gap") : void 0,
      offset: this.hasAttribute("offset") ? this.getAttribute("offset") : void 0
    });
    overlay._popoverable.onChange(() => overlay._anchorable.reposition());
    if (!this._disabled) {
      interest(button, overlay, {
        gain() {
          overlay._popoverable.setState(true);
        },
        lose() {
          overlay._popoverable.setState(false);
        },
        focusable: true
      });
    }
    let id = assignId(overlay, "tooltip");
    setAttribute2(button, "aria-controls", id);
    setAttribute2(button, "aria-expanded", "false");
    overlay._popoverable.onChange(() => {
      overlay._popoverable.getState() ? setAttribute2(button, "aria-expanded", "true") : setAttribute2(button, "aria-expanded", "false");
    });
    if (type === "label") setAttribute2(button, "aria-labelledby", id);
    else setAttribute2(button, "aria-describedby", id);
    setAttribute2(overlay, "role", "tooltip");
  }
  button() {
    return this.firstElementChild;
  }
  overlay() {
    return this.lastElementChild !== this.button() && this.lastElementChild;
  }
};
element("tooltip", UITooltip);

// js/selected.js
var UISelected = class extends UIElement {
  boot() {
    if (!this.querySelector("template")) {
      let template = document.createElement("template");
      template.setAttribute("name", "placeholder");
      template.innerHTML = "<span>" + this.innerHTML + "</span>";
      this.innerHTML = "";
      this.appendChild(template);
    }
    if (!this.querySelector('template[name="options"]')) {
      let template = document.createElement("template");
      template.setAttribute("name", "options");
      template.innerHTML = "<div><slot></slot></div>";
      this.appendChild(template);
    }
    if (!this.querySelector('template[name="option"]')) {
      let template = document.createElement("template");
      template.setAttribute("name", "option");
      template.innerHTML = "<div><slot></slot></div>";
      this.appendChild(template);
    }
    this.templates = {
      placeholder: this.querySelector('template[name="placeholder"]'),
      overflow: this.querySelector('template[name="overflow"]'),
      options: this.querySelector('template[name="options"]'),
      option: this.querySelector('template[name="option"]')
    };
    this.templates.options.elsByValue = /* @__PURE__ */ new Map();
    this.max = this.templates.overflow?.getAttribute("max") ? this.templates.overflow.getAttribute("max") : Infinity;
    this.selecteds = /* @__PURE__ */ new Map();
    this.picker = this.closest("ui-select");
    this.multiple = this.picker.hasAttribute("multiple");
  }
  mount() {
    queueMicrotask(() => {
      this.picker._selectable.onInitAndChange(() => {
        let retry = true;
        this.render(true);
      });
      let optionsEl = this.picker.list();
      if (optionsEl) {
        new MutationObserver((mutations) => {
          queueMicrotask(() => this.render());
        }).observe(optionsEl, { childList: true });
      }
    });
  }
  render(retry) {
    if (!this.multiple) {
      let value = this.picker.value;
      if (Array.from(this.selecteds.keys()).includes(value)) {
        return;
      }
      this.selecteds.clear();
      if (!["", null, void 0].includes(value)) {
        let selected = this.picker._selectable.findByValue(value);
        if (!selected) {
          if (retry) return setTimeout(() => {
            console.log("retrying...");
            this.render();
          });
          else throw `Could not find option for value "${value}"`;
        }
        this.selecteds.set(value, selected);
      }
      this.templates.placeholder?.clearPlaceholder?.();
      this.templates.option?.clearOption?.();
      if (this.selecteds.size > 0) {
        this.renderOption();
      } else {
        this.renderPlaceholder();
      }
    } else {
      let values = this.picker.value;
      let removedValues = Array.from(this.selecteds.keys()).filter((i) => !values.includes(i));
      let newValues = values.filter((i) => !this.selecteds.has(i));
      removedValues.forEach((value) => this.selecteds.delete(value));
      let newSelecteds = /* @__PURE__ */ new Map();
      for (let value of newValues) {
        let selected = this.picker._selectable.findByValue(value);
        if (!selected) {
          if (retry) return setTimeout(() => this.render());
          else throw `Could not find option for value "${value}"`;
        }
        newSelecteds.set(value, selected);
      }
      newSelecteds.forEach((selected, value) => this.selecteds.set(value, selected));
      this.templates.placeholder?.clearPlaceholder?.();
      this.templates.overflow?.clearOverflow?.();
      this.templates.options?.clearOptions?.();
      if (this.selecteds.size > 0) {
        this.renderOptions({
          hasOverflowed: (rendered) => {
            if (this.max === "auto") {
              let willOverflow = false;
              this.renderOverflow(this.selecteds.size, this.selecteds.size - rendered);
              if (this.clientWidth < this.scrollWidth) {
                willOverflow = true;
              }
              this.templates.overflow?.clearOverflow?.();
              if (willOverflow) {
                return true;
              }
            }
            return rendered > parseInt(this.max);
          },
          renderOverflow: (remainder) => {
            if (this.templates?.overflow?.getAttribute("mode") !== "append") {
              this.templates.options?.clearOptions?.();
            }
            this.renderOverflow(this.selecteds.size, remainder);
          }
        });
      } else {
        this.renderPlaceholder();
      }
    }
  }
  renderOptions({ hasOverflowed, renderOverflow }) {
    let container = document.createElement("div");
    container.style.display = "contents";
    let optionsEl = hydrateTemplate(this.templates.options, {
      default: container
    });
    this.templates.options.after(optionsEl);
    this.templates.options.clearOptions = () => {
      optionsEl.remove();
      this.templates.options.clearOptions = () => {
      };
    };
    let rendered = 0;
    let shouldRenderOverflow = false;
    for (let [value, selected] of this.selecteds) {
      let fragment2 = new DocumentFragment();
      fragment2.append(...selected.el.cloneNode(true).childNodes);
      let optionEl = hydrateTemplate(this.templates.option, {
        text: selected.el.textContent.trim(),
        default: fragment2,
        value
      });
      optionEl.setAttribute("data-value", value);
      optionEl.deselect = () => selected.deselect();
      container.appendChild(optionEl);
      rendered++;
      if (hasOverflowed(rendered)) {
        shouldRenderOverflow = true;
        container.removeChild(optionEl);
        rendered--;
        break;
      }
    }
    let fragment = new DocumentFragment();
    fragment.append(...container.childNodes);
    container.replaceWith(fragment);
    if (shouldRenderOverflow) {
      renderOverflow(this.selecteds.size - rendered);
    }
  }
  renderOption() {
    for (let [value, selected] of this.selecteds) {
      let fragment = new DocumentFragment();
      fragment.append(...selected.el.cloneNode(true).childNodes);
      let optionEl = hydrateTemplate(this.templates.option, {
        text: selected.el.textContent.trim(),
        default: fragment,
        value
      });
      optionEl.setAttribute("data-value", value);
      optionEl.deselect = () => selected.deselect();
      this.templates.option.after(optionEl);
      this.templates.option.clearOption = () => {
        optionEl.remove();
        this.templates.option.clearOption = () => {
        };
      };
    }
  }
  renderPlaceholder() {
    if (!this.templates.placeholder) return;
    let el = hydrateTemplate(this.templates.placeholder);
    this.templates.placeholder.after(el);
    this.templates.placeholder.clearPlaceholder = () => {
      el.remove();
      this.templates.placeholder.clearPlaceholder = () => {
      };
    };
  }
  renderOverflow(count, remainder) {
    if (!this.templates.overflow) return;
    let el = hydrateTemplate(this.templates.overflow, {
      remainder,
      count: this.selecteds.size
    });
    this.templates.overflow.after(el);
    this.templates.overflow.clearOverflow = () => {
      el.remove();
      this.templates.placeholder.clearOverflow = () => {
      };
    };
  }
};
function hydrateTemplate(template, slots = {}) {
  let fragment = template.content.cloneNode(true);
  Object.entries(slots).forEach(([key, value]) => {
    let slotNodes = key === "default" ? fragment.querySelectorAll("slot:not([name])") : fragment.querySelectorAll(`slot[name="${key}"]`);
    slotNodes.forEach((i) => i.replaceWith(
      typeof value === "string" ? document.createTextNode(value) : value
    ));
  });
  return fragment.firstElementChild;
}

// js/select.js
var UISelect = class extends UIControl {
  boot() {
    let list = this.list();
    this._controllable = new Controllable(this);
    this._selectable = new SelectableGroup(list, {
      multiple: this.hasAttribute("multiple")
    });
    this._controllable.initial((initial) => initial && this._selectable.setState(initial));
    this._controllable.getter(() => this._selectable.getState());
    let detangled = detangle();
    this._controllable.setter(detangled((value) => {
      this._selectable.setState(value);
    }));
    this._selectable.onChange(detangled(() => {
      this._controllable.dispatch();
      this.dispatchEvent(new CustomEvent("select", { bubbles: false }));
    }));
  }
  mount() {
    this._disableable = new Disableable(this);
    let input = this.input();
    let button = this.button();
    let trigger = this.trigger();
    let list = this.list();
    let overlay = this.overlay();
    let multiple = this.hasAttribute("multiple");
    let autocomplete = this.hasAttribute("autocomplete");
    let strictAutocomplete = this.hasAttribute("autocomplete") && this.getAttribute("autocomplete").trim().split(" ").includes("strict");
    let listbox = this.querySelector("ui-options") || this;
    let listId = initListbox(listbox, "options");
    this._activatable = new ActivatableGroup(listbox, { filter: "data-hidden" });
    if (!input && !button) {
      this._disableable.onInitAndChange((disabled) => {
        disabled ? this.removeAttribute("tabindex") : this.setAttribute("tabindex", "0");
      });
    }
    if (this.hasAttribute("filter") && this.getAttribute("filter") !== "manual") {
      this._filterable = new FilterableGroup(list);
      this._filterable.onChange(() => {
        this._activatable.clearActive();
        if (this._filterable.hasResults()) {
          this._activatable.activateFirst();
        }
      });
      this.addEventListener("close", () => {
        if (this._filterable) {
          this._filterable.filter("");
        }
      });
    }
    if (!this.querySelector("[popover], input")) {
      handleKeyboardNavigation(this, this._activatable);
      handleKeyboardSelection(this, this, this._activatable);
      handleActivationOnFocus(this, this._activatable, this._selectable);
    } else if (!this.querySelector("[popover]") && this.querySelector("input")) {
      let input2 = this.querySelector("input");
      this._disableable.onInitAndChange((disabled) => {
        if (disabled) {
          input2 && setAttribute2(input2, "disabled", "");
        } else {
          input2 && removeAttribute(input2, "disabled");
        }
      });
      handleInputClearing(this, input2, this._selectable, this._popoverable);
      handleActivationOnFocus(input2, this._activatable, this._selectable);
      handleAutocomplete(autocomplete, strictAutocomplete, this, input2, this._selectable, this._popoverable);
      preventInputEventsFromBubblingToSelectRoot(input2);
      highlightInputContentsWhenFocused(input2);
      this._filterable && filterResultsByInput(input2, this._filterable);
      trackActiveDescendant(input2, this._activatable);
      handleKeyboardNavigation(input2, this._activatable);
      handleKeyboardSelection(this, input2, this._activatable);
      handleMouseSelection(this, this._activatable);
    } else if (this.querySelector("[popover]") && this.querySelector("input:not([popover] input)")) {
      let input2 = this.querySelector("input:not([popover] input)");
      setAttribute2(input2, "role", "combobox");
      setAttribute2(input2, "aria-controls", listId);
      let popover = this.querySelector("[popover]");
      this._popoverable = new Popoverable(popover);
      this._anchorable = new Anchorable(popover, {
        reference: input2,
        matchWidth: true,
        position: this.hasAttribute("position") ? this.getAttribute("position") : void 0,
        gap: this.hasAttribute("gap") ? this.getAttribute("gap") : void 0,
        offset: this.hasAttribute("offset") ? this.getAttribute("offset") : void 0
      });
      handleAutocomplete(autocomplete, strictAutocomplete, this, input2, this._selectable, this._popoverable);
      this._disableable.onInitAndChange((disabled) => {
        if (disabled) {
          input2 && setAttribute2(input2, "disabled", "");
        } else {
          input2 && removeAttribute(input2, "disabled");
        }
      });
      this.querySelectorAll("button:not([popover] button)").forEach((button2) => {
        setAttribute2(button2, "tabindex", "-1");
        setAttribute2(button2, "aria-controls", listId);
        setAttribute2(button2, "aria-haspopup", "listbox");
        linkExpandedStateToPopover(button2, this._popoverable);
        on(button2, "click", () => {
          this._popoverable.toggle();
          input2.focus();
        });
      });
      handleInputClearing(this, input2, this._selectable, this._popoverable);
      initPopover(this, input2, popover, this._popoverable, this._anchorable);
      linkExpandedStateToPopover(input2, this._popoverable);
      preventInputEventsFromBubblingToSelectRoot(input2);
      highlightInputContentsWhenFocused(input2);
      this._filterable && filterResultsByInput(input2, this._filterable);
      trackActiveDescendant(input2, this._activatable);
      controlPopoverWithInput(input2, this._popoverable);
      controlPopoverWithKeyboard(input2, this._popoverable, this._activatable, this._selectable);
      openPopoverWithMouse(input2, this._popoverable);
      handleKeyboardNavigation(input2, this._activatable);
      handleKeyboardSelection(this, input2, this._activatable);
      handleMouseSelection(this, this._activatable);
      controlActivationWithPopover(this._popoverable, this._activatable, this._selectable);
      handlePopoverClosing(this, this._selectable, this._popoverable, multiple);
    } else if (this.querySelector("[popover]") && this.querySelector("[popover] input")) {
      let button2;
      if (CSS.supports("selector(&)")) {
        button2 = this.querySelector("button:not(& [popover] button)");
      } else {
        button2 = this.querySelector("button:not([popover] button)");
      }
      let input2 = this.querySelector("[popover] input");
      let popover = this.querySelector("[popover]");
      setAttribute2(button2, "role", "combobox");
      setAttribute2(input2, "role", "combobox");
      setAttribute2(button2, "aria-controls", listId);
      this._disableable.onInitAndChange((disabled) => {
        if (disabled) {
          button2 && setAttribute2(button2, "disabled", "");
          input2 && setAttribute2(input2, "disabled", "");
        } else {
          button2 && removeAttribute(button2, "disabled");
          input2 && removeAttribute(input2, "disabled");
        }
      });
      this._popoverable = new Popoverable(popover);
      this._anchorable = new Anchorable(popover, {
        reference: button2,
        matchWidth: true,
        position: this.hasAttribute("position") ? this.getAttribute("position") : void 0,
        gap: this.hasAttribute("gap") ? this.getAttribute("gap") : void 0,
        offset: this.hasAttribute("offset") ? this.getAttribute("offset") : void 0
      });
      preventInputEventsFromBubblingToSelectRoot(input2);
      highlightInputContentsWhenFocused(input2);
      this._filterable && filterResultsByInput(input2, this._filterable);
      focusInputWhenPopoverOpens(button2, input2, this._popoverable);
      initPopover(this, button2, popover, this._popoverable, this._anchorable);
      linkExpandedStateToPopover(button2, this._popoverable);
      handleInputClearing(this, input2, this._selectable, this._popoverable);
      controlPopoverWithKeyboard(button2, this._popoverable, this._activatable, this._selectable);
      togglePopoverWithMouse(button2, this._popoverable);
      handleKeyboardNavigation(input2, this._activatable);
      handleKeyboardSelection(this, input2, this._activatable);
      handleMouseSelection(this, this._activatable);
      controlActivationWithPopover(this._popoverable, this._activatable, this._selectable);
      handlePopoverClosing(this, this._selectable, this._popoverable, multiple);
    } else if (this.querySelector("[popover]")) {
      let button2 = this.querySelector("button:not([popover] button)");
      let popover = this.querySelector("[popover]");
      setAttribute2(button2, "role", "combobox");
      setAttribute2(button2, "aria-controls", listId);
      this._disableable.onInitAndChange((disabled) => {
        if (disabled) {
          button2 && setAttribute2(button2, "disabled", "");
          input && setAttribute2(input, "disabled", "");
        } else {
          button2 && removeAttribute(button2, "disabled");
          input && removeAttribute(input, "disabled");
        }
      });
      this._popoverable = new Popoverable(popover);
      this._anchorable = new Anchorable(popover, {
        reference: button2,
        matchWidth: true,
        position: this.hasAttribute("position") ? this.getAttribute("position") : void 0,
        gap: this.hasAttribute("gap") ? this.getAttribute("gap") : void 0,
        offset: this.hasAttribute("offset") ? this.getAttribute("offset") : void 0
      });
      initPopover(this, button2, popover, this._popoverable, this._anchorable);
      linkExpandedStateToPopover(button2, this._popoverable);
      controlPopoverWithKeyboard(button2, this._popoverable, this._activatable, this._selectable);
      togglePopoverWithMouse(button2, this._popoverable);
      handleKeyboardNavigation(button2, this._activatable);
      handleKeyboardSelection(this, button2, this._activatable);
      handleMouseSelection(this, this._activatable);
      controlActivationWithPopover(this._popoverable, this._activatable, this._selectable);
      handlePopoverClosing(this, this._selectable, this._popoverable, multiple);
    }
    let observer = new MutationObserver((mutations) => {
      setTimeout(() => {
        if (!this._popoverable || this._popoverable.getState()) {
          let firstSelectedOption = this._selectable.selecteds()[0]?.el;
          queueMicrotask(() => {
            this._activatable.activateSelectedOrFirst(firstSelectedOption);
          });
        } else {
          this._activatable.clearActive();
        }
      });
    });
    observer.observe(list, { childList: true });
  }
  button() {
    return this.querySelector("button:has(+ [popover])");
  }
  trigger() {
    return this.querySelector("input, button");
  }
  input() {
    return this.querySelector("input");
  }
  list() {
    return this.querySelector("ui-options") || this;
  }
  overlay() {
    return this.querySelector("[popover]");
  }
  clear() {
    if (!this.input()) return;
    this.input().value = "";
    this.input().dispatchEvent(new Event("input", { bubbles: false }));
  }
  open() {
    this._popoverable.setState(true);
  }
  close() {
    this._popoverable.setState(false);
  }
  deselectLast() {
    if (!this.hasAttribute("multiple") && this.value !== null) {
      this.value = null;
      this.dispatchEvent(new Event("input", { bubbles: false }));
      this.dispatchEvent(new Event("change", { bubbles: false }));
    }
    if (this.hasAttribute("multiple") && this.value.length !== 0) {
      this.value = this.value.slice(0, -1);
      this.dispatchEvent(new Event("input", { bubbles: false }));
      this.dispatchEvent(new Event("change", { bubbles: false }));
    }
  }
};
var UIEmpty = class extends UIElement {
  boot() {
    setAttribute2(this, "data-hidden", "");
  }
  mount() {
    queueMicrotask(() => {
      let picker = this.closest("ui-autocomplete, ui-combobox, ui-select");
      let list = this.closest("ui-options");
      if (!list) return;
      let isHidden = (el) => getComputedStyle(el).display === "none";
      let refresh = () => {
        let empty;
        if (CSS.supports("selector(&)")) {
          empty = Array.from(list.querySelectorAll("& > ui-option")).filter((i) => !isHidden(i)).length === 0;
        } else {
          empty = Array.from(list.querySelectorAll(":scope > ui-option")).filter((i) => !isHidden(i)).length === 0;
        }
        if (empty) {
          removeAttribute(this, "data-hidden");
        } else {
          setAttribute2(this, "data-hidden", "");
        }
      };
      refresh();
      let filterable = picker._filterable;
      if (filterable) {
        filterable.onChange(refresh);
      }
      let observer = new MutationObserver((mutations) => {
        setTimeout(() => refresh());
      });
      observer.observe(list, { childList: true });
    });
  }
};
element("selected", UISelected);
element("select", UISelect);
element("empty", UIEmpty);
inject(({ css }) => css`ui-select { display: block; }`);
inject(({ css }) => css`ui-selected-option { display: contents; }`);
inject(({ css }) => css`ui-empty { display: block; cursor: default; }`);
function handleKeyboardNavigation(el, activatable) {
  on(el, "keydown", (e) => {
    if (!["ArrowDown", "ArrowUp", "Escape"].includes(e.key)) return;
    if (e.key === "ArrowDown") {
      activatable.activateNext();
      e.preventDefault();
      e.stopPropagation();
    } else if (e.key === "ArrowUp") {
      activatable.activatePrev();
      e.preventDefault();
      e.stopPropagation();
    }
  });
}
function handleKeyboardSelection(root, el, activatable) {
  on(el, "keydown", (e) => {
    if (e.key === "Enter") {
      let activeEl = activatable.getActive();
      e.preventDefault();
      e.stopPropagation();
      if (!activeEl) return;
      activeEl.click();
      root.dispatchEvent(new CustomEvent("action", {
        bubbles: false,
        cancelable: false
      }));
    }
  });
}
function handleMouseSelection(root, activatable, pointerdown = false) {
  on(root, pointerdown ? "pointerdown" : "click", (e) => {
    if (e.target.closest("ui-option")) {
      let option = e.target.closest("ui-option");
      if (option._disabled) return;
      option._selectable?.trigger();
      root.dispatchEvent(new CustomEvent("action", {
        bubbles: false,
        cancelable: false
      }));
      e.preventDefault();
      e.stopPropagation();
    }
  });
}
function handleActivationOnFocus(el, activatable, selectable) {
  on(el, "focus", () => {
    let firstSelectedOption = selectable.selecteds()[0]?.el;
    activatable.activateSelectedOrFirst(firstSelectedOption);
  });
  on(el, "blur", () => {
    activatable.clearActive();
  });
}
function initListbox(el) {
  let listId = assignId(el, "options");
  setAttribute2(el, "role", "listbox");
  return listId;
}
function linkExpandedStateToPopover(el, popoverable) {
  setAttribute2(el, "aria-haspopup", "listbox");
  let refreshPopover = () => {
    setAttribute2(el, "aria-expanded", popoverable.getState() ? "true" : "false");
    popoverable.getState() ? setAttribute2(el, "data-open", "") : removeAttribute(el, "data-open", "");
  };
  popoverable.onChange(() => {
    refreshPopover();
  });
  refreshPopover();
}
function initPopover(root, trigger, popover, popoverable, anchorable) {
  let refreshPopover = () => {
    Array.from([root, popover]).forEach((i) => {
      popoverable.getState() ? setAttribute2(i, "data-open", "") : removeAttribute(i, "data-open", "");
    });
    popoverable.getState() && anchorable.reposition();
  };
  popoverable.onChange(() => refreshPopover());
  refreshPopover();
  popoverable.onChange(() => {
    if (popoverable.getState()) {
      root.dispatchEvent(new Event("open", {
        bubbles: false,
        cancelable: false
      }));
    } else {
      root.dispatchEvent(new Event("close", {
        bubbles: false,
        cancelable: false
      }));
    }
  });
}
function controlActivationWithPopover(popoverable, activatable, selectable) {
  popoverable.onChange(() => {
    if (popoverable.getState()) {
      let firstSelectedOption = selectable.selecteds()[0]?.el;
      queueMicrotask(() => {
        activatable.activateSelectedOrFirst(firstSelectedOption);
      });
    } else {
      activatable.clearActive();
    }
  });
}
function controlPopoverWithKeyboard(button, popoverable, activatable, selectable) {
  on(button, "keydown", (e) => {
    if (!["ArrowDown", "ArrowUp", "Escape"].includes(e.key)) return;
    if (e.key === "ArrowDown") {
      if (!popoverable.getState()) {
        popoverable.setState(true);
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    } else if (e.key === "ArrowUp") {
      if (!popoverable.getState()) {
        popoverable.setState(true);
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    } else if (e.key === "Escape") {
      if (popoverable.getState()) {
        popoverable.setState(false);
      }
    }
  });
}
function openPopoverWithMouse(el, popoverable) {
  on(el, "click", () => {
    if (!popoverable.getState()) {
      popoverable.setState(true);
      el.focus();
    }
  });
}
function togglePopoverWithMouse(button, popoverable) {
  on(button, "click", () => {
    popoverable.setState(!popoverable.getState());
    button.focus();
  });
}
function focusInputWhenPopoverOpens(button, input, popoverable) {
  popoverable.onChange(() => {
    if (popoverable.getState()) {
      setTimeout(() => input.focus());
    }
  });
}
function filterResultsByInput(input, filterable) {
  filterable && on(input, "input", (e) => {
    filterable.filter(e.target.value);
  });
}
function highlightInputContentsWhenFocused(input) {
  on(input, "focus", () => input.select());
}
function preventInputEventsFromBubblingToSelectRoot(input) {
  on(input, "change", (e) => e.stopPropagation());
  on(input, "input", (e) => e.stopPropagation());
}
function controlPopoverWithInput(input, popoverable) {
  on(input, "keydown", (e) => {
    if (/^[a-zA-Z0-9]$/.test(e.key) || e.key === "Backspace") {
      popoverable.getState() || popoverable.setState(true);
    }
  });
}
function handleInputClearing(root, input, selectable, popoverable) {
  let shouldClear = root.hasAttribute("clear");
  if (!shouldClear) return;
  let setInputValue = (value) => {
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: false }));
  };
  let clear = root.getAttribute("clear");
  let clearOnAction = clear === "" || clear.split(" ").includes("action");
  let clearOnSelect = clear === "" || clear.split(" ").includes("select");
  let clearOnClose = clear === "" || clear.split(" ").includes("close");
  let clearOnEsc = clear === "" || clear.split(" ").includes("esc");
  if (clear === "none") clearOnAction = clearOnSelect = clearOnClose = clearOnEsc = false;
  if (clearOnAction) {
    root.addEventListener("action", (e) => {
      setInputValue("");
    });
  } else if (clearOnSelect) {
    selectable.onChange(() => {
      queueMicrotask(() => setInputValue(""));
    });
  }
  if (clearOnClose) {
    popoverable.onChange(() => {
      if (!popoverable.getState()) {
        setInputValue("");
      }
    });
  }
  if (clearOnEsc) {
    on(input, "keydown", (e) => {
      if (e.key === "Escape") {
        setInputValue("");
      }
    });
  }
}
function handlePopoverClosing(root, selectable, popoverable, multiple) {
  let closeOnAction = !multiple;
  let closeOnSelect = !multiple;
  if (root.hasAttribute("close")) {
    let close = root.getAttribute("close");
    closeOnAction = close === "" || close.split(" ").includes("action");
    closeOnSelect = close.split(" ").includes("select");
    if (close === "none") closeOnAction = closeOnSelect = false;
  }
  if (closeOnAction) {
    root.addEventListener("action", (e) => {
      popoverable.setState(false);
    });
  } else if (closeOnSelect) {
    selectable.onChange(() => {
      popoverable.setState(false);
    });
  }
}
function trackActiveDescendant(input, activatable) {
  activatable.onChange(() => {
    let activeEl = activatable.getActive();
    activeEl ? setAttribute2(input, "aria-activedescendant", activeEl.id) : removeAttribute(input, "aria-activedescendant");
  });
}
function handleAutocomplete(autocomplete, isStrict, root, input, selectable, popoverable) {
  if (!autocomplete) {
    setAttribute2(input, "autocomplete", "off");
    setAttribute2(input, "aria-autocomplete", "none");
    return;
  }
  let setInputValue = (value) => {
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: false }));
  };
  setAttribute2(input, "autocomplete", "off");
  setAttribute2(input, "aria-autocomplete", "list");
  queueMicrotask(() => {
    selectable.onInitAndChange(() => {
      input.value = selectable.selectedTextValue();
    });
  });
  root.addEventListener("action", (e) => {
    setInputValue(selectable.selectedTextValue());
  });
  if (isStrict) {
    popoverable.onChange(() => {
      if (!popoverable.getState()) {
        setInputValue(selectable.selectedTextValue());
      }
    });
  }
}

// js/switch.js
var UISwitch = class extends UIControl {
  boot() {
    let button = this;
    this._disableable = new Disableable(this);
    this._selectable = new Selectable(button, {
      toggleable: true,
      dataAttr: "data-checked",
      ariaAttr: "aria-checked",
      value: this.hasAttribute("value") ? this.getAttribute("value") : null,
      label: this.hasAttribute("label") ? this.getAttribute("label") : null,
      selectedInitially: this.hasAttribute("checked")
    });
    this.value = this._selectable.getValue();
    this._detangled = detangle();
    this._selectable.onChange(this._detangled(() => {
      this.dispatchEvent(new Event("input", { bubbles: false, cancelable: true }));
      this.dispatchEvent(new Event("change", { bubbles: false, cancelable: true }));
    }));
    setAttribute2(button, "role", "switch");
    if (this.hasAttribute("name")) {
      let name = this.getAttribute("name");
      let input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = this._selectable.getState();
      this.appendChild(input);
      this._selectable.onChange(() => {
        input.value = this._selectable.getState();
      });
    }
    this._disableable.onInitAndChange((disabled) => {
      disabled ? removeAttribute(button, "tabindex", "0") : setAttribute2(button, "tabindex", "0");
    });
    on(button, "click", this._disableable.disabled((e) => {
      e.preventDefault();
      e.stopPropagation();
    }), { capture: true });
    on(button, "click", this._disableable.enabled((e) => {
      this._selectable.press();
    }));
    on(button, "keydown", this._disableable.enabled((e) => {
      if (e.key === "Enter") {
        this._selectable.press();
        e.preventDefault();
        e.stopPropagation();
      }
    }));
    on(button, "keydown", this._disableable.enabled((e) => {
      if (e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
      }
    }));
    on(button, "keyup", this._disableable.enabled((e) => {
      if (e.key === " ") {
        this._selectable.press();
        e.preventDefault();
        e.stopPropagation();
      }
    }));
    respondToLabelClick2(button);
  }
  get checked() {
    return this._selectable.isSelected();
  }
  set checked(value) {
    this._detangled(() => {
      value ? this._selectable.select() : this._selectable.deselect();
    })();
  }
};
function respondToLabelClick2(el) {
  el.closest("label")?.addEventListener("click", (e) => {
    if (!el.contains(e.target)) {
      el.click();
    }
  });
}
inject(({ css }) => css`ui-switch { display: inline-block; user-select: none; }`);
element("switch", UISwitch);

// js/field.js
var UIField = class _UIField extends UIElement {
  mount() {
    this.control = this.fieldWalker().find((el) => this.isControl(el));
    if (this.control && !(this.control instanceof UIControl) && this.hasAttribute("disabled")) {
      this.control.setAttribute("disabled", "");
    }
  }
  associateLabel(label) {
    on(label, "click", (e) => {
      if (["a", "button"].includes(e.target.localName)) return;
      this.focusOrTogggle(this.control);
    });
    setAttribute2(this.elOrButton(this.control), "aria-labelledby", label.id);
  }
  associateDescription(description) {
    setAttribute2(this.elOrButton(this.control), "aria-describedby", description.id);
  }
  fieldWalker() {
    return walker(this, (el, { skip, reject }) => {
      if (el instanceof _UIField && el !== this) return reject();
    });
  }
  isControl(el) {
    if (el instanceof UIControl) return true;
    if (el.matches("input, textarea, select")) return true;
    return false;
  }
  focusOrTogggle(control) {
    if (!control) return;
    if (control.disabled || control.hasAttribute("disabled")) return;
    let isCheckable = control.localName === "input" && ["checkbox", "radio"].includes(control.type) || ["ui-switch", "ui-radio", "ui-checkbox"].includes(control.localName);
    if (isCheckable) {
      control.click();
      control.focus();
    } else if (control.localName === "input" && ["file"].includes(control.type)) {
      control.click();
    } else if (["ui-select"].includes(control.localName)) {
      control.trigger().focus();
    } else {
      control.focus();
    }
  }
  elOrButton(el) {
    if (el instanceof UIElement && el.firstElementChild instanceof HTMLButtonElement) return el.firstElementChild;
    return el;
  }
};
var UILabel = class extends UIElement {
  mount() {
    assignId(this, "label");
    setAttribute2(this, "aria-hidden", "true");
    this.closest("ui-field")?.associateLabel(this);
  }
};
var UIDescription = class extends UIElement {
  mount() {
    assignId(this, "description");
    setAttribute2(this, "aria-hidden", "true");
    this.closest("ui-field")?.associateDescription(this);
  }
};
inject(({ css }) => css`
    ui-label { display: inline-block; cursor: default; user-select: none; }
    ui-description { display: block; }
`);
element("field", UIField);
element("label", UILabel);
element("description", UIDescription);

// js/mixins/dialogable.js
var Dialogable = class extends Mixin {
  boot({ options }) {
    options({
      clickOutside: true
    });
    this.onChanges = [];
    this.state = false;
    let observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName !== "open") return;
        this.el.hasAttribute("open") ? this.state = true : this.state = false;
      });
      this.onChanges.forEach((i) => i());
    });
    observer.observe(this.el, { attributeFilter: ["open"] });
    if (this.options().clickOutside) {
      this.el.addEventListener("click", (e) => {
        if (e.target !== this.el) return;
        if (clickHappenedOutside(this.el, e)) {
          this.hide();
          e.preventDefault();
          e.stopPropagation();
        }
      });
    }
    if (this.el.hasAttribute("open")) {
      this.state = true;
      this.hide();
      this.show();
    }
  }
  onChange(callback) {
    this.onChanges.push(callback);
  }
  show() {
    this.el.showModal();
  }
  hide() {
    this.el.close();
  }
  getState() {
    return this.state;
  }
  setState(value) {
    value ? this.show() : this.hide();
  }
};
function clickHappenedOutside(el, event) {
  let rect = el.getBoundingClientRect();
  let x = event.clientX;
  let y = event.clientY;
  let isInside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  return !isInside;
}

// js/modal.js
var UIModal = class extends UIElement {
  boot() {
    this._controllable = new Controllable(this, { disabled: this.hasAttribute("disabled") });
    let button = this.button();
    let dialog = this.dialog();
    if (!dialog) return;
    dialog._dialogable = new Dialogable(dialog, {
      clickOutside: !this.hasAttribute("disable-click-outside")
    });
    this._controllable.initial((initial) => initial && dialog._dialogable.show());
    this._controllable.getter(() => dialog._dialogable.getState());
    let detangled = detangle();
    this._controllable.setter(detangled((value) => {
      dialog._dialogable.setState(value);
    }));
    dialog._dialogable.onChange(detangled(() => {
      this._controllable.dispatch();
    }));
    let refresh = () => {
      if (dialog._dialogable.getState()) {
        setAttribute2(this, "data-open", "");
        button?.setAttribute("data-open", "");
        setAttribute2(dialog, "data-open", "");
      } else {
        removeAttribute(this, "data-open");
        button?.removeAttribute("data-open");
        removeAttribute(dialog, "data-open");
      }
    };
    dialog._dialogable.onChange(() => refresh());
    refresh();
    button && on(button, "click", (e) => {
      dialog._dialogable.show();
    });
  }
  button() {
    let button = this.querySelector("button");
    let dialog = this.dialog();
    if (dialog?.contains(button)) return;
    return button;
  }
  dialog() {
    return this.querySelector("dialog");
  }
  showModal() {
    let dialog = this.dialog();
    if (!dialog) return;
    dialog.showModal();
  }
};
var UIClose = class extends UIElement {
  mount() {
    let button = this.querySelector("button");
    on(button, "click", (e) => {
      this.closest("ui-modal")?.dialog()._dialogable.hide();
    });
  }
};
element("modal", UIModal);
element("close", UIClose);

// js/toast.js
var UIToast = class extends UIElement {
  mount() {
    setAttribute2(this, "role", "status");
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hideToast();
      }
    });
  }
  showToast(options = {}) {
    let existingToast = this.template().nextElementSibling;
    if (existingToast) existingToast.destroyToast();
    let duration = Number(options.duration === void 0 ? 5e3 : options.duration);
    let slots = options.slots || {};
    let dataset = options.dataset || {};
    let templateEl = this.querySelector("template");
    if (!templateEl) {
      return console.warn("ui-toast: no template element found", this);
    }
    let template = templateEl.content.cloneNode(true).firstElementChild;
    template.setAttribute("aria-atomic", "true");
    Object.entries(slots).forEach(([key, value]) => {
      if ([null, void 0, false].includes(value)) return;
      template.querySelectorAll(`slot[name="${key}"]`).forEach((i) => {
        i.replaceWith(document.createTextNode(value));
      });
    });
    Object.entries(dataset).forEach(([key, value]) => {
      template.dataset[key] = value;
    });
    template.querySelectorAll("slot").forEach((slot) => slot.remove());
    let show = () => {
      template.showPopover();
    };
    let hide2 = () => {
      template._hiding = true;
      template.hidePopover();
      if (template.getAnimations().length) {
        template.addEventListener("transitionend", () => {
          template.remove();
        }, { once: true });
      } else {
        template.remove();
      }
    };
    this.appendChild(template);
    show();
    template.hideToast = hide2;
    let hideTimeout = duration !== 0 && setTimeout(() => {
      hide2();
    }, duration);
    template.destroyToast = () => {
      hideTimeout && clearTimeout(hideTimeout);
      template.remove();
    };
  }
  hideToast() {
    let toast = this.template().nextElementSibling;
    toast && toast.destroyToast();
  }
  template() {
    return this.querySelector("template");
  }
};
element("toast", UIToast);

// js/radio.js
var UIRadioGroup = class extends UIControl {
  boot() {
    this._selectable = new SelectableGroup(this);
    this._controllable = new Controllable(this, { disabled: this._disabled });
    this._focusable = new FocusableGroup(this, { wrap: true });
    this._controllable.initial((initial) => initial && this._selectable.setState(initial));
    this._controllable.getter(() => this._selectable.getState());
    this._detangled = detangle();
    this._controllable.setter(this._detangled((value) => {
      this._selectable.setState(value);
    }));
    this._selectable.onChange(this._detangled(() => {
      this._controllable.dispatch();
    }));
    on(this, "keydown", (e) => {
      if (["ArrowDown", "ArrowRight"].includes(e.key)) {
        this._focusable.focusNext();
        e.preventDefault();
        e.stopPropagation();
      } else if (["ArrowUp", "ArrowLeft"].includes(e.key)) {
        this._focusable.focusPrev();
        e.preventDefault();
        e.stopPropagation();
      }
    });
    setAttribute2(this, "role", "radiogroup");
  }
};
var UIRadio = class extends UIControl {
  boot() {
    let button = this;
    this._disableable = new Disableable(this);
    this._selectable = new Selectable(button, {
      value: this.hasAttribute("value") ? this.getAttribute("value") : Math.random().toString(36).substring(2, 10),
      label: this.hasAttribute("label") ? this.getAttribute("label") : null,
      selectedInitially: this.hasAttribute("checked"),
      dataAttr: "data-checked",
      ariaAttr: "aria-checked"
    });
    this.value = this._selectable.getValue();
    this._selectable.onChange(() => {
      if (this._selectable.isSelected()) this._focusable.focus(false);
    });
    this._disableable.onChange((disabled) => {
      if (disabled) {
        this._focusable.untabbable();
      } else {
        this._selectable.isSelected() && this._focusable.tabbable();
      }
    });
    setAttribute2(button, "role", "radio");
    this._focusable = new Focusable(button, { disableable: this._disableable, tabbableAttr: "data-active" });
    on(button, "click", this._disableable.disabled((e) => {
      e.preventDefault();
      e.stopPropagation();
    }), { capture: true });
    on(button, "click", this._disableable.enabled((e) => {
      this._selectable.press();
    }));
    on(button, "keydown", this._disableable.enabled((e) => {
      if (e.key === "Enter") {
        this._selectable.press();
        e.preventDefault();
        e.stopPropagation();
      }
    }));
    on(button, "keydown", this._disableable.enabled((e) => {
      if (e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
      }
    }));
    on(button, "keyup", this._disableable.enabled((e) => {
      if (e.key === " ") {
        this._selectable.press();
        e.preventDefault();
        e.stopPropagation();
      }
    }));
    respondToLabelClick3(button);
    on(button, "focus", (e) => {
      isUsingKeyboard() && this._selectable.select();
    });
  }
  get checked() {
    return this._selectable.isSelected();
  }
  set checked(value) {
    let detangled = this.closest("ui-radio-group")?._detangled || (() => {
    });
    detangled(() => {
      value && this._selectable.select();
    })();
  }
};
function respondToLabelClick3(el) {
  el.closest("label")?.addEventListener("click", (e) => {
    if (!el.contains(e.target)) {
      el.click();
    }
  });
}
inject(({ css }) => css`ui-radio-group { display: block; }`);
inject(({ css }) => css`ui-radio { display: inline-block; user-select: none; }`);
element("radio-group", UIRadioGroup);
element("radio", UIRadio);

// js/menu.js
var UIMenu = class _UIMenu extends UIElement {
  boot() {
    this._focusable = new FocusableGroup(this, { wrap: false, ensureTabbable: false });
    on(this, "keydown", (e) => {
      if (["ArrowDown"].includes(e.key)) {
        e.target === this ? this._focusable.focusFirst() : this._focusable.focusNext();
        e.preventDefault();
        e.stopPropagation();
      } else if (["ArrowUp"].includes(e.key)) {
        e.target === this ? this._focusable.focusFirst() : this._focusable.focusPrev();
        e.preventDefault();
        e.stopPropagation();
      }
    });
    search(this, (query) => this._focusable.focusBySearch(query));
    if (this.hasAttribute("popover")) {
      this.addEventListener("lofi-close-popovers", () => {
        setTimeout(() => this.hidePopover(), 50);
      });
    }
    if (this.parentElement.localName === "ui-dropdown") {
      let dropdown = this.parentElement;
      on(dropdown.trigger(), "keydown", (e) => {
        if (e.key === "ArrowDown") {
          this.fromArrowDown = true;
          this.showPopover();
          e.preventDefault();
          e.stopPropagation();
        }
      });
    }
    setAttribute2(this, "role", "menu");
    setAttribute2(this, "tabindex", "-1");
  }
  mount() {
    this.initializeMenuItems();
    let observer = new MutationObserver((mutations) => {
      this.initializeMenuItems();
    });
    observer.observe(this, { childList: true, subtree: true });
  }
  onPopoverShow() {
    queueMicrotask(() => {
      if (this.fromArrowDown) {
        this._focusable.focusFirst();
        this.fromArrowDown = false;
      } else {
        this.focus();
      }
    });
  }
  onPopoverHide() {
    this._focusable.wipeTabbables();
  }
  initializeMenuItems() {
    this.walker().each((el) => {
      if (el._disableable) return;
      initializeMenuItem(el);
    });
  }
  walker() {
    return walker(this, (el, { skip, reject }) => {
      if (el instanceof _UIMenu) return reject();
      if (el instanceof UISelect) return reject();
      if (!["a", "button"].includes(el.localName)) return skip();
    });
  }
};
var UISubmenu = class extends UIElement {
  boot() {
  }
};
var UIMenuCheckbox = class extends UIElement {
  boot() {
    this._disabled = this.hasAttribute("disabled");
    this._disableable = new Disableable(this);
    let button = this;
    if (this._disabled) {
      setAttribute2(button, "disabled", "");
      setAttribute2(button, "aria-disabled", "true");
    }
    let id = assignId(button, "menu-checkbox");
    setAttribute2(button, "role", "menuitemcheckbox");
    if (this._disabled) return;
    button._focusable = new Focusable(button, { disableable: this._disableable, hover: true, tabbableAttr: "data-active" });
    button._selectable = new Selectable(button, {
      toggleable: true,
      value: this.hasAttribute("value") ? this.getAttribute("value") : button.textContent.trim(),
      label: this.hasAttribute("label") ? this.getAttribute("label") : button.textContent.trim(),
      dataAttr: "data-checked",
      ariaAttr: "aria-checked",
      selectedInitially: this.hasAttribute("checked")
    });
    this._controllable = new Controllable(this);
    this._controllable.initial((initial) => initial && button._selectable.setState(initial));
    this._controllable.getter(() => button._selectable.getState());
    let detangled = detangle();
    this._controllable.setter(detangled((value) => {
      this._selectable.setState(value);
    }));
    this._selectable.onChange(detangled(() => {
      this._controllable.dispatch();
    }));
    on(button, "click", () => {
      this.dispatchEvent(new CustomEvent("lofi-close-popovers", { bubbles: true }));
      button._selectable.press();
    });
    respondToKeyboardClick(button);
  }
};
var UIMenuRadio = class extends UIElement {
  boot() {
    this._disabled = this.hasAttribute("disabled");
    this._disableable = new Disableable(this);
    let button = this;
    if (this._disabled) {
      setAttribute2(button, "disabled", "");
      setAttribute2(button, "aria-disabled", "true");
    }
    let id = assignId(button, "menu-radio");
    setAttribute2(button, "role", "menuitemradio");
    if (this._disabled) return;
    button._focusable = new Focusable(button, { disableable: this._disableable, hover: true, tabbableAttr: "data-active" });
    button._selectable = new Selectable(button, {
      toggleable: false,
      value: this.hasAttribute("value") ? this.getAttribute("value") : button.textContent.trim(),
      label: this.hasAttribute("label") ? this.getAttribute("label") : button.textContent.trim(),
      dataAttr: "data-checked",
      ariaAttr: "aria-checked",
      selectedInitially: this.hasAttribute("checked")
    });
    on(button, "click", () => {
      this.dispatchEvent(new CustomEvent("lofi-close-popovers", { bubbles: true }));
      button._selectable.press();
    });
    respondToKeyboardClick(button);
  }
};
var UIMenuRadioGroup = class extends UIElement {
  boot() {
    this._selectable = new SelectableGroup(this);
    this._controllable = new Controllable(this);
    setAttribute2(this, "role", "group");
    this._controllable.initial((initial) => initial && this._selectable.setState(initial));
    this._controllable.getter(() => this._selectable.getState());
    let detangled = detangle();
    this._controllable.setter(detangled((value) => {
      this._selectable.setState(value);
    }));
    this._selectable.onChange(detangled(() => {
      this._controllable.dispatch();
    }));
  }
};
var UIMenuCheckboxGroup = class extends UIElement {
  boot() {
    this._selectable = new SelectableGroup(this, { multiple: true });
    this._controllable = new Controllable(this);
    setAttribute2(this, "role", "group");
    this._controllable.initial((initial) => initial && this._selectable.setState(initial));
    this._controllable.getter(() => this._selectable.getState());
    let detangled = detangle();
    this._controllable.setter(detangled((value) => {
      this._selectable.setState(value);
    }));
    this._selectable.onChange(detangled(() => {
      this._controllable.dispatch();
    }));
  }
};
inject(({ css }) => css`ui-menu[popover]:popover-open { display: block; }`);
inject(({ css }) => css`ui-menu[popover].\:popover-open { display: block; }`);
inject(({ css }) => css`ui-menu-checkbox, ui-menu-radio { cursor: default; display: contents; }`);
element("menu", UIMenu);
element("submenu", UISubmenu);
element("menu-checkbox", UIMenuCheckbox);
element("menu-radio", UIMenuRadio);
element("menu-radio-group", UIMenuRadioGroup);
element("menu-checkbox-group", UIMenuCheckboxGroup);
function respondToKeyboardClick(el) {
  on(el, "keydown", (e) => {
    if (e.key === "Enter") {
      el.click();
      e.preventDefault();
      e.stopPropagation();
    }
  });
  on(el, "keydown", (e) => {
    if (e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
    }
  });
  on(el, "keyup", (e) => {
    if (e.key === " ") {
      el.click();
      e.preventDefault();
      e.stopPropagation();
    }
  });
}
function initializeMenuItem(el) {
  el._disableable = new Disableable(el);
  el._disabled = el.hasAttribute("disabled");
  let link = el.querySelector("a");
  let button = el;
  let submenu = el.parentElement.matches("ui-submenu") && el.parentElement.querySelector("ui-menu[popover]");
  let target = link || button;
  if (el._disabled) {
    setAttribute2(target, "disabled", "");
    setAttribute2(target, "aria-disabled", "true");
  }
  let id = assignId(target, "menu-item");
  setAttribute2(target, "role", "menuitem");
  if (el._disabled) return;
  target._focusable = new Focusable(target, { disableable: el._disableable, hover: true, tabbableAttr: "data-active" });
  if (!submenu) {
    el.hasAttribute("disabled") || on(el, "click", () => {
      el.dispatchEvent(new CustomEvent("lofi-close-popovers", { bubbles: true }));
    });
    respondToKeyboardClick(button);
  } else {
    submenu._popoverable = new Popoverable(submenu, { trigger: button });
    submenu._anchorable = new Anchorable(submenu, {
      reference: button,
      position: submenu.hasAttribute("position") ? submenu.getAttribute("position") : "right start",
      gap: submenu.hasAttribute("gap") ? submenu.getAttribute("gap") : "-5"
    });
    button.addEventListener("click", (e) => {
      submenu._popoverable.setState(true);
    });
    let { clear } = interest(button, submenu, {
      gain() {
        submenu._popoverable.setState(true);
      },
      lose() {
        submenu._popoverable.setState(false);
      },
      focusable: false
    });
    submenu._popoverable.onChange(() => {
      if (!submenu._popoverable.getState()) {
        clear();
        submenu._focusable.wipeTabbables();
      }
      submenu._anchorable.reposition();
    });
    on(button, "keydown", (e) => {
      if (e.key === "Enter") {
        submenu._popoverable.setState(true);
        setTimeout(() => submenu._focusable.focusFirst());
      }
    });
    on(button, "keydown", (e) => {
      if (e.key === "ArrowRight") {
        submenu._popoverable.setState(true);
        setTimeout(() => submenu._focusable.focusFirst());
      }
    });
    on(submenu, "keydown", (e) => {
      if (e.key === "ArrowLeft") {
        submenu._popoverable.setState(false);
        button.focus();
        e.stopPropagation();
      }
    });
  }
}

// js/tabs.js
var UITabGroup = class _UITabGroup extends UIElement {
  boot() {
    this._disabled = this.hasAttribute("disabled");
  }
  mount() {
    this.walkPanels((el) => initializePanel(el));
  }
  showPanel(name) {
    this.walkPanels((el) => {
      if (el.getAttribute("name") === name) el.show();
      else el.hide();
    });
  }
  getPanel(name) {
    return this.walkPanels((el, bail) => {
      if (el.getAttribute("name") === name) {
        bail(el);
      }
    });
  }
  walkPanels(callback) {
    let bailed = false;
    let bailedReturn;
    for (let child of this.children) {
      if (child instanceof _UITabGroup) continue;
      if (child instanceof UITabs) continue;
      callback(child, (forward) => {
        bailed = true;
        bailedReturn = forward;
      });
      if (bailed) break;
    }
    return bailedReturn;
  }
};
var UITabs = class _UITabs extends UIControl {
  boot() {
    this._focusable = new FocusableGroup(this, { wrap: true });
    this._selectableGroup = new SelectableGroup(this);
    this._controllable = new Controllable(this, { disabled: this._disabled });
    this._controllable.initial((initial) => initial && this._selectableGroup.setState(initial));
    this._controllable.getter(() => this._selectableGroup.getState());
    let detangled = detangle();
    this._controllable.setter(detangled((value) => {
      this._selectableGroup.setState(value);
    }));
    this._selectableGroup.onChange(detangled(() => {
      this._controllable.dispatch();
    }));
    on(this, "keydown", (e) => {
      if (["ArrowDown", "ArrowRight"].includes(e.key)) {
        this._focusable.focusNext();
        e.preventDefault();
        e.stopPropagation();
      } else if (["ArrowUp", "ArrowLeft"].includes(e.key)) {
        this._focusable.focusPrev();
        e.preventDefault();
        e.stopPropagation();
      }
    });
    setAttribute2(this, "role", "tablist");
  }
  mount() {
    this.initializeTabs();
    this._focusable.ensureTabbable();
    if (!this._selectableGroup.getState()) {
      this._selectableGroup.selectFirst();
    }
  }
  initializeTabs() {
    this.walker().each((el) => {
      if (el._disableable) return;
      initializeTab(el);
    });
  }
  walker() {
    return walker(this, (el, { skip, reject }) => {
      if (el instanceof UITabGroup) return reject();
      if (el instanceof _UITabs) return reject();
      if (!["a", "button"].includes(el.localName)) return skip();
    });
  }
};
function initializeTab(el) {
  el._disableable = new Disableable(el);
  el._disabled = el.hasAttribute("disabled");
  let link = el.matches("a") ? el : null;
  let target = link || el;
  if (el._disabled) {
    setAttribute2(target, "disabled", "");
    setAttribute2(target, "aria-disabled", "true");
  }
  let id = assignId(target, "tab");
  setAttribute2(target, "role", "tab");
  if (el._disabled) return;
  target._focusable = new Focusable(target, { disableable: el._disableable, tabbableAttr: "data-active" });
  if (!link) {
    let panel = el.getAttribute("name");
    el._selectable = new Selectable(el, {
      value: panel || Math.random().toString(36).substring(2, 10),
      label: el.hasAttribute("label") ? el.getAttribute("label") : el.textContent.trim(),
      selectedInitially: el.hasAttribute("selected"),
      toggleable: false
    });
    on(el, "click", () => el._selectable.press());
    el._selectable.onChange(() => {
      let panelEl = el.closest("ui-tab-group")?.getPanel(panel);
      el._selectable.getState() ? panelEl?.show() : panelEl?.hide();
      if (el._selectable.getState()) {
        el._focusable.focus(false);
      }
    });
    if (!el.closest("ui-tab-group")?.hasAttribute("manual")) {
      on(el, "focus", () => el._selectable.select());
    }
    queueMicrotask(() => {
      let container = el.closest("ui-tab-group");
      if (!container) return;
      let panelEl = container.getPanel(panel);
      if (!panelEl) throw new Error("Could not find panel...");
      setAttribute2(el, "aria-controls", panelEl.id);
      setAttribute2(panelEl, "aria-labelledby", el.id);
    });
  }
}
function initializePanel(el) {
  assignId(el, "tab-panel");
  setAttribute2(el, "role", "tabpanel");
  el.hasAttribute("tabindex") || setAttribute2(el, "tabindex", "-1");
  el.show = () => {
    setAttribute2(el, "data-selected", "");
    setAttribute2(el, "tabindex", "0");
  };
  el.hide = () => {
    removeAttribute(el, "data-selected");
    setAttribute2(el, "tabindex", "-1");
  };
}
inject(({ css }) => css`ui-tab-group, ui-tabs { display: block; cursor: default; }`);
element("tab-group", UITabGroup);
element("tabs", UITabs);

// js/index.js
if (!isSupported2() && !isPolyfilled()) {
  apply2();
}
