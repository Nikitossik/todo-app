import '../index.html';
import '../css/style.css';

import {
    initTE,
    Input,
    Offcanvas,
    Dropdown,
    Rating,
    Chip,
    Datepicker,
    Timepicker,
    Modal,
    Tooltip,
    Collapse
} from "tw-elements";

import {
    format,
    isPast
} from 'date-fns';

import App from './App.js';
import History from './History.js';
import Todo from './Todo.js';
import {
    AddTodoForm,
    EditTodoForm,
    ModalTodoForm
} from './forms/TodoForms.js';

import {
    AddSectionForm,
    EditSectionForm
} from './forms/SectionForms.js';

import {
    defaultDatepickerOptions,
    defaultDatepickerClasses,
    defaultTimepickerOptions,
    defaultTimepickerClasses
} from './defaultComponentConfigs.js';

import {
    updatePriorityPicks,
    updateDiffRating,
    hideRatingStars,
    updateDatepicker,
    updateTimepicker
} from './helpers.js'

//initializing interfaces on content load

document.addEventListener("DOMContentLoaded", () => {

    initTE({
        Chip,
        Offcanvas,
        Rating,
        Input,
        Dropdown,
        Datepicker,
        Timepicker,
        Modal,
        Tooltip,
        Collapse
    });

    App.initStructure();
    App.renderTodos();
    App.initTodoClock();
    History.initStructure();
    History.render();
});

window.addEventListener("unload", () => {
    App.setLocalStructure();
    History.setLocalStructure();
});

const todoDatepickers = document.querySelectorAll('[data-todo-date]');
const todoTimepickers = document.querySelectorAll('[data-todo-time]');
const todoDiffRatings = document.querySelectorAll('[data-todo-diff]');

const todoModalEl = document.getElementById('todo-modal');
const todoName = todoModalEl.querySelector('[data-todo-name]');
const todoDesc = todoModalEl.querySelector('[data-todo-description]');
const todoCheck = todoModalEl.querySelector('[data-todo-check]');

// priority pick handling

document.addEventListener('click', (e) => {
    const target = e.target.closest('.priority-pick');

    if (!target) return;

    const {
        priority
    } = target.dataset;

    const parent = target.closest('[data-todo-id]');

    const currentTodoId = target.closest('[data-todo-id]').dataset.todoId;
    const currentTodo = App.getTodoItemById(currentTodoId);
    updatePriorityPicks(parent, priority);
    currentTodo.save({
        priority
    });
    currentTodo.updatePriority();
})

//initializing global difficulty ratings

todoDiffRatings.forEach(diffRatingEl => {

    if (diffRatingEl.id == 'todo-form-difficulty') return;

    // if rating is outside todo-form -> save value on change

    diffRatingEl.addEventListener('onSelect.te.rating', (e) => {
        const {
            value,
            target
        } = e;
        const currentTodoId = target.closest('[data-todo-id]').dataset.todoId;
        const currentTodo = App.getTodoItemById(currentTodoId);

        currentTodo.save({
            difficulty: value
        });

        currentTodo.updateDifficulty();

    });
});

//initializing global datepickers

todoDatepickers.forEach(datepickerEl => {
    new Datepicker(datepickerEl, defaultDatepickerOptions, defaultDatepickerClasses);

    if (datepickerEl.id == 'todo-form-date') return;

    // if datepicker is outside todo-form -> save value on change

    datepickerEl.addEventListener('dateChange.te.datepicker', (e) => {

        const endDate = format(new Date(e.date), 'iii, dd MMM, yyyy');
        const currentTodoId = e.target.closest('[data-todo-id]').dataset.todoId;
        const currentTodo = App.getTodoItemById(currentTodoId);

        currentTodo.save({
            endDate
        });

        currentTodo.save({
            expired: isPast(currentTodo.expireDate)
        });

        console.log(currentTodo.expireDate, isPast(currentTodo.expireDate));

        currentTodo.updateDate();
        currentTodo.updateExpire();
    });
});

//initializing global timepickers


