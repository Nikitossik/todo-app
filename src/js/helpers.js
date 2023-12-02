// this file contains helper functions used in different parts of code

import {
    Rating,
    initTE
} from "tw-elements";

initTE({
    Rating,
}, {
    allowReinits: true
});

/*
    function detects either a device is mobile or desctop
    it's used to change default component configs, either they must be inline or not
*/

export function detectMob() {
    const toMatch = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i
    ];

    return toMatch.some((toMatchItem) => {
        return navigator.userAgent.match(toMatchItem);
    });
}

// updating separate components

export function updateDatepicker(parent, date) {

    const datepickerInput = parent.querySelector('[data-todo-date] .datepicker-input');
    datepickerInput.value = date;
    datepickerInput.setAttribute('value', date);
}

export function updateTimepicker(parent, time) {

    const timepickerInput = parent.querySelector('[data-todo-time] .datepicker-input');

    timepickerInput.value = time;
    timepickerInput.setAttribute('value', time);
}

export function updatePriorityPicks(parent, priority) {

    const currentDiffPick = parent.querySelector(`.priority-pick[data-priority="${priority}"]`);
    const activeDiffPicks = parent.querySelectorAll(`.priority-pick--active`);

    activeDiffPicks.forEach(pick => pick.classList.remove('priority-pick--active'));
    currentDiffPick.classList.add('priority-pick--active');

    const diffRatingEl = parent.querySelector('[data-todo-diff]');

    diffRatingEl.dataset.priority = priority;
}

export function updateDiffRating(parent, diff) {
    const diffRatingEl = parent.querySelector('[data-todo-diff]');

    let ratingInstance = Rating.getInstance(diffRatingEl);

    if (diff == 0) {
        ratingInstance = new Rating(diffRatingEl);
        hideRatingStars(diffRatingEl);
    } else ratingInstance = new Rating(diffRatingEl, {
        value: diff
    })

    return ratingInstance;
}

export function hideRatingStars(diffRatingEl) {
    const svgsFilled = diffRatingEl.querySelectorAll('.fill-current');
    svgsFilled.forEach(svg => svg.classList.remove('fill-current'));
}