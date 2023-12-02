import App from '../App.js';

import {
    Section
} from '../Sections.js';

import formMixin from './formMixin.js';

export class AddSectionForm {
    constructor({
        anchor,
        position = 'afterend',
        toggleAnchor = true,
        toggleBindings = true,
        closeOnSubmit = true,
        sectionId
    }) {
        this.element = document.getElementById('section-form');
        this.anchor = anchor;
        this.position = position;
        this.toggleAnchor = toggleAnchor;
        this.closeOnSubmit = closeOnSubmit;
        this.toggleBindings = toggleBindings;
        this.sectionId = sectionId;

        this._handleInput = this._handleInput.bind(this);
        this._handleCancel = this._handleCancel.bind(this);
        this._handleSubmit = this._handleSubmit.bind(this);

        this._init();
    }

    get classes() {
        return ['mt-5'];
    }

    get submitLabel() {
        return 'Add section';
    }

    _init() {
        if (!this.anchor) return;

        if (window.activeSectionForm)
            window.activeSectionForm.close();

        this._render();

        this.sectionNameInput = this.element.querySelector('input[name="name"]');
        this.sectionNameInput.addEventListener('input', this._handleInput);

        this.cancelButton = this.element.querySelector('.button[name="cancel"]');
        this.cancelButton.addEventListener('click', this._handleCancel);

        this.submitButton = this.element.querySelector('.button[name="submit"]');
        this.submitButton.addEventListener('click', this._handleSubmit);

        this.submitButton.querySelector('span').textContent = this.submitLabel;
        this.submitButton.querySelector('[data-save-icon]').classList.add('hidden');
        this.submitButton.querySelector('[data-add-icon]').classList.remove('hidden');

        window.activeSectionForm = this;
    }

    _removeListeners() {
        this.sectionNameInput.removeEventListener('input', this._handleInput);
        this.cancelButton.removeEventListener('click', this._handleCancel);
        this.submitButton.removeEventListener('click', this._handleSubmit);
    }

    _setDefaultValues() {
        this.sectionNameInput.value = '';
    }

    _handleInput() {
        this._disableButton(this.sectionNameInput, this.submitButton);
    }

    _handleCancel(e) {
        this.close();
        e.preventDefault();
    }

    _handleData() {
        const peerSection = this.anchor.closest('[data-section]');
        const section = new Section({
            name: this.sectionNameInput.value,
            todos: [],
            id: `section${Date.now()}`
        });
        App.addSection(section, this.sectionId);
        section.insert(peerSection);
        App.updateContainer();
    }

    _handleSubmit(e) {
        this._handleData();
        this.close();

        e.preventDefault();
    }
}

Object.assign(AddSectionForm.prototype, formMixin);

export class EditSectionForm extends AddSectionForm {
    constructor({
        ...args
    }) {
        super({
            ...args
        });
    }

    get classes() {
        return [];
    }
    get submitLabel() {
        return 'Save';
    }

    _init() {
        super._init();

        this.sectionNameInput.value = App.getSectionById(this.sectionId).name;

        this.submitButton.querySelector('[data-save-icon]').classList.remove('hidden');
        this.submitButton.querySelector('[data-add-icon]').classList.add('hidden');
    }

    _handleData() {
        const section = App.getSectionById(this.sectionId);
        section.name = this.sectionNameInput.value;
        section.updateName();
    }
}