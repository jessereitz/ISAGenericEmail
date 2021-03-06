import SimpleHelp from './helpViewComponents/simpleHelp.js';
import Walkthrough from '../walkthrough/tutorial.js';
import { GRSHelpSteps, IMGHelpSteps } from './helpViewComponents/helpSteps.js';

import {
  generateElement,
  generateStandardButton,
} from '../lib.js';

const descriptionHTML = `
  <p>Welcome to the ISA Easy Email Generator! This editor is here to provide
  a simple, easy-to-use tool to compose your HTML emails. Though this editor
  offers an alternative to GRS's HTML template editor, you will still need to
  use the GRS editor to actually create and send your email.</p>

  <p>If it's your first time using this editor, please click the "Tutorial"
  button below to learn about its features and how to use them. You should also
  read the "GRS Help" and "Images Help" sections below to learn about how you
  should create the GRS portion of your email and add images to the ISA server
  for use here.</p>
`;

const btnStyle = {
  display: 'block',
  padding: '2em 1rem',
  'margin-left': 'auto',
  'margin-right': 'auto',
  width: '20em',
};

function setModalBackButton() {
  const backText = 'Back to Help';
  this.modal.setSaveHandler(backText, this.display.bind(this));
}

const helpView = {
  $ctn: generateElement('div'),
  $heading: generateElement('h1', { textContent: 'Help' }),
  $description: generateElement(
    'div',
    {
      innerHTML: descriptionHTML,
      style: { 'text-align': 'left', 'max-width': '35em', margin: '2em auto' },
    },
  ),
  $tutorialBtn: generateStandardButton('Tutorial<br/>(unsaved progress will be lost)', { style: btnStyle }),
  $grsBtn: generateStandardButton('GRS Help', { style: btnStyle }),
  $imagesBtn: generateStandardButton('Images Help', { style: btnStyle }),

  /**
   * init - Initialize the helpView. Saves a reference to the moadl it will use
   *  and prepares the container to display in the modal.
   *
   * @param {Modal} modal The modal used to display the helpView.
   *
   * @returns {helpView} Returns this helpView.
   */
  init(modal) {
    this.modal = modal;

    this.baseElements = [
      this.$heading,
      this.$description,
      this.$tutorialBtn,
      this.$grsBtn,
      this.$imagesBtn,
    ];

    this.tutorial = Object.create(Walkthrough);
    this.tutorial.init();
    this.$tutorialBtn.addEventListener('click', this.startTutorial.bind(this));
    window.tut = this.tutorial;

    this.grsHelp = Object.create(SimpleHelp);
    this.grsHelp.init('Add and Send Your Email in GRS', GRSHelpSteps, this.modal);
    this.$grsBtn.addEventListener('click', this.displayGRSTutorial.bind(this));

    this.imgHelp = Object.create(SimpleHelp);
    this.imgHelp.init('Add Images to Your Email', IMGHelpSteps, this.modal);
    this.$imagesBtn.addEventListener('click', this.displayImagesTutorial.bind(this));

    this.setBaseView();
  },

  /**
   * startTutorial - Starts the live tutorial.
   *
   * @returns {type} Description
   */
  startTutorial() {
    this.modal.hide();
    this.tutorial.beginTutorial();
  },

  /**
   * displayGRSTutorial - Display the GRS tutorial.
   *
   */
  displayGRSTutorial() {
    this.modal.hide();
    setModalBackButton.call(this);
    this.grsHelp.render(0);
  },


  /**
   * displayImagesTutorial - Display the images tutorial.
   *
   */
  displayImagesTutorial() {
    this.modal.hide();
    setModalBackButton.call(this);
    this.imgHelp.render(0);
  },

  /**
   * setBaseView - Sets the view to display the base information, that is to
   *  say, sets the view to display everything in the baseElements array. It
   *  also sets the modal savehandler to null which also hides the auxiliary
   *  button on the modal.
   *
   * @returns {type} Description
   */
  setBaseView() {
    this.$ctn.innerHTML = '';
    this.baseElements.forEach(el => this.$ctn.appendChild(el));
    this.modal.setSaveHandler(null);
  },

  /**
   * display - Display the modal, passing in this.$ctn.
   *
   */
  display() {
    this.setBaseView();
    this.modal.display(this.$ctn);
  },
};

export default helpView;
