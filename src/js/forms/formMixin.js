// this mixin contains common functions all forms use

const formMixin = {
    _render() {
        if (this.toggleAnchor) this.anchor.classList.add('hidden');

        this.element.classList.remove('hidden');

        if (this.classes) this.element.classList.add(...this.classes);

        this.anchor.insertAdjacentElement(this.position, this.element);
    },

    close() {
        if (this.toggleAnchor) this.anchor.classList.remove('hidden');

        this.element.classList.add('hidden');

        if (this.classes) this.element.classList.remove(...this.classes);

        document.body.insertAdjacentElement('beforeend', this.element);

        if (this._setDefaultValues) this._setDefaultValues();

        this._removeListeners();
    },

    _disableButton(input, button) {
        if (!input || !button) return;

        button.disabled = input.value == '';
    }
};

export default formMixin;