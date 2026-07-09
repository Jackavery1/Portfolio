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
    expect(initialiserScrollChampClavier(null)).toEqual(expect.any(Function));
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

  it('scroll vers le haut si le champ est trop haut', async () => {
    window.visualViewport = {
      height: 400,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    const nom = document.getElementById('nom');
    nom.getBoundingClientRect = () => ({
      top: 4,
      bottom: 30,
      left: 0,
      right: 100,
      width: 100,
      height: 26,
    });

    desinscrire = initialiserScrollChampClavier(document.getElementById('f'));
    nom.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(window.scrollBy).toHaveBeenCalledWith({
      top: -12,
      behavior: 'smooth',
    });
  });

  it('ignore le focus hors champs éditables', async () => {
    window.visualViewport = {
      height: 400,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    document.body.innerHTML += '<button id="btn">ok</button>';
    desinscrire = initialiserScrollChampClavier(document.getElementById('f'));
    document.getElementById('btn').dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(window.scrollBy).not.toHaveBeenCalled();
  });
});
