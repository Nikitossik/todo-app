import App from '../App.js';
import Todo from '../Todo.js';

import {
    Datepicker,
    Timepicker,
    Chip,
    Rating,
    Select,
    initTE
} from "tw-elements";

import {
    format
} from 'date-fns';

initTE({
    Datepicker,
    Timepicker,
    Select,
    Chip,
    Rating
});

import formMixin from './formMixin.js';

export class AddTodoForm {
    constructor({
        anchor,
        position = 'afterend',
        toggleAnchor = false,
        toggleBindings = true,
        closeOnSubmit = false,
        sectionId
    }) {
        this.element = document.getElementById('todo-form');
        this.anchor = anchor;
        this.position = position;
        this.toggleAnchor = toggleAnchor;
        this.closeOnSubmit = closeOnSubmit;
        this.toggleBindings = toggleBindings;

        this.todoOptions = {
            name: '',
            description: '',
            endDate: '',
            endTime: '',
            priority: 4,
            difficulty: 0,
            sectionId
        };

        this._handleInput = this._handleInput.bind(this);
        this._handleDateChange = this._handleDateChange.bind(this);
        this._handleTimeChange = this._handleTimeChange.bind(this);
        this._handleSelectChange = this._handleSelectChange.bind(this);
        this._handleRatingChange = this._handleRatingChange.bind(this);
        this._handleChipClear = this._handleChipClear.bind(this);

        this._clearDateValue = this._clearDateValue.bind(this)
        this._clearDifficultyValue = this._clearDifficultyValue.bind(this);
        this._clearTimeValue = this._clearTimeValue.bind(this);

        this._handleCancel = this._handleCancel.bind(this);
        this._handleSubmit = this._handleSubmit.bind(this);

        this._init();
    }

    get submitLabel() {
        return 'Add task';
    }

    _init() {
        if (!this.anchor) return;

        if (window.activeTodoForm) {
            window.activeTodoForm.close();
            window.activeTodoForm = null;
        }

        this._hideBindings();

        this._render();

        this.taskNameInput = this.element.querySelector('input[name="name"]');

        this.taskDescriptionInput = this.element.querySelector('input[name="description"]');

        this.dateChipElement = this.element.querySelector('.chip[data-todo-property="endDate"]');
        this.datepikerEl = this.element.querySelector('.todo-datepicker');
        this.datepickerInput = this.datepikerEl.querySelector('.datepicker-input');

        this.timeChipElement = this.element.querySelector('.chip[data-todo-property="endTime"]');
        this.timepikerEl = this.element.querySelector('.todo-timepicker');
        this.timepickerInput = this.timepikerEl.querySelector('.datepicker-input');

        this.priorityChipElement = this.element.querySelector('.chip[data-todo-property="priority"]');
        this.selectEl = this.element.querySelector('.priority-select');

        this.diffChipElement = this.element.querySelector('.chip[data-todo-property="difficulty"]');
        this.ratingEl = this.element.querySelector('.difficulty-rating');

        this.cancelButton = this.element.querySelector('.button[name="cancel"]');
        this.submitButton = this.element.querySelector('.button[name="submit"]');

        this.submitButton.querySelector('span').textContent = this.submitLabel;

        this.submitButton.querySelector('[data-save-icon]').classList.add('hidden');
        this.submitButton.querySelector('[data-add-icon]').classList.remove('hidden');

        this._setupListeners();

        window.activeTodoForm = this;
    }

    _setupListeners() {
        this.taskNameInput.addEventListener('input', this._handleInput);
        this.taskDescriptionInput.addEventListener('input', this._handleInput);
        this.dateChipElement.addEventListener('click', (e) => {
            this._handleChipClear(e, this._clearDateValue)
        })
        this.timeChipElement.addEventListener('click', (e) => {
            this._handleChipClear(e, this._clearTimeValue)
        })
        this.datepikerEl.addEventListener('dateChange.te.datepicker', this._handleDateChange);
        this.timepikerEl.addEventListener('input.te.timepicker', this._handleTimeChange);
        this.selectEl.addEventListener('valueChange.te.select', this._handleSelectChange);
        this.ratingEl.addEventListener('onSelect.te.rating', this._handleRatingChange);
        this.diffChipElement.addEventListener('click', (e) => {
            this._handleChipClear(e, this._clearDifficultyValue)
        })
        this.cancelButton.addEventListener('click', this._handleCancel);
        this.submitButton.addEventListener('click', this._handleSubmit);
    }

