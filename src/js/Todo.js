import {
    Datepicker,
    Timepicker,
    initTE,
    Chip,
    Rating,
    Tooltip
} from "tw-elements";

import {
    Dropdown
} from 'flowbite';

import {
    updatePriorityPicks,
    updateDiffRating,
    updateTimepicker,
    hideRatingStars,
    updateDatepicker
} from './helpers.js'

import {
    defaultDatepickerOptions,
    defaultTimepickerClasses,
    defaultTimepickerOptions
} from './defaultComponentConfigs.js';

import {
    format,
    isPast,
    add
} from 'date-fns';

import {
    detectMob
} from "./helpers";


initTE({
    Datepicker,
    Timepicker,
    Chip,
    Rating,
    Tooltip
});

const dropdownElement = document.getElementById('todo-dropdown');

class Todo {
    constructor(options) {
        this.options = options;
        this.element = document.createElement('div');
    }

    init() {
        this._initElement();
        this._setupDropdown();
        this._setupDatepickerChip();
        this._setupTimepickerChip();
        this._setupDifficultyChip();
    }

    get expireDate() {
        let date = new Date(`${this.options.endDate} ${this.options.endTime}`);

        date = this.options.endTime == '' ? add(date, {
            days: 1
        }) : date;

        return date;
    }

    save(changes) {
        Object.assign(this.options, changes);
    }

    duplicate() {
        const optionsCopy = Object.assign({}, this.options);
        optionsCopy.id = `todo${Date.now()}`;

        const todoCopy = new Todo(optionsCopy);
        return todoCopy;
    }

    // date change handling

    _listenDateChange() {
        if (!this.datepickerElement) return;

        this.datepickerElement.addEventListener('dateChange.te.datepicker', this._handleDateChange.bind(this));
    }

    _handleDateChange(e) {
        const newDate = format(e.date, 'iii, dd MMM, yyyy');

        this.options.endDate = newDate;

        this.options.expired = isPast(this.date);
        this.updateExpire();
    }

    // time change handling

    _listenTimeChange() {
        if (!this.timepickerElement) return;

        this.timepickerElement.addEventListener('input.te.timepicker', this._handleTimeChange.bind(this));
    }

    _handleTimeChange(e) {
        this.options.endTime = e.target.value;

        this.options.expired = isPast(this.date);
        this.updateExpire();
    }

    // difficulty change handling

    _listenRatingChange() {
        if (!this.diffRatingElement) return;

        this.diffRatingElement.addEventListener('onSelect.te.rating', this._handleRatingChange.bind(this));
    }

    _handleRatingChange({
        value
    }) {
        this.options.difficulty = value;
    }

    // chip delete handling

    _deleteDate(e) {

        this.options.endDate = '';

        this._disableDatepickerChip();

        this._deleteTime();
        this.options.expired = false;
        this.updateExpire();
    }

    _deleteTime(e) {
        this.options.endTime = '';
        this._disableTimepickerChip();

        this.options.expired = isPast(this.date);
        this.updateExpire();
    }

    _deleteDifficulty() {
        this.options.difficulty = 0;
        this._disableDifficultyChip();
    }

    _handleChipDelete(e, handler) {
        const target = e.target.closest('[data-te-chip-close]');

        if (!target) return;

        handler();
    }

    // setup functions for different components

