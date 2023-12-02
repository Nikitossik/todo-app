import {
    Collapse,
    initTE
} from "tw-elements";

import {
    Dropdown,
    initDropdowns
} from "flowbite";

initTE({
    Collapse
});

const dropdownElement = document.getElementById('section-dropdown');

export class DefaultSection {
    constructor({
        todos
    }) {
        this.id = 'default-section';
        this.todos = todos;

        this._initElement();
    }

    _initElement() {
        this.element = document.createElement('section');
        this.element.id = this.id;
        this.element.setAttribute('data-section', '');
        this.element.innerHTML = `
            <div data-todo-container></div>
            <a href="#" class="flex items-center gap-2 py-2 text-lg text-dark-600 group/add"
                data-form-bind="#todo-form">
                <span
                class="transition rounded-full w-5 h-5 flex justify-center items-center text-secondary-600 group-hover/add:bg-secondary-600 group-hover/add:text-white">
                +</span>
                <span class="group-hover/add:text-secondary-700 transition">Add a new task</span>
            </a>
            <a href="#" data-form-bind="#section-form"
                class="block opacity-0 hover:opacity-100 transition text-center relative before:content-[''] before:z-[-1] before:absolute before:left-0 before:top-[50%] before:translate-y-[-50%] before:h-[1.5px] before:w-full before:bg-secondary-400 py-2">
                <span class="px-3 bg-white text-secondary-600 font-semibold">Add section</span>
            </a>
        `;
        this.todoHolder = this.element.querySelector('[data-todo-container]');
    }

    addTodo(todoInstance, fromId = null, before = false) {
        let todoIndex = fromId ? this.todos.findIndex(todo => todo.options.id == fromId) + 1 : this.todos.length;
        todoIndex = before ? todoIndex - 1 : todoIndex;

        this.todos = this.todos.toSpliced(todoIndex, 0, todoInstance);
    }

    deleteTodo(id) {
        const index = this.todos.findIndex(item => item.options.id == id);
        this.todos = this.todos.toSpliced(index, 1);
    }

    getTodoById = (id) => this.todos.find(todo => todo.options.id == id);

    updateCount() {
        if (!this.todoCount) return;

        if (this.todos.length !== 0) {
            this.todoCount.classList.remove('hidden');
            this.todoCount.textContent = this.todos.length;
        } else this.todoCount.classList.add('hidden');
    }

    insert(peer, position = 'afterend') {
        peer.insertAdjacentElement(position, this.element);
    }

    render(parent) {
        parent.append(this.element);
    }
}

export class Section extends DefaultSection {
    constructor({
        name,
        id,
        ...args
    }) {
        super(args);

        this.id = id;
        this.name = name;

        this._initElement();
        this.updateCount();
        this._setupDropdown();
    }

    _initElement() {
        this.element = document.createElement('section');
        this.element.id = this.id;
        this.element.setAttribute('data-section', '');
        this.element.className = 'flex items-start gap-x-2';
        this.element.innerHTML = `
            <button
                    class="group hover:bg-neutral-100 relative flex items-center rounded-none border-0 text-left text-neutral-800 transition [overflow-anchor:none] hover:z-[2] focus:z-[3] focus:outline-none dark:bg-neutral-800 dark:text-white "
                    type="button" data-te-collapse-init data-te-target="#${this.id}-collapse"
                    aria-expanded="false" aria-controls="${this.id}-collapse">
                    <span
                        class="p-1 shrink-0 rotate-[0deg] transition-transform duration-200 ease-in-out group-[[data-te-collapse-collapsed]]:rotate-[-90deg] ">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                stroke-width="1.5" stroke="currentColor" class="h-4 w-4">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                    </span>
                </button>
                <div class="flex-auto">
            <header data-header class="flex items-center border border-t-0 border-x-0 pb-1 border-neutral-200 gap-x-2">
                <h2 data-name-heading class="basis-full mb-0 text-lg font-semibold" id="${this.id}-name">
                    ${this.name}
                    <span data-section-todo-count class='hidden ml-1 py-1 px-2 rounded-full bg-neutral-200 text-dark-600 text-xs' ></span>
                </h2>
                <button type = 'button' data-dropdown-section-toggle data-dropdown-placement="right-end"
                class = "[&>svg]:h-5 [&>svg]:w-5 text-dark-500 p-1 hover:bg-dark-200/50 transition"
                    data-section-id="${this.id}" title='More section options'>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="5" cy="12" r="2" stroke="currentColor" stroke-width="1.5"></circle> 
                        <circle cx="12" cy="12" r="2" stroke="currentColor" stroke-width="1.5"></circle> 
                        <circle cx="19" cy="12" r="2" stroke="currentColor" stroke-width="1.5"></circle>
                    </svg>
                </button>
            </header>
            <div id="${this.id}-collapse" class="!visible border-0" data-te-collapse-item data-te-collapse-show
                aria-labelledby="${this.id}-name" data-te-parent="#${this.id}">
                <div data-todo-container></div>
                <a href="#" class="flex items-center gap-2 py-2 text-lg text-dark-600 group/add"
                    data-form-bind="#todo-form">
                    <span
                        class="transition rounded-full w-5 h-5 flex justify-center items-center text-secondary-600 group-hover/add:bg-secondary-600 group-hover/add:text-white">
                    +</span>
                    <span class="group-hover/add:text-secondary-700 transition">Add a new task</span>
                </a>
            </div>            

            <a href="#" data-form-bind="#section-form"
                class="mt-2 block opacity-0 hover:opacity-100 transition text-center relative before:content-[''] before:z-[-1] before:absolute before:left-0 before:top-[50%] before:translate-y-[-50%] before:h-[1.5px] before:w-full before:bg-secondary-400 py-2">
                <span class="px-3 bg-white text-secondary-600 font-semibold">Add section</span>
            </a>
            </div>
        `;
        this.header = this.element.querySelector('[data-header]');
        this.nameHeading = this.element.querySelector('[data-name-heading]');
        this.todoHolder = this.element.querySelector('[data-todo-container]');
        this.todoCount = this.element.querySelector('[data-section-todo-count]');
    }

    updateName() {
        this.nameHeading.textContent = this.name;
    }

    duplicate() {
        const sectionCopyId = `section${Date.now()}`;
        const sectionCopy = new Section({
            id: sectionCopyId,
            name: this.name,
            todos: this.todos.map(todo => {
                const todoCopy = todo.duplicate();
                todoCopy.options.sectionId = sectionCopyId;
                todoCopy.init();
                return todoCopy;
            })
        });

        return sectionCopy;
    }

    delete() {
        this.element.remove();
    }

    _setupDropdown() {
        const trigger = this.element.querySelector('[data-dropdown-section-toggle]');
        this.dropdown = new Dropdown(dropdownElement, trigger, {
            placement: 'right-end',
            delay: 300,
            onHide: () => {
                trigger.classList.remove('opacity-100', 'bg-gray-200/50');
            },
            onShow: () => {
                dropdownElement.dataset.sectionId = this.id;
                trigger.classList.add('opacity-100', 'bg-gray-200/50');
            }
        });

        initDropdowns();
    }

}