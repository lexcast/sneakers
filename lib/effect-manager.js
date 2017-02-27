'use babel';

import {
  CompositeDisposable
} from 'atom';

export default class EffectManager {
  constructor(editor) {
    this.editor = editor;
    this.screenArray = [];
    this.encryptedElements = [];
    this.initialShuffleIterations = 24;
    this.shuffleEachFrame = 36;
    this.ms = 41;
    this.hasStopped = false;
    this.chars = "○◘◙•♂♀☼▲►▼◄↨↕↔¶¡‼§▬↑↓←→!\"#$%&'()*+,-./0123456789:;=?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~⌂ÇâäàåáèéêëíîïÄÅÉæÆòóôöùúûüÿÖÜ¢£¥₧ƒñÑªº¿⌐¬¡»«¼½─│┌┐└┘├┤┬┴┼═║╒╓╔╕╖╗╘╙╚╛╜╝╞╟╠╡╢╣╤╥╦╧╨╩╪╫╬▀▄█▌▐■⌠⌡ΓΘΣΦΩαδεπστφ∙√∞∟∩≈≡≤≥";
  }

  run() {
    this.plainText = this.editor.getText();
    this.revealEachFrame = this.plainText.length / 300 * 5;
    this.stage = 0;

    this.initEncryptedElements();
    this.shuffle();
    this.nextStep = this.shuffle;

    this.onWillSave = this.editor.getBuffer().onWillSave(
      this.preventSaveEditor.bind(this)
    );

    this.mainLoop();
  }

  preventSaveEditor() {
    this.editor.setText(this.plainText);
    atom.notifications.addWarning('Take care on save file.');
    this.hasStopped = true;
  }

  mainLoop() {
    // Stage 0 = initial scrambling sequence
    if (this.stage === 0) {
      if (--this.initialShuffleIterations < 1) {
        this.stage = 1;
        this.nextStep = this.revealAndShuffle;
      }
    }
    // Stage 1 = revealing the plain text
    else {
      if (this.encryptedElements.length === 0) {
        this.onWillSave.dispose();
        return;
      }
    }

    setTimeout(this.nextStep.bind(this), 0);
    setTimeout(this.render.bind(this), 0);

    setTimeout(this.mainLoop.bind(this), this.ms);
  }

  // Get a list of elements in the character array we need to 'decrypt'
  initEncryptedElements() {
    for (var i = 0; i < this.plainText.length; i++) {
      if (!this.isWhiteSpace(this.plainText[i])) {
        this.encryptedElements.push(i);
      }
    }
  }

  // Shuffle all characters
  shuffle() {
    for (var i = 0; i < this.plainText.length; i++) {
      if (this.isWhiteSpace(this.plainText[i]))
        this.screenArray[i] = this.plainText[i];
      else
        this.screenArray[i] = this.getRandomChar();
    }
  }

  // Reveal a few characters
  revealAndShuffle() {
    var pos, i;

    // Reveal some
    for (i = 0; i < this.revealEachFrame; i++) {
      pos = this.getRandomInt(0, this.encryptedElements.length);
      this.screenArray[this.encryptedElements[pos]] = this.plainText[this.encryptedElements[pos]];
      this.encryptedElements.splice(pos, 1);
    }

    // Shuffle some
    for (i = 0; i < this.shuffleEachFrame; i++) {
      pos = this.getRandomInt(0, this.encryptedElements.length);
      this.screenArray[this.encryptedElements[pos]] = this.getRandomChar();
    }
  }

  // Dump the character array into the HTML
  render() {
    if (!this.hasStopped) {
      this.editor.setText(this.screenArray.join(''));
    }
  }

  // Helper functions:

  isWhiteSpace(s) {
    return /^\s+$/.test(s);
  }

  // Get a character from the array
  getRandomChar() {
    return this.chars[this.getRandomInt(0, this.chars.length - 1)];
  }

  // Get a random int from range
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