    _removeListeners() {
        this.taskNameInput.removeEventListener('input', this._handleInput);
        this.taskDescriptionInput.removeEventListener('input', this._handleInput);
        this.dateChipElement.removeEventListener('click', (e) => {
            this._handleChipClear(e, this._clearDateValue)
        });
        this.timeChipElement.removeEventListener('click', (e) => {
            this._handleChipClear(e, this._clearTimeValue)
        })
        this.datepikerEl.removeEventListener('dateChange.te.datepicker', this._handleDateChange);
        this.timepikerEl.removeEventListener('input.te.timepicker', this._handleTimeChange);
        this.selectEl.removeEventListener('valueChange.te.select', this._handleSelectChange);
        this.ratingEl.removeEventListener('onSelect.te.rating', this._handleRatingChange);
        this.diffChipElement.removeEventListener('click', (e) => {
            this._handleChipClear(e, this._clearDifficultyValue)
        })
        this.cancelButton.removeEventListener('click', this._handleCancel);
        this.submitButton.removeEventListener('click', this._handleSubmit);
    }

    _hideBindings() {
        if (this.toggleBindings)
            [...document.querySelectorAll(`[data-form-bind="#${this.element.id}"]`)].forEach(binding => binding.classList.add('hidden'));
    }

    _showBindings() {
        if (this.toggleBindings)
            [...document.querySelectorAll(`[data-form-bind="#${this.element.id}"]`)].forEach(binding => binding.classList.remove('hidden'));
    }

    // event handlers

    _handleInput(e) {

        this._disableButton(this.taskNameInput, this.submitButton);

        this.todoOptions[e.target.name] = e.target.value.trim();
    }

    _handleDateChange(e) {
        this.todoOptions.endDate = format(new Date(e.date), 'iii, dd MMM, yyyy');
    }

    _handleTimeChange(e) {
        this.todoOptions.endTime = this.timepickerInput.value;
    }

    _handleSelectChange(e) {
        this.todoOptions.priority = e.value ? e.value : '4';
        this.element.dataset.priority = e.value;
    }

    _handleRatingChange(e) {
        this.todoOptions.difficulty = e.value;
    }

    _handleChipClear(e, callback) {
        const target = e.target.closest('.chip-close');

        if (!target) return;

        callback();
    }

    _handleCancel(e) {
        this.close();
        this._showBindings();
        window.activeTodoForm = null;
        e.preventDefault();
    }

    _handleSubmit(e) {
        if (this.anchor.classList.contains('js-todo')) this._showBindings();

        this._handleData();
        this._setDefaultValues();

        if (this.closeOnSubmit) this.close();

        e.preventDefault();
    }

    // clear values for date and rating

    _clearDateValue() {
        this.todoOptions.endDate = '';
        this.datepickerInput.value = '';
    }

    _clearTimeValue() {
        this.todoOptions.endTime = '';
        this.timepickerInput.value = '';
    }

    _clearDifficultyValue() {
        this.todoOptions.difficulty = 0;

        const svgsFilled = this.ratingEl.querySelectorAll('.fill-current');
        svgsFilled.forEach(svg => svg.classList.remove('fill-current'));
    }

    _setDefaultValues() {
        this.taskNameInput.value = '';
        this.taskDescriptionInput.value = '';
        this.submitButton.disabled = true;
        Select.getInstance(this.selectEl).setValue(4);
        this.element.dataset.priority = 4;

        this._clearDateValue();
        this._clearTimeValue();
        this._clearDifficultyValue();
    }

    _handleData() {
        const todo = new Todo({
            id: `todo${Date.now()}`,
            ...this.todoOptions
        });
        const section = App.getSectionById(todo.options.sectionId);
        section.addTodo(todo, this.anchor.id, this.position == 'beforebegin');
        section.updateCount();

        todo.init();

        if (this.anchor.classList.contains('js-todo'))
            todo.insert(this.anchor, this.position);
        else {
            todo.render(section.todoHolder);
        }

        App.updateContainer();
    }
}

