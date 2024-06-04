import { DrawableStyles, Vector } from "./drawings"
import { IComponent } from "$lib/ecs/abstracts"

export class QuadrilateralComponent extends IComponent {
	public start?: Vector
	public end?: Vector
	public styles: DrawableStyles

	constructor(start?: Vector, end?: Vector, styles: DrawableStyles = new DrawableStyles()) {
		super()
		this.start = start
		this.end = end
		this.styles = styles
	}
}
