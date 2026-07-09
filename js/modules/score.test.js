import { describe, expect, it } from 'vitest';
import * as score from './score.js';
import * as scoreSession from './score-session.js';
import * as popupHighscore from './popup-highscore.js';

describe('score barrel', () => {
  it('réexporte les fonctions session et popup', () => {
    expect(score.lireScore).toBe(scoreSession.lireScore);
    expect(score.sauvegarderScore).toBe(scoreSession.sauvegarderScore);
    expect(score.afficherScore).toBe(scoreSession.afficherScore);
    expect(score.ajouterScore).toBe(scoreSession.ajouterScore);
    expect(score.accorderBonusProjet).toBe(scoreSession.accorderBonusProjet);
    expect(score.accorderBonusDojoBoss).toBe(scoreSession.accorderBonusDojoBoss);
    expect(score.afficherPopupMeilleurScore).toBe(popupHighscore.afficherPopupMeilleurScore);
    expect(score.initialiserFermeturePopupMeilleurScore).toBe(
      popupHighscore.initialiserFermeturePopupMeilleurScore
    );
  });
});