    _setupDifficultyChip() {
        if (this.options.difficulty == 0) return;

        if (!this.diffChipElement) {

            const chipHtml = `
            <div class = "chip todo-chip"
            data-todo-property = 'difficulty'
            data-modal-ignore data-te-chip-init data-te-close="true" >
                <ul class = "items-center my-0 rating difficulty-rating"
                data-te-rating-init data-te-value='${this.options.difficulty}' data-priority = "${this.options.priority}" >
                    &nbsp
                        <li>
                            <span class=" [&>svg]:h-4 [&>svg]:w-4" title="Easy" data-te-rating-icon-ref>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                   stroke-width="2" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                </svg>
                            </span>
                        </li>
                        <li>
                            <span class = "[&>svg]:h-4 [&>svg]:w-4"
                            title = "Medium"
                            data-te-rating-icon-ref>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                   stroke-width="2" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                </svg>
                            </span>
                        </li>
                        <li>
                            <span class = "[&>svg]:h-4 [&>svg]:w-4"
                            title="Hard"
                            data-te-rating-icon-ref>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                   stroke-width="2" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                </svg>
                            </span>
                        </li>
                    </ul>
                <span data-te-chip-close class = "chip-close">
                      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                            stroke="currentColor" stroke-width="0.72">
                            <path
                                d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z"
                                fill="currentColor"></path>
                        </svg>
                </span>
            </div>
        `;

            this.todoChipsHolder.insertAdjacentHTML('beforeend', chipHtml);

            this.diffChipElement = this.element.querySelector('.chip[data-todo-property="difficulty"]');
            this.diffRatingElement = this.element.querySelector('.difficulty-rating');

            this.diffRatingInstance = new Rating(this.diffRatingElement);

            this.diffChipElement.addEventListener('click', (e) => {
                this._handleChipDelete(e, this._deleteDifficulty.bind(this));
            });
            this._listenRatingChange();
        }
    }

    _disableDifficultyChip() {
        if (!this.diffChipElement) return;

        this.diffChipElement.remove();
        this.diffChipElement = null;
        this.diffRatingElement = null;
        this.diffRatingInstance.dispose();
    }

    _setupDatepickerChip() {
        if (!this.options.endDate) return;

        if (!this.dateChipElement) {

            const chipHtml = `<div class = "chip todo-chip" data-todo-property='endDate' data-modal-ignore data-te-chip-init data-te-close="true">
                <div class = "relative todo-datepicker flex max-w-[13ch]"
                    data-te-datepicker-init data-te-inline="${!detectMob()}"
                    data-te-format="ddd, dd mmm, yyyy" data-te-disable-past='true'
                >
                    &nbsp
                    <input type="text" value="${this.options.endDate}" class="datepicker-input text-xs font-semibold focus:ring-0 p-0"
                        placeholder="Due date"  
                        data-te-datepicker-toggle-ref
                        data-te-datepicker-toggle-button-ref/>
                </div>
                <span data-te-chip-close class="chip-close">
                      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                            stroke="currentColor" stroke-width="0.72">
                            <path
                                d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z"
                                fill="currentColor"></path>
                        </svg>
                </span>
            </div>`;

            if (this.diffChipElement || this.timeChipElement) this.todoChipsHolder.insertAdjacentHTML('afterbegin', chipHtml);
            else this.todoChipsHolder.insertAdjacentHTML('beforeend', chipHtml);

            this.dateChipElement = this.element.querySelector('.chip[data-todo-property="endDate"]');
            this.datepickerElement = this.element.querySelector('.todo-datepicker');
            this.datepickerInstance = Datepicker.getOrCreateInstance(this.datepickerElement);

            this.dateChipElement.addEventListener('click', (e) => {
                this._handleChipDelete(e, this._deleteDate.bind(this));
            });
            this._listenDateChange();
        }
    }

    _disableDatepickerChip() {
        if (!this.dateChipElement) return;

        this.dateChipElement.remove();
        this.dateChipElement = null;
        this.datepickerElement = null;
        this.datepickerInstance.dispose();
    }

