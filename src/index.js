// import WriteFree from './vendor/writefree.es6.js';
import WriteFree from 'writefree';

import Cookies from './vendor/cookies';
import Modal from './modalViews/modal.js';
import SettingsView from './modalViews/settingsView.js';
import CopyView from './modalViews/copyView.js';
import SaveLoadView from './modalViews/saveLoadView.js';
import HelpView from './modalViews/helpView.js';

import {
  DocumentFileType,
  generateCurrentDateString,
  findAncestorOfType,
} from './lib.js';

const tutorialCookieTitle = 'ISAEasyEmailTutorial';

const containerStyle = {
  'box-sizing': 'border-box',
  padding: '20px 5px',
  width: '600px',
};

const largeHeadingStyle = {
  'font-family': "'Helvetica', sans-serif",
  'font-weight': 'normal',
  'font-size': '24px',
  color: '#333',
  'padding-left': '10px',
  'padding-right': '10px',
};

const smallHeadingStyle = {
  'font-family': "'Helvetica', sans-serif",
  'font-weight': 'normal',
  'font-size': '20px',
  color: '#888',
  'padding-left': '10px',
  'padding-right': '10px',
};

const imgStyle = {
  'max-width': '100%',
  'text-align': 'center',
  margin: '1em auto',
};

const sectionStyle = {
  overflow: 'hidden',
  width: '100%',
  'padding-left': '10px',
  'padding-right': '10px',
  'box-sizing': 'border-box',
  'font-family': 'Times',
  'font-size': '16px',
  'line-height': '1.25em',

};

const options = {
  divOrPar: 'p',
  containerStyle,
  largeHeadingStyle,
  smallHeadingStyle,
  imgStyle,
  sectionStyle,
  emptyPlaceholder: 'Compose your email here...',
};

function setButtons() {
  return {
    $startoverBtn: document.getElementById('startoverBtn'),
    $copyCodeBtn: document.getElementById('copyCodeBtn'),
    $saveLoadBtn: document.getElementById('saveLoadBtn'),
    $settingsBtn: document.getElementById('settingsBtn'),
    $helpBtn: document.getElementById('helpBtn'),
  };
}

function checkTutorialCookie() {
  return Cookies.getItem(tutorialCookieTitle);
}

function setTutorialCookie() {
  const date = new Date();
  Cookies.setItem(tutorialCookieTitle, date.toUTCString());
}