Object.assign(AddTodoForm.prototype, formMixin);

export class EditTodoForm extends AddTodoForm {
    constructor(...args) {
        super({
            ...args[0],
            closeOnSubmit: true,
            toggleBindings: false
        });
    }

    get submitLabel() {
        return 'Save';
    }

    _init() {
        super._init();

        this.todoOptions = {
            ...App.getTodoItemById(this.anchor.id).options
        };

        const {
            name,
            description,
            endDate,
            endTime,
            priority,
            difficulty
        } = this.todoOptions;

        this.taskNameInput.value = name;

        this.taskDescriptionInput.value = description;

        this.datepickerInput.value = endDate;
        this.timepickerInput.value = endTime;

        Select.getInstance(this.selectEl).setValue(priority);
        this.element.dataset.priority = priority;

        new Rating(this.ratingEl, {
            value: difficulty ? difficulty : ''
        })

        this.submitButton.disabled = false;

        this.submitButton.querySelector('[data-save-icon]').classList.remove('hidden');
        this.submitButton.querySelector('[data-add-icon]').classList.add('hidden');
    }

    _handleData() {
        const currentTodo = App.getTodoItemById(this.anchor.id);
        currentTodo.save(this.todoOptions);
        currentTodo.update();
    }

    _handleSubmit(e) {
        if (this.anchor.classList.contains('js-todo')) this._showBindings();

        this._handleData();
        this.close();

        e.preventDefault();
    }
}

export class ModalTodoForm {
    constructor({
        anchor,
        position = 'afterend',
        toggleAnchor = true,
        closeOnSubmit = true
    }) {
        this.element = document.getElementById('todo-modal-form');
        this.anchor = anchor;
        this.position = position;
        this.toggleAnchor = toggleAnchor;
        this.closeOnSubmit = closeOnSubmit;

        this._handleInput = this._handleInput.bind(this);
        this._handleCancel = this._handleCancel.bind(this);
        this._handleSubmit = this._handleSubmit.bind(this);

        this._init();
    }

    _init() {
        this._render();

        this.taskNameInput = this.element.querySelector('input[name="name"]');
        this.taskDescriptionInput = this.element.querySelector('input[name="description"]');

        this.todoId = this.anchor.closest('[data-todo-id]').dataset.todoId;
        const {
            name,
            description
        } = App.getTodoItemById(this.todoId).options;

        this.taskNameInput.value = name;
        this.taskDescriptionInput.value = description;

        this.taskNameInput.addEventListener('input', this._handleInput);

        this.cancelButton = this.element.querySelector('.button[name="cancel"]');
        this.submitButton = this.element.querySelector('.button[name="submit"]');

        this.submitButton.disabled = name == '';

        this.cancelButton.addEventListener('click', this._handleCancel);
        this.submitButton.addEventListener('click', this._handleSubmit);

        window.activeModalForm = this;
    }

    _handleInput() {
        this._disableButton(this.taskNameInput, this.submitButton);
    }

    _removeListeners() {
        this.taskNameInput.removeEventListener('input', this._handleInput);
        this.cancelButton.removeEventListener('click', this._handleCancel);
        this.submitButton.removeEventListener('click', this._handleSubmit);
    }

    _handleCancel(e) {
        this.close();
        e.preventDefault();
    }

    _handleSubmit(e) {
        this._handleData();
        this.close();

        e.preventDefault();
    }

    _handleData() {
        const currentTodo = App.getTodoItemById(this.todoId);
        currentTodo.save({
            name: this.taskNameInput.value,
            description: this.taskDescriptionInput.value
        });
        currentTodo.update();

        const todoName = this.anchor.querySelector('[data-todo-name]');
        const todoDesc = this.anchor.querySelector('[data-todo-description]');

        todoName.textContent = this.taskNameInput.value;
        todoDesc.textContent = this.taskDescriptionInput.value;

    }
}
Object.assign(ModalTodoForm.prototype, formMixin);