    _setupTimepickerChip() {
        if (!this.options.endTime) return;

        if (!this.timeChipElement) {

            const chipHtml = `
            <div class = "chip todo-chip"
            data-modal-ignore
            data-todo-property='endTime'
            data-te-chip-init >
                    <div class="relative max-w-[5ch] todo-timepicker flex" id="todo-time" 
                        data-te-with-icon="false" data-te-inline="${!detectMob()}" data-te-format24="true">
                        &nbsp
                        <input type="text" value="${this.options.endTime}" class="datepicker-input text-xs font-semibold focus:ring-0 p-0"
                            placeholder="Time" data-te-toggle="todo-time" />
                    </div>
                    <span class = "chip-close"
                    data-te-chip-close >
                          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                            stroke="currentColor" stroke-width="0.72">
                            <path
                                d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z"
                                fill="currentColor"></path>
                        </svg>
                    </span>
                </div>
            `;

            if (this.dateChipElement) this.dateChipElement.insertAdjacentHTML('afterend', chipHtml);
            else if (this.diffChipElement) this.todoChipsHolder.insertAdjacentHTML('afterbegin', chipHtml);
            else this.todoChipsHolder.insertAdjacentHTML('beforeend', chipHtml);

            this.timeChipElement = this.element.querySelector('.chip[data-todo-property="endTime"]');
            this.timepickerElement = this.element.querySelector('.todo-timepicker');
            this.timepickerInstance = new Timepicker(this.timepickerElement,
                defaultTimepickerOptions, defaultTimepickerClasses);

            this.timeChipElement.addEventListener('click', (e) => {
                this._handleChipDelete(e, this._deleteTime.bind(this));
            });
            this._listenTimeChange();
        }
    }

    _disableTimepickerChip() {
        if (!this.timeChipElement) return;

        this.timeChipElement.remove();
        this.timeChipElement = null;
        this.timepickerElement = null;
        this.timepickerInstance.dispose();
    }

    _setupDropdown() {
        const trigger = this.element.querySelector('[data-todo-dropdown-toggle]');

        this.dropdown = new Dropdown(dropdownElement, trigger, {
            placement: 'right-end',
            offsetSkidding: 0,
            offsetDistance: 10,
            delay: 300,
            ignoreClickOutsideClass: 'ignore-outside',
            onHide: () => {
                trigger.classList.remove('opacity-100', 'bg-dark-200/50');
            },
            onShow: () => {
                dropdownElement.dataset.todoId = this.options.id;
                dropdownElement.dataset.sectionId = this.options.sectionId;
                trigger.classList.add('opacity-100', 'bg-dark-200/50');

                updatePriorityPicks(dropdownElement, this.options.priority);
                updateDiffRating(dropdownElement, this.options.difficulty);
                updateDatepicker(dropdownElement, this.options.endDate);
                updateTimepicker(dropdownElement, this.options.endTime);
            }
        }, {
            id: `${this.options.id}-dropdown`,
            override: true
        });
    }

