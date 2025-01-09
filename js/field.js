import { assignId, element, inject, on, removeAttribute, setAttribute, walker } from './utils.js'
import { UIControl, UIElement } from './element.js'

class UIField extends UIElement {
    mount() {
        this.control = this.fieldWalker().find(el => this.isControl(el))

        // Mark native inputs disabled...
        if (this.control && ! (this.control instanceof UIControl) && this.hasAttribute('disabled')) {
            this.control.setAttribute('disabled', '')
        }
    }

    associateLabel(label) {
        on(label, 'click', e => {
            if (['a', 'button'].includes(e.target.localName)) return

            this.focusOrTogggle(this.control)
        })

        setAttribute(this.elOrButton(this.control), 'aria-labelledby', label.id)
    }

    associateDescription(description) {
        setAttribute(this.elOrButton(this.control), 'aria-describedby', description.id)
    }

    fieldWalker() {
        return walker(this, (el, { skip, reject }) => {
            if (el instanceof UIField && el !== this) return reject()
        })
    }

    isControl(el) {
        if (el instanceof UIControl) return true

        if (el.matches('input, textarea, select')) return true

        return false
    }

    focusOrTogggle(control) {
        if (! control) return
        if (control.disabled || control.hasAttribute('disabled')) return

        let isCheckable = (control.localName === 'input' && ['checkbox', 'radio'].includes(control.type))
            || ['ui-switch', 'ui-radio', 'ui-checkbox'].includes(control.localName)

        if (isCheckable) {
            control.click()
            control.focus()
        } else if (control.localName === 'input' && ['file'].includes(control.type)) {
            control.click()
        } else if (['ui-select'].includes(control.localName)) {
            control.trigger().focus()
        } else {
            control.focus()
        }
    }

    elOrButton(el) {
        if (el instanceof UIElement && el.firstElementChild instanceof HTMLButtonElement) return el.firstElementChild
        return el
    }
}

class UILabel extends UIElement {
    mount() {
        assignId(this, 'label')
        setAttribute(this, 'aria-hidden', 'true')
        this.closest('ui-field')?.associateLabel(this)
    }
}

class UIDescription extends UIElement {
    mount() {
        assignId(this, 'description')
        setAttribute(this, 'aria-hidden', 'true')
        this.closest('ui-field')?.associateDescription(this)
    }
}

inject(({ css }) => css`
    ui-label { display: inline-block; cursor: default; user-select: none; }
    ui-description { display: block; }
`)

element('field', UIField)
element('label', UILabel)
element('description', UIDescription)
