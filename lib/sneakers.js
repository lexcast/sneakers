'use babel';

import {CompositeDisposable} from 'atom';
import EffectManager from './effect-manager';

export default {
  subscriptions: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'sneakers:run': () => this.run()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  run() {
    var editor = atom.workspace.getActiveTextEditor();
    if (!editor) {
      return;
    }

    (new EffectManager(editor)).run();
  }
};
