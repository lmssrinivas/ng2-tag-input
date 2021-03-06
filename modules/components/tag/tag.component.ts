import {
    Component,
    Input,
    Output,
    EventEmitter,
    TemplateRef,
    ElementRef,
    Renderer,
    HostListener,
    ViewChild
} from '@angular/core';

import { TagModel } from '../helpers/accessor';
import { TagRipple } from './tag-ripple.component';

@Component({
    selector: 'tag',
    templateUrl: './tag.template.html',
    styleUrls: [ './tag-component.style.scss' ]
})
export class TagComponent {
    /**
     * @name model {TagModel}
     */
    @Input() public model: TagModel;

    /**
     * @name readonly {boolean}
     */
    @Input() public readonly: boolean;

    /**
     * @name removable {boolean}
     */
    @Input() public removable: boolean;

    /**
     * @name editable {boolean}
     */
    @Input() public editable: boolean;

    /**
     * @name template {TemplateRef<any>}
     */
    @Input() public template: TemplateRef<any>;

    /**
     * @name displayBy {string}
     */
    @Input() private displayBy: string;

    /**
     * @name identifyBy {string}
     */
    @Input() private identifyBy: string;

    /**
     * @name index {number}
     */
    @Input() index: number;

    /**
     * @name onSelect
     * @type {EventEmitter<TagModel>}
     */
    @Output() public onSelect: EventEmitter<TagModel> = new EventEmitter<TagModel>();

    /**
     * @name onRemove
     * @type {EventEmitter<TagModel>}
     */
    @Output() public onRemove: EventEmitter<TagModel> = new EventEmitter<TagModel>();

    /**
     * @name onBlur
     * @type {EventEmitter<TagModel>}
     */
    @Output() public onBlur: EventEmitter<TagModel> = new EventEmitter<TagModel>();

    /**
     * @name onKeyDown
     * @type {EventEmitter<any>}
     */
    @Output() public onKeyDown: EventEmitter<any> = new EventEmitter<any>();

    /**
     * @name onTagEdited
     * @type {EventEmitter<any>}
     */
    @Output() public onTagEdited: EventEmitter<TagModel> = new EventEmitter<TagModel>();

    /**
     * @name editModeActivated
     * @type {boolean}
     */
    private editModeActivated: boolean = false;

    /**
     * @name rippleState
     * @type {string}
     */
    private rippleState: string = 'none';

    /**
     * @name ripple {TagRipple}
     */
    @ViewChild(TagRipple) public ripple: TagRipple;

    constructor(public element: ElementRef, public renderer: Renderer) {}

    /**
     * @name select
     */
    public select($event?: MouseEvent): void {
        if (this.readonly) {
            return;
        }

        if ($event) {
            $event.stopPropagation();
        }

        this.focus();

        this.onSelect.emit(this.model);
    }

    /**
     * @name remove
     */
    public remove(): void {
        this.onRemove.emit(this);
    }

    /**
     * @name focus
     */
    public focus(): void {
        this.renderer.invokeElementMethod(this.element.nativeElement, 'focus');
    }

    /**
     * @name keydown
     * @param event
     */
    @HostListener('keydown', ['$event'])
    public keydown(event: KeyboardEvent): void {
        if (this.editModeActivated) {
            event.keyCode === 13 ? this.disableEditMode(event) : this.storeNewValue();
            return;
        }

        this.onKeyDown.emit({event, model: this.model});
    }

    /**
     * @name blink
     */
    public blink(): void {
        const classList = this.element.nativeElement.classList;
        classList.add('blink');
        setTimeout(() => classList.remove('blink'), 50);
    }

    /**
     * @name toggleEditMode
     */
    public toggleEditMode(): void {
        if (this.editModeActivated) {
            this.storeNewValue();
        } else {
            this.element.nativeElement.querySelector('[contenteditable]').focus();
        }

        this.editModeActivated = !this.editModeActivated;
        this.renderer.setElementClass(this.element.nativeElement, 'tag--editing', this.editModeActivated);
    }

    /**
     * @name getDisplayValue
     * @param item
     * @returns {string}
     */
    public getDisplayValue(item: TagModel): string {
        return typeof item === 'string' ? item : item[this.displayBy];
    }

    /**
     * @name getContentEditableText
     * @returns {string}
     */
    private getContentEditableText(): string {
        return this.element.nativeElement.querySelector('[contenteditable]').innerText.trim();
    }

    /**
     * @name disableEditMode
     * @param $event
     */
    private disableEditMode($event: KeyboardEvent): void {
        this.editModeActivated = false;
        $event.preventDefault();
    }

    /**
     * @name storeNewValue
     */
    private storeNewValue(): void {
        const input = this.getContentEditableText();

        const exists = (model: TagModel) => {
            return typeof model === 'string' ?
                model === input :
                model[this.identifyBy] === input;
        };

        // if the value changed, replace the value in the model
        if (exists(this.model)) {
            const itemValue = this.model[this.identifyBy];

            this.model = typeof this.model === 'string' ? input :
                {[this.identifyBy]: itemValue, [this.displayBy]: itemValue};

            // emit output
            this.onTagEdited.emit(this.model);
        }
    }

    /**
     * @name isDeleteIconVisible
     * @returns {boolean}
     */
    private isDeleteIconVisible(): boolean {
        return !this.readonly && this.removable && !this.editModeActivated;
    }

    /**
     * @name isRippleVisible
     * @returns {boolean}
     */
    private isRippleVisible(): boolean {
        return !this.readonly && !this.editModeActivated;
    }
}
