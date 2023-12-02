import Todo from './Todo.js';
import {
    Section,
    DefaultSection
} from './Sections.js';
import {
    isPast
} from 'date-fns';

export default class App {

    static get allTodos() {
        return this.structure.reduce((acc, sect) => [...sect.todos, ...acc], []);
    }

    static getLocalStructure() {
        let structure = [];
        if (localStorage.hasOwnProperty('structure')) {
            let data = localStorage.getItem('structure');
            structure = JSON.parse(data);
        }
        return Array.from(structure);
    }

    static setLocalStructure() {

        const structure = this.structure.map(({
            todos,
            name,
            id
        }) => {
            return {
                todos: todos.map(todo => todo.options),
                name,
                id
            }
        });
        localStorage.setItem('structure', JSON.stringify(structure));
    }

    static initStructure() {
        this.structure = [...this.getLocalStructure()];

        if (this.structure.length == 0) {
            this.structure[0] = new DefaultSection({
                todos: []
            });
            return;
        }

        this.structure.forEach((sectionOptions, ind) => {
            if (ind == 0) this.structure[ind] = new DefaultSection(sectionOptions);
            else this.structure[ind] = new Section(sectionOptions);

            this.structure[ind].todos = this.structure[ind].todos.map(todo => new Todo(todo));
        });
    }

    // function checks if there are other new expired todos 

    static checkExpiredTodos() {
        const expiredTodos = this.allTodos.filter(todo => {
            if (todo.expired || !todo.options.endDate) return false;
            return isPast(todo.expireDate);
        }).forEach(todo => {
            todo.save({
                expired: true
            });

            todo.updateExpire();
        });
        return expiredTodos;
    }

    // setting clock every second to detect expired todos

    static initTodoClock() {

        const checkFun = this.checkExpiredTodos.bind(this);

        checkFun()

        this.todoClock = setTimeout(function testFn() {
            checkFun()
            this.todoClock = setTimeout(testFn, 1000);
        }, 1000);
    }

    static getSectionById = (id) => this.structure.find(sect => {
        return sect.id == id
    });

    static getTodoItemById = (id) => {
        let todo = null
        this.structure.forEach(sect => {
            if (sect.getTodoById(id)) todo = sect.getTodoById(id);
        });
        return todo;
    }

    static addSection(sectionInstance, fromId = null) {
        let sectIndex = fromId ? this.structure.findIndex(sect => sect.id == fromId) + 1 : this.sect.length;
        this.structure = this.structure.toSpliced(sectIndex, 0, sectionInstance);
    }

    static deleteSection(sectionId) {
        this.structure = this.structure.filter((sect) => sect.id !== sectionId);
    }

    static deleteTodo(id) {
        const index = this.todoItems.findIndex(item => item.options.id == id);
        this.todoItems = this.todoItems.toSpliced(index, 1);
    }

    static renderTodos() {

        this.mainContainer = document.querySelector('[data-main-container]');
        this.mainContainer.innerHTML = '';

        this.structure.forEach(section => {
            section.render(this.mainContainer);
            section.todos.forEach(todo => {
                todo.init();
                todo.render(section.todoHolder);
            });
        });

        this.updateContainer();
    }

    static updateContainer() {
        const todosCount = this.structure.reduce((acc, sect) => acc + sect.todos.length, 0);

        this.messageContainer = document.querySelector('[data-main-message]');

        if (todosCount == 0 && this.structure.length == 1) this.messageContainer.classList.remove('hidden');
        else this.messageContainer.classList.add('hidden');
    }
}