const Controller = {
  docInfo: {
    fileType: DocumentFileType,
    dateCreated: generateCurrentDateString(),
  },

  /**
   * init - Initialize the Controller object. The Controller object is what, in
   *  turn, initializes the editor and modalViews.
   *
   * @returns {Controller} Returns this.
   */
  init() {
    // Initialize Controller HTML
    this.btns = setButtons();
    this.$copyTargetCtn = document.getElementById('copyTargetCtn');
    this.$copyTargetInnerCtn = document.getElementById('copyTargetInnerCtn');
    this.$copyTargetBottomBtns = document.getElementById('copyTarget-bottomBtns');
    this.$bottomBtns = document.getElementById('bottomBtns');
    this.$metaDisplay = document.getElementById('metaDisplay');
    // Initialize the editor
    this.editorCtn = document.getElementById('wfeditor');
    this.editor = WriteFree(this.editorCtn, options);
    // Set the document meta data
    this.setDocInfo();
    // Initialize the modal views. This must come after setDocInfo.
    this.initModalViews();

    document.addEventListener('click', this.buttonClickHandler.bind(this));

    window.ed = this.editor;
    window.docInfo = this.docInfo;
    if (!checkTutorialCookie()) {
      this.helpView.startTutorial();
      setTutorialCookie();
    }
    return this;
  },

  /**
   * initModalViews - Initialize the modal views.
   *
   */
  initModalViews() {
    this.modal = Object.create(Modal);
    this.modal.init();
    this.settingsview = Object.create(SettingsView);
    this.settingsview.init(this.modal, this.docInfo);
    this.copyview = Object.create(CopyView);
    this.copyview.init(this.modal);
    this.saveLoadView = Object.create(SaveLoadView);
    this.saveLoadView.init(this.modal, this.setDocInfo.bind(this), this.getDocInfo.bind(this));
    this.helpView = Object.create(HelpView);
    this.helpView.init(this.modal);
  },

  /**
   * initDocInfo - Initialize the document info past what is done in property
   *  declarations above. The properties defined here are done so because they
   *  utilize getters and setters which must wait for other portions of the app
   *  to initialize before they can be set up.
   *
   */
  initDocInfo() {
    if (!this.docInfo.contents) {
      const closureEditor = this.editor;
      // docInfo.contents is linked up with the editor
      Object.defineProperty(this.docInfo, 'contents', {
        configurable: false,
        writeable: true,
        enumerable: true,
        get() {
          return closureEditor.html(true);
        },
        set(htmlString) {
          return closureEditor.load(htmlString);
        },
      });
    }
    if (!this.docInfo.title) {
      let closureTitle = '';
      const closureMetaDisplay = this.$metaDisplay;
      const title = document.getElementsByTagName('TITLE')[0];
      // title defined with setter to facilitate side-effects like updating the
      // current title at the bottom of the screen.
      Object.defineProperty(this.docInfo, 'title', {
        configurable: false,
        writeable: true,
        enumerable: true,
        set(val) {
          closureTitle = val;
          closureMetaDisplay.textContent = val;
          title.textContent = `Editing ${val} | ISA Easy Email`;
        },
        get() {
          return closureTitle;
        },
      });
      if (!this.docInfo.links) {
        const advisingLink = document.getElementById('advisingLink');
        const applicationLink = document.getElementById('applicationLink');
        this.docInfo.links = {
          advisingLink: {
            text: advisingLink.textContent,
            url: advisingLink.href,
          },
          applicationLink: {
            text: applicationLink.textContent,
            url: applicationLink.href,
          },
        };
      }
      this.docInfo.title = `ISA Email ${this.docInfo.dateCreated}`;
    }
  },

  /**
   * setDocInfo - Sets the meta information for the current document. If given
   *  passed a docInfo object, it will attempt to set the docInfo of the current
   *  document to match that. Otherwise, it will provide generic defaults.
   *
   * @param {object} [docInfo] An optional object containing information about a
   *  document.
   *
   * @returns {object} returns the current docInfo.
   *
   */
  setDocInfo(docInfo = null) {
    this.initDocInfo();
    if (
      docInfo
      && docInfo.title
      && docInfo.contents
    ) {
      if (docInfo.fileType !== DocumentFileType) return false;
      Object.keys(docInfo).forEach((key) => {
        this.docInfo[key] = docInfo[key];
      });
    }
    if (this.settingsview) {
      this.settingsview.init(this.modal, this.docInfo);
    }
    return this.docInfo;
  },

  /**
   * getDocInfo - Retrieve the meta information for the current document in
   *  JSON format. The returned object includes the ocntent of the editor.
   *
   * @returns {object} The meta information for the document.
   */
  getDocInfo() {
    return this.docInfo;
  },

  /**
   * loadEditorFile - Loads the given docInfo into the current document. Sets
   *  the contents of the editor and updates the title of the current document.
   *
   * @param {object} docInfo The meta information, including editor contents, of
   *  the document to be loaded.
   *
   * @returns {type} Description
   */
  loadEditorFile(docInfo) {
    this.editor.load(docInfo.contents);
  },

  /**
   * buttonClickHandler - Handle clicks on the Controller buttons.
   *
   * @param {event} e The click event.
   *
   */
  buttonClickHandler(e) {
    if (e.target === this.btns.$startoverBtn) {
      window.location.reload();
    } else if (e.target === this.btns.$copyCodeBtn) {
      this.$copyTargetInnerCtn.innerHTML = this.editor.html();
      this.$copyTargetBottomBtns.innerHTML = this.$bottomBtns.innerHTML;
      this.$copyTargetBottomBtns.querySelectorAll('a').forEach((link) => {
        if (link.style.display === 'none') {
          const tr = findAncestorOfType('TR', link);
          tr.parentNode.removeChild(tr);
          // link.parentNode.parentNode.parentNode.removeChild(link.parentNode.parentNode);
        }
      });
      this.copyview.displayAndCopy(this.$copyTargetCtn.outerHTML);
      this.btns.$copyCodeBtn.blur();
    } else if (e.target === this.btns.$saveLoadBtn) {
      this.saveLoadView.display();
      this.btns.$saveLoadBtn.blur();
    } else if (e.target === this.btns.$settingsBtn) {
      this.settingsview.display();
      this.btns.$settingsBtn.blur();
    } else if (e.target === this.btns.$helpBtn) {
      this.helpView.display();
      this.btns.$settingsBtn.blur();
    }
  },

};

// Initialize the Controller object.
document.addEventListener('DOMContentLoaded', Controller.init.bind(Controller));
