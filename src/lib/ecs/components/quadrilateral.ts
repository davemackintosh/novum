import { DrawableStyles, Vector } from "./drawings"
import { type IComponent } from "$lib/ecs/abstracts"

export class QuadrilateralComponent implements IComponent {
	public start?: Vector
	public end?: Vector
	public styles: DrawableStyles

	constructor(
		start?: Vector,
		end?: Vector,
		styles: DrawableStyles = new DrawableStyles(),
	) {
		this.start = start
		this.end = end
		this.styles = styles
	}
}