    _initElement() {
        this.element.classList = 'js-todo todo-holder';
        this.element.id = this.options.id;
        this.element.dataset.todoId = this.options.id;
        this.element.dataset.sectionId = this.options.sectionId;
        this.element.dataset.priority = this.options.priority;

        this.element.innerHTML = `
            <div class = "todo-item group/todo" >
                <input data-todo-check type="checkbox" class="todo-checkbox rounded-full" data-modal-ignore>
                <div class="flex-1 mr-8 md:mr-24">
                <div class='flex flex-col gap-1 md:gap-1.5 break-all'>
                    <h3 data-todo-name class="text-lg font-medium text-dark-700">${this.options.name}</h3>
                    <p data-todo-description class="text-dark-500">${this.options.description}</p>
                    <div class="chips-holder mt-2 flex flex-wrap gap-2">
                    </div>
                </div>
                </div>
                <div class = "absolute bg-white shadow-[-25px_0px_29px_3px_rgba(255,255,255,1)] shadow-white lg:shadow-none lg:group-hover/todo:shadow-[-25px_0px_29px_3px_rgba(255,255,255,1)] group-hover/todo:bg-white top-0 right-0 flex gap-1.5 text-dark-500"
                data-modal-ignore>
                    <button type='button'
                    class = "[&>svg]:h-5 [&>svg]:w-5 p-1 lg:opacity-0 hover:bg-dark-200/50 transition group-hover/todo:opacity-100"
                    data-todo-action="editTodo" title='Edit task'>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">

                            <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M3.25 22C3.25 21.5858 3.58579 21.25 4 21.25H20C20.4142 21.25 20.75 21.5858 20.75 22C20.75 22.4142 20.4142 22.75 20 22.75H4C3.58579 22.75 3.25 22.4142 3.25 22Z"
                                fill="currentColor"></path>
                            <path
                                d="M11.5201 14.929L11.5201 14.9289L17.4368 9.01225C16.6315 8.6771 15.6777 8.12656 14.7757 7.22455C13.8736 6.32238 13.323 5.36846 12.9879 4.56312L7.07106 10.4799L7.07101 10.48C6.60932 10.9417 6.37846 11.1725 6.17992 11.4271C5.94571 11.7273 5.74491 12.0522 5.58107 12.396C5.44219 12.6874 5.33894 12.9972 5.13245 13.6167L4.04356 16.8833C3.94194 17.1882 4.02128 17.5243 4.2485 17.7515C4.47573 17.9787 4.81182 18.0581 5.11667 17.9564L8.38334 16.8676C9.00281 16.6611 9.31256 16.5578 9.60398 16.4189C9.94775 16.2551 10.2727 16.0543 10.5729 15.8201C10.8275 15.6215 11.0584 15.3907 11.5201 14.929Z"
                                fill="currentColor"></path>
                            <path
                                d="M19.0786 7.37044C20.3071 6.14188 20.3071 4.14999 19.0786 2.92142C17.85 1.69286 15.8581 1.69286 14.6296 2.92142L13.9199 3.63105C13.9296 3.6604 13.9397 3.69015 13.9502 3.72028C14.2103 4.47 14.701 5.45281 15.6243 6.37602C16.5475 7.29923 17.5303 7.78999 18.28 8.05009C18.31 8.0605 18.3396 8.07054 18.3688 8.08021L19.0786 7.37044Z"
                                fill="currentColor"></path>

                        </svg>
                    </button>
                    <button type='button'
                    class = "[&>svg]:h-5 [&>svg]:w-5 hidden md:block p-1 lg:opacity-0 hover:bg-dark-200/50 transition group-hover/todo:opacity-100"
                    data-todo-action="deleteTodo"  title='Delete task'>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M3 6.38597C3 5.90152 3.34538 5.50879 3.77143 5.50879L6.43567 5.50832C6.96502 5.49306 7.43202 5.11033 7.61214 4.54412C7.61688 4.52923 7.62232 4.51087 7.64185 4.44424L7.75665 4.05256C7.8269 3.81241 7.8881 3.60318 7.97375 3.41617C8.31209 2.67736 8.93808 2.16432 9.66147 2.03297C9.84457 1.99972 10.0385 1.99986 10.2611 2.00002H13.7391C13.9617 1.99986 14.1556 1.99972 14.3387 2.03297C15.0621 2.16432 15.6881 2.67736 16.0264 3.41617C16.1121 3.60318 16.1733 3.81241 16.2435 4.05256L16.3583 4.44424C16.3778 4.51087 16.3833 4.52923 16.388 4.54412C16.5682 5.11033 17.1278 5.49353 17.6571 5.50879H20.2286C20.6546 5.50879 21 5.90152 21 6.38597C21 6.87043 20.6546 7.26316 20.2286 7.26316H3.77143C3.34538 7.26316 3 6.87043 3 6.38597Z"
                                fill="currentColor"></path>
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M11.5956 22.0001H12.4044C15.1871 22.0001 16.5785 22.0001 17.4831 21.1142C18.3878 20.2283 18.4803 18.7751 18.6654 15.8686L18.9321 11.6807C19.0326 10.1037 19.0828 9.31524 18.6289 8.81558C18.1751 8.31592 17.4087 8.31592 15.876 8.31592H8.12404C6.59127 8.31592 5.82488 8.31592 5.37105 8.81558C4.91722 9.31524 4.96744 10.1037 5.06788 11.6807L5.33459 15.8686C5.5197 18.7751 5.61225 20.2283 6.51689 21.1142C7.42153 22.0001 8.81289 22.0001 11.5956 22.0001ZM10.2463 12.1886C10.2051 11.7548 9.83753 11.4382 9.42537 11.4816C9.01321 11.525 8.71251 11.9119 8.75372 12.3457L9.25372 17.6089C9.29494 18.0427 9.66247 18.3593 10.0746 18.3159C10.4868 18.2725 10.7875 17.8856 10.7463 17.4518L10.2463 12.1886ZM14.5746 11.4816C14.9868 11.525 15.2875 11.9119 15.2463 12.3457L14.7463 17.6089C14.7051 18.0427 14.3375 18.3593 13.9254 18.3159C13.5132 18.2725 13.2125 17.8856 13.2537 17.4518L13.7537 12.1886C13.7949 11.7548 14.1625 11.4382 14.5746 11.4816Z"
                                fill="currentColor"></path>
                        </svg>
                    </button>
                    <button type = 'button' data-todo-dropdown-toggle data-dropdown-placement="right-end"
                    class = "[&>svg]:h-5 [&>svg]:w-5 hidden md:block p-1 lg:opacity-0 hover:bg-dark-200/50 transition group-hover/todo:opacity-100"
                        data-todo-id="${this.options.id}" 
                        title='More task options' >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        
                        <path d="M7 12C7 13.1046 6.10457 14 5 14C3.89543 14 3 13.1046 3 12C3 10.8954 3.89543 10 5 10C6.10457 10 7 10.8954 7 12Z" fill="currentColor"></path> 
                        <path d="M14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12Z" fill="currentColor"></path> 
                        <path d="M21 12C21 13.1046 20.1046 14 19 14C17.8954 14 17 13.1046 17 12C17 10.8954 17.8954 10 19 10C20.1046 10 21 10.8954 21 12Z" fill="currentColor"></path> 
                        </svg>
                    </button>
                </div>
            </div>
        `;

        this.todoNameEl = this.element.querySelector('[data-todo-name]');
        this.todoDescEl = this.element.querySelector('[data-todo-description]');
        this.todoChipsHolder = this.element.querySelector('.chips-holder');


        this.element.querySelectorAll('.todo-action').forEach(tooltip => {
            new Tooltip(tooltip, {
                trigger: 'hover'
            });
        })
    }