todoTimepickers.forEach(timepickerEl => {

    new Timepicker(timepickerEl, defaultTimepickerOptions, defaultTimepickerClasses);

    if (timepickerEl.id == 'todo-form-time') return;

    // if timepicker is outside todo-form -> save value on change

    timepickerEl.addEventListener('input.te.timepicker', (e) => {
        const currentTodoId = e.target.closest('[data-todo-id]').dataset.todoId;
        const currentTodo = App.getTodoItemById(currentTodoId);
        let newDate = currentTodo.options.endDate;

        newDate = newDate ? newDate : format(new Date(), 'iii, dd MMM, yyyy');

        currentTodo.save({
            endDate: newDate,
            endTime: e.target.value
        });

        currentTodo.save({
            expired: isPast(currentTodo.expireDate)
        });

        updateDatepicker(timepickerEl.closest('[data-todo-id]').querySelector('[data-todo-property="endDate"]'), newDate);

        currentTodo.updateDate();
        currentTodo.updateTime();
        currentTodo.updateExpire();
    });
});

// handling click on chip cross: 

document.addEventListener('click', (e) => {
    const target = e.target.closest('.chip-close');

    if (!target || !target.closest('[data-todo-id]')) return;

    const chip = target.closest('.chip');

    const currentTodoId = target.closest('[data-todo-id]').dataset.todoId;
    const currentTodo = App.getTodoItemById(currentTodoId);
    const todoProperty = chip.dataset.todoProperty;

    currentTodo.save({
        [todoProperty]: todoProperty == 'difficulty' ? 0 : '',
    });

    if (todoProperty == 'endDate') currentTodo.save({
        endTime: '',
    });

    currentTodo.save({
        expired: isPast(currentTodo.expireDate)
    });

    currentTodo.update();

    if (todoProperty == 'difficulty') updateDiffRating(chip, 0);
    else if (todoProperty == 'endDate') {
        updateDatepicker(chip, '');
        updateTimepicker(chip.closest('[data-todo-id]').querySelector('[data-todo-property="endTime"]'), '');
    } else updateTimepicker(chip, '');

});

// calling add form for todo and section

document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-form-bind]');

    if (!target) return;

    const formId = target.dataset.formBind;
    const sectionId = target.closest('[data-section]').id;

    if (formId == '#todo-form') {
        const addForm = new AddTodoForm({
            anchor: target,
            toggleAnchor: true,
            sectionId
        });
    } else new AddSectionForm({
        anchor: target,
        sectionId
    });
});

// calling edit form for todo

document.addEventListener('click', e => {
    const target = e.target.closest('[data-todo-action]');

    if (!target) return;

    const {
        todoAction,
        position = 'afterend'
    } = target.dataset;

    const {
        todoId,
        sectionId
    } = target.closest('[data-todo-id]').dataset;

    const currentSection = App.getSectionById(sectionId);
    const currentTodo = currentSection.getTodoById(todoId);
    const dropdownInstance = currentTodo.dropdown;

    switch (todoAction) {
        case 'addTodo':
            new AddTodoForm({
                anchor: currentTodo.element,
                position,
                sectionId
            });
            break;

        case 'editTodo':
            new EditTodoForm({
                anchor: currentTodo.element,
                position,
                toggleAnchor: true,
                sectionId
            });
            break;

        case 'duplicateTodo':
            const todoCopy = currentTodo.duplicate();
            currentSection.addTodo(todoCopy, currentTodo.options.id);
            currentSection.updateCount();
            todoCopy.init();
            todoCopy.insert(currentTodo.element, position);
            break;

        case 'deleteTodo':
            currentSection.deleteTodo(todoId);
            currentSection.updateCount();
            currentTodo.delete();
            App.updateContainer();
            break;

        default:
            break;
    }
    dropdownInstance.hide();
});

//completing the task

document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-todo-check]');

    if (!target) return;

    const {
        todoId,
        sectionId
    } = target.closest('[data-todo-id]').dataset;

    const currentSection = App.getSectionById(sectionId);
    const currentTodo = currentSection.getTodoById(todoId);

    currentTodo.options.completionTime = format(new Date(), 'hh:mm');

    const historyItem = History.record(currentTodo);

    History.renderHistoryItem(historyItem);
    History.updateMessage();

    currentSection.deleteTodo(todoId);
    currentSection.updateCount();
    currentTodo.delete();
    App.updateContainer();

    const modal = Modal.getOrCreateInstance(todoModalEl);

    modal.hide();

});

// actions related to history items

