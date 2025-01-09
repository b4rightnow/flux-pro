import { assignId, element, interest, on, removeAttribute, setAttribute } from './utils.js'
import { Controllable } from './mixins/controllable.js'
import { Popoverable } from './mixins/popoverable.js'
import { Anchorable } from './mixins/anchorable.js'
import { UIElement } from './element.js'

class UIContext extends UIElement {
    boot() {
        let trigger = this.trigger()
        let overlay = this.overlay()

        this._disabled = this.hasAttribute('disabled')
        this._popoverable = new Popoverable(overlay)
        this._anchorable = new Anchorable(overlay, {
            reference: trigger,
            auto: false,
            position: this.hasAttribute('position') ? this.getAttribute('position') : undefined,
            gap: this.hasAttribute('gap') ? this.getAttribute('gap') : undefined,
            offset: this.hasAttribute('offset') ? this.getAttribute('offset') : undefined,
        })

        on(trigger, 'contextmenu', e => {
            e.preventDefault()

            this._anchorable.reposition(e.pageX, e.pageY)

            this._popoverable.setState(true)

            if (this.hasAttribute('detail')) {
                setAttribute(overlay, 'data-detail', this.getAttribute('detail'))
            }
        })

        if (this.hasAttribute('detail')) {
            setAttribute(overlay, 'data-detail', '')
        }
    }

    trigger() {
        return this.firstElementChild
    }

    overlay() {
        if (this.hasAttribute('target')) {
            let target = this.getAttribute('target')

            return document.getElementById(target)
        } else {
            return this.lastElementChild.matches('[popover]') && this.lastElementChild
        }
    }
}

element('context', UIContext)