    // immediate update functions fired on date/time-picker, rating change etc.

    update() {
        this.todoNameEl.textContent = this.options.name;
        this.todoDescEl.textContent = this.options.description;
        this.updateDate();
        this.updateTime();
        this.updateDifficulty();
        this.updatePriority();
        this.updateExpire();
    }

    updateDate() {

        if (!this.options.endDate) {
            this._disableDatepickerChip();
            return;
        }

        this._setupDatepickerChip();

        const input = this.datepickerElement.querySelector('.datepicker-input');

        input.value = this.options.endDate;
        input.setAttribute('value', this.options.endDate);
    }

    updateTime() {

        if (!this.options.endTime) {
            this._disableTimepickerChip();
            return;
        }

        this._setupTimepickerChip();

        const input = this.timepickerElement.querySelector('.datepicker-input');

        input.value = this.options.endTime;
        input.setAttribute('value', this.options.endTime);
    }

    updateDifficulty() {

        if (!this.options.difficulty) {
            this._disableDifficultyChip();
            return;
        }

        this._setupDifficultyChip();

        this.diffRatingInstance = new Rating(this.diffRatingElement, {
            value: this.options.difficulty
        });
    }

    updatePriority() {
        this.element.dataset.priority = this.options.priority;

        if (this.diffChipElement) this.diffRatingElement.dataset.priority = this.options.priority;
    }

    updateExpire() {
        if (this.options.expired) this.element.setAttribute('data-todo-expired', '');
        else this.element.removeAttribute('data-todo-expired');
    }

    // render functions

    insert(peer, position) {
        peer.insertAdjacentElement(position, this.element);
    }

    render(parent) {
        parent.append(this.element);
    }

    delete() {
        this.element.querySelectorAll('.todo-action').forEach(tooltip => {
            Tooltip.getInstance(tooltip).dispose();
        })
        this.element.remove();
    }
}

export default Todo;