document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-history-action]');

    if (!target) return;

    const {
        historyAction
    } = target.dataset;

    console.log(historyAction);

    if (historyAction != 'restoreItem' && historyAction != 'deleteItem') return;

    const historyDropdown = target.closest('[data-todo-id]');
    const todoId = historyDropdown.dataset.todoId;
    const historyItem = History.getHistoryItemById(todoId);
    const HistorySection = History.getHistorySectionByItem(historyItem);

    if (historyAction == 'restoreItem') {
        historyItem.restore();
    }

    History.erase(todoId);
    historyItem.delete();
    HistorySection.delete();
    historyItem.dropdown.hide();

    History.updateCountContainer();
    History.updateMessage();
});

//restoring or deleting picked history items

document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-history-action]');

    if (!target) return;

    const {
        historyAction
    } = target.dataset;

    if (historyAction == 'restoreItem' || historyAction == 'deleteItem') return;

    History.checkedHistoryItems.forEach(item => {

        if (historyAction == 'uncheckItems') {
            item.checked = false;
            console.log(item)
            item.element.querySelector('[data-history-check]').checked = false;
        } else {

            if (historyAction == 'restoreItems') {
                item.restore();
            }
            const historySection = History.getHistorySectionByItem(item);
            History.erase(item.options.id);
            item.delete();
            historySection.delete();
        }
    });
    History.updateCountContainer();
    History.updateMessage();
})


// picking history items

document.addEventListener('click', (e) => {
    const button = e.target.closest('[data-history-dropdown-toggle]');

    if (button) return;

    const historyElement = e.target.closest('[data-history-item]');

    if (!historyElement) return;

    const historyElementCheck = historyElement.querySelector('[data-history-check]');

    if (e.target != historyElementCheck) historyElementCheck.checked = !historyElementCheck.checked;

    const historyItem = History.getHistoryItemById(historyElement.dataset.todoId);

    historyItem.checked = historyElementCheck.checked;

    History.updateCountContainer();
});

// calling edit form for section

document.addEventListener('click', e => {
    const target = e.target.closest('[data-section-action]');

    if (!target) return;

    const {
        sectionAction,
        position = 'afterend'
    } = target.dataset;

    const {
        sectionId
    } = target.closest('[data-section-id]').dataset;

    const currentSection = App.getSectionById(sectionId);
    const dropdownInstance = currentSection.dropdown;

    switch (sectionAction) {
        case 'editSection':
            new EditSectionForm({
                anchor: currentSection.header,
                position,
                toggleAnchor: true,
                sectionId
            });
            break;
        case 'duplicateSection':
            const sectionCopy = currentSection.duplicate();
            App.addSection(sectionCopy, currentSection.id);
            sectionCopy.insert(currentSection.element);
            sectionCopy.todos.forEach(todo => todo.render(sectionCopy.todoHolder));
            break;

        case 'deleteSection':
            App.deleteSection(currentSection.id);
            currentSection.delete();
            App.updateContainer();
            break;

        default:
            break;
    }
    dropdownInstance.hide();

});

//showing todo-modal on item click

document.addEventListener('click', (e) => {
    const todoHolder = e.target.closest('.todo-holder');

    if (!todoHolder) return;

    const modalIgnore = e.target.closest('[data-modal-ignore]');

    if (modalIgnore) return;
    todoModalEl.dataset.todoId = todoHolder.id;
    todoModalEl.dataset.sectionId = todoHolder.dataset.sectionId;

    Modal.getOrCreateInstance(todoModalEl).show();
});

//loading todo data on modal show

todoModalEl.addEventListener('show.te.modal', (e) => {

    if (window.activeModalForm) {
        window.activeModalForm.close();
        window.activeModalForm = null;
    }

    const currentTodoId = todoModalEl.dataset.todoId;
    const currentTodoOptions = App.getTodoItemById(currentTodoId).options;

    todoName.textContent = currentTodoOptions.name;
    todoDesc.textContent = currentTodoOptions.description;

    todoCheck.dataset.priority = currentTodoOptions.priority;
    todoCheck.checked = false;

    updatePriorityPicks(todoModalEl, currentTodoOptions.priority);
    updateDiffRating(todoModalEl, currentTodoOptions.difficulty);
    updateDatepicker(todoModalEl, currentTodoOptions.endDate);
    updateTimepicker(todoModalEl, currentTodoOptions.endTime);
});

// showing save modal form on item click

todoModalEl.addEventListener('click', (e) => {
    const target = e.target.closest('[data-modal-form-anchor]');

    if (!target) return;

    new ModalTodoForm({
        anchor: target
    });
});