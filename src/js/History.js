import {
    format,
    isToday,
    isYesterday
} from "date-fns";

import Todo from './Todo.js';
import App from './App.js';

export default class History {

    // useful getters

    static get allHistoryItems() {
        return this.structure.reduce((acc, sect) => [...sect.todos, ...acc], []);
    }

    static get checkedHistoryItems() {
        return this.allHistoryItems.filter(item => item.checked);
    }

    static getLocalStructure() {
        let structure = [];
        if (localStorage.hasOwnProperty('history')) {
            let data = localStorage.getItem('history');
            structure = JSON.parse(data);
        }
        return Array.from(structure);
    }

    static setLocalStructure() {
        const structure = this.structure.filter(sect => sect.todos.length != 0)
            .map(sect => {
                return {
                    date: sect.date,
                    todos: sect.todos.map(todo => todo.options)
                }
            });

        localStorage.setItem('history', JSON.stringify(structure));
    }

    static initStructure() {
        this.structure = [...this.getLocalStructure()];

        this.structure = this.structure.map(sect => {
            return new HistorySection({
                date: new Date(sect.date),
                todos: sect.todos.map(options => new HistoryItem(options))
            });
        });
    }

    static setTodaysSection() {
        const todaysSection = this.structure.find(sect => isToday(sect.date));
        if (todaysSection) return;

        this.structure.unshift(new HistorySection({
            date: new Date(),
            todos: []
        }));
    }

    // adding item to history

    static record(todo) {
        this.setTodaysSection();

        const historyItem = new HistoryItem(todo.options);

        this.structure[0].todos.push(historyItem);
        return historyItem;
    }

    //deleting item from history

    static erase(todoId) {
        const sect = this.structure.find(sect => {
            return sect.todos.filter(todo => todo.options.id == todoId).length != 0;
        });

        const deleted = sect.todos.filter(todo => todo.options.id == todoId)[0];
        sect.todos = sect.todos.filter(todo => todo.options.id != todoId);

        return deleted;
    }

    // useful get funtions

    static getHistoryItemById(todoId) {
        return this.allHistoryItems.find(todo => todo.options.id == todoId);
    }

    static getHistorySectionByItem(item) {
        return this.structure.find(sect => sect.todos.filter(todo => todo.options.id == item.options.id).length != 0);
    }

    //rendering item inside section

    static renderHistoryItem(historyItem) {
        const todaysSection = this.historyContainer.querySelector('[data-todays-section]');

        if (!todaysSection) this.historyContainer.prepend(this.structure[0].element);

        this.structure[0].todoContainer.append(historyItem.element);
    }

    static updateCountContainer() {
        this.historyCountCountainer.classList.toggle('opacity-0', this.checkedHistoryItems.length == 0)

        this.historyCount.textContent = this.checkedHistoryItems.length;
    }

    static render() {
        this.historyContainer = document.querySelector('[data-history-container]');
        this.historyCountCountainer = document.querySelector('[data-history-count-container]');
        this.historyCount = document.querySelector('[data-history-count]');
        this.message = this.historyContainer.querySelector('[data-history-message]');

        this.structure.forEach(sect => {
            if (sect.todos.length == 0) return;
            this.historyContainer.append(sect.element);
            sect.renderItems();
        });

        this.updateMessage();
    }

    static updateMessage() {
        if (this.allHistoryItems.length != 0) this.message.classList.add('hidden');
        else this.message.classList.remove('hidden');
    }
}

class HistorySection {
    constructor({
        date,
        todos
    }) {
        this.date = date;
        this.todos = todos;

        this._initElement();
    }

    // getter for a section date heading

    get heading() {
        const dayName = isToday(this.date) ? "Today" : isYesterday(this.date) ?
            "Yesterday" : format(this.date, "iiii");

        return `${dayName}, ${format(this.date, 'dd MMM, yyyy')}`;
    }

    _initElement() {
        this.element = document.createElement('section');

        if (isToday(this.date)) this.element.dataset.todaysSection = '';

        this.element.setAttribute('data-history-section', '');
        this.element.innerHTML = `
            <h4 class="font-semibold mb-1">${this.heading}</h4>
            <div data-history-todo-container>
            </div>
        `;

        this.todoContainer = this.element.querySelector('[data-history-todo-container]');
    }

    delete() {
        console.log(this.todos.length);
        if (this.todos.length == 0) this.element.remove();
    }

    renderItems() {
        this.todos.forEach(historyItem => {
            this.todoContainer.append(historyItem.element);
        })
    }
}

class HistoryItem {
    constructor(options) {
        this.options = options;
        this.element = document.createElement('div');

        this._initElement();
        this._setupDropdown();
    }

    restore() {
        const todo = new Todo(this.options);
        todo.options.completionTime = '';

        let parentSection = App.getSectionById(todo.options.sectionId);

        if (!parentSection) {
            parentSection = App.getSectionById('default-section');
            todo.options.sectionId = 'default-section';
        }

        parentSection.addTodo(todo);
        parentSection.updateCount();

        todo.init();

        todo.render(parentSection.todoHolder);

        App.updateContainer();
    }

    _setupDropdown() {
        const trigger = this.element.querySelector('[data-history-dropdown-toggle]');
        const dropdownElement = document.getElementById('history-item-dropdown');

        this.dropdown = new Dropdown(dropdownElement, trigger, {
            placement: 'right-end',
            offsetSkidding: 0,
            offsetDistance: 10,
            delay: 300,
            onHide: () => {
                trigger.classList.remove('opacity-100', 'bg-dark-200/50');
            },
            onShow: () => {
                trigger.classList.add('opacity-100', 'bg-dark-200/50');
                dropdownElement.dataset.todoId = trigger.dataset.todoId;
            }
        }, {
            id: `${this.options.id}-history-dropdown`,
            override: true
        });
    }

    delete() {
        this.element.remove();
    }

    _initElement() {
        this.element.className = 'flex items-center py-2 cursor-pointer';
        this.element.setAttribute('data-history-item', '');
        this.element.dataset.todoId = this.options.id;
        this.element.innerHTML = `
            <input data-history-check type="checkbox" class="todo-checkbox w-5 h-5">
            <p class="px-4">${this.options.completionTime}</p>
            <h3 class="flex-auto truncate font-medium text-dark-700">${this.options.name}</h3>
            <button data-history-dropdown-toggle data-todo-id="${this.options.id}"
            type = 'button'
            class = "ml-2 [&>svg]:h-5 [&>svg]:w-5 p-1 hover:bg-dark-200/50 transition "
                title='More task options'>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M7 12C7 13.1046 6.10457 14 5 14C3.89543 14 3 13.1046 3 12C3 10.8954 3.89543 10 5 10C6.10457 10 7 10.8954 7 12Z"
                        fill="currentColor"></path>
                    <path
                        d="M14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12Z"
                        fill="currentColor"></path>
                    <path
                        d="M21 12C21 13.1046 20.1046 14 19 14C17.8954 14 17 13.1046 17 12C17 10.8954 17.8954 10 19 10C20.1046 10 21 10.8954 21 12Z"
                        fill="currentColor"></path>
                </svg>
            </button>
        `;
    }
}