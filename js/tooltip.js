import { assignId, element, inject, interest, isUsingMouse, removeAttribute, setAttribute } from './utils.js'
import { Popoverable } from './mixins/popoverable.js'
import { Anchorable } from './mixins/anchorable.js'
import { UIElement } from './element.js'

class UITooltip extends UIElement {
    boot() {
        let type = this.hasAttribute('label') ? 'label' : 'description'
        let button = this.button()
        let overlay = this.overlay()

        if (! button) {
            return console.warn('ui-tooltip: no trigger element found', this)
        } else if (! overlay) {
            // Let's not warn here in case the user is conditionally rendering tooltip contents...
            return
        }

        this._disabled = this.hasAttribute('disabled')
        overlay._popoverable = new Popoverable(overlay)
        overlay._anchorable = new Anchorable(overlay, {
            reference: button,
            position: this.hasAttribute('position') ? this.getAttribute('position') : undefined,
            gap: this.hasAttribute('gap') ? this.getAttribute('gap') : undefined,
            offset: this.hasAttribute('offset') ? this.getAttribute('offset') : undefined,
        })

        overlay._popoverable.onChange(() => overlay._anchorable.reposition())

        if (! this._disabled) {
            // Tooltips don't show on mobile...

            // On desktop, open on hover...
            interest(button, overlay, {
                gain() { overlay._popoverable.setState(true) },
                lose() { overlay._popoverable.setState(false) },
                focusable: true,
            })
        }

        let id = assignId(overlay, 'tooltip')

        setAttribute(button, 'aria-controls', id)
        setAttribute(button, 'aria-expanded', 'false')

        overlay._popoverable.onChange(() => {
            overlay._popoverable.getState()
                ? setAttribute(button, 'aria-expanded', 'true')
                : setAttribute(button, 'aria-expanded', 'false')
        })

        if (type === 'label') setAttribute(button, 'aria-labelledby', id)
        else setAttribute(button, 'aria-describedby', id)

        setAttribute(overlay, 'role', 'tooltip')
    }

    button() {
        return this.firstElementChild
    }

    overlay() {
        return this.lastElementChild !== this.button() && this.lastElementChild
    }
}

element('tooltip', UITooltip)
