/* @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import { elementsFocusablesModale, piegerTabulationModale } from './focus.js';

function rendreFocusable(el) {
  Object.defineProperty(el, 'offsetParent', {
    value: document.body,
    configurable: true,
  });
}

describe('focus', () => {
  it('liste les éléments focusables visibles', () => {
    document.body.innerHTML = `
      <div id="modal">
        <button type="button">Fermer</button>
        <a href="#">Lien</a>
        <button disabled type="button">Off</button>
      </div>
    `;
    const modal = document.getElementById('modal');
    modal.querySelectorAll('button:not([disabled]), a[href]').forEach(rendreFocusable);
    const list = elementsFocusablesModale(modal);
    expect(list).toHaveLength(2);
  });

  it('piège Tab du dernier au premier élément', () => {
    document.body.innerHTML = `
      <div id="modal">
        <button type="button" id="b1">Un</button>
        <button type="button" id="b2">Deux</button>
      </div>
    `;
    const modal = document.getElementById('modal');
    modal.querySelectorAll('button').forEach(rendreFocusable);
    const b1 = document.getElementById('b1');
    const b2 = document.getElementById('b2');
    b2.focus();
    let prevented = false;
    piegerTabulationModale(
      {
        key: 'Tab',
        shiftKey: false,
        preventDefault: () => {
          prevented = true;
        },
      },
      modal
    );
    expect(prevented).toBe(true);
    expect(document.activeElement).toBe(b1);
  });

  it('ignore les touches autres que Tab', () => {
    const result = piegerTabulationModale({ key: 'Escape' }, document.body);
    expect(result).toBe(false);
  });

  it('piège Shift+Tab du premier au dernier élément', () => {
    document.body.innerHTML = `
      <div id="modal">
        <button type="button" id="b1">Un</button>
        <button type="button" id="b2">Deux</button>
      </div>
    `;
    const modal = document.getElementById('modal');
    modal.querySelectorAll('button').forEach(rendreFocusable);
    const b1 = document.getElementById('b1');
    const b2 = document.getElementById('b2');
    b1.focus();
    let prevented = false;
    piegerTabulationModale(
      {
        key: 'Tab',
        shiftKey: true,
        preventDefault: () => {
          prevented = true;
        },
      },
      modal
    );
    expect(prevented).toBe(true);
    expect(document.activeElement).toBe(b2);
  });

  it('concentre le focus sur l’unique élément focusable', () => {
    document.body.innerHTML = `
      <div id="modal">
        <button type="button" id="b1">Un</button>
      </div>
    `;
    const modal = document.getElementById('modal');
    rendreFocusable(document.getElementById('b1'));
    let prevented = false;
    piegerTabulationModale(
      {
        key: 'Tab',
        shiftKey: false,
        preventDefault: () => {
          prevented = true;
        },
      },
      modal
    );
    expect(prevented).toBe(true);
    expect(document.activeElement).toBe(document.getElementById('b1'));
  });
});
