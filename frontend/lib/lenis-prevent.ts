/**
 * Returns true when Lenis should NOT handle wheel/touch on this node —
 * e.g. inside a modal panel or any nested overflow scroll container.
 */
export function shouldBypassLenis(node: HTMLElement): boolean {
  if (node.closest('[data-lenis-prevent]')) return true;

  let el: HTMLElement | null = node;
  while (el && el !== document.documentElement) {
    const { overflowY } = window.getComputedStyle(el);
    const scrollable =
      overflowY === 'auto' ||
      overflowY === 'scroll' ||
      overflowY === 'overlay';

    if (scrollable && el.scrollHeight > el.clientHeight + 1) {
      return true;
    }
    el = el.parentElement;
  }

  return false;
}
