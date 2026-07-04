/* @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initialiserScrollChampClavier } from './visual-viewport.js';

describe('visual-viewport', () => {
  let desinscrire;

  beforeEach(() => {
    document.body.innerHTML = `
      <form id="f">
        <input id="nom" />
        <textarea id="msg"></textarea>
      </form>
    `;
    window.scrollBy = vi.fn();
  });

  afterEach(() => {
    desinscrire?.();
    desinscrire = undefined;
    delete window.visualViewport;
  });

  it('ne fait rien sans visualViewport', () => {
    const form = document.getElementById('f');
    expect(initialiserScrollChampClavier(form)).toBeTypeOf('function');
    form.querySelector('#nom').focus();
    expect(window.scrollBy).not.toHaveBeenCalled();
  });

  it('scroll vers le bas si le champ dépasse visualViewport', async () => {
    const resizeHandlers = [];
    window.visualViewport = {
      height: 400,
      addEventListener: (evt, fn) => {
        if (evt === 'resize') resizeHandlers.push(fn);
      },
      removeEventListener: (evt, fn) => {
        if (evt === 'resize') {
          const idx = resizeHandlers.indexOf(fn);
          if (idx >= 0) resizeHandlers.splice(idx, 1);
        }
      },
    };

    const msg = document.getElementById('msg');
    msg.getBoundingClientRect = () => ({
      top: 350,
      bottom: 430,
      left: 0,
      right: 100,
      width: 100,
      height: 80,
    });

    desinscrire = initialiserScrollChampClavier(document.getElementById('f'));
    document.getElementById('msg').dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(window.scrollBy).toHaveBeenCalledWith({
      top: 46,
      behavior: 'smooth',
    });
  });
});
