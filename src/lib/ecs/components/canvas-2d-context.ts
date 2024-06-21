import type { IComponent } from "../abstracts"

export class Canvas2DContext implements IComponent {
	public ctx: CanvasRenderingContext2D

	constructor(ctx: CanvasRenderingContext2D) {
		this.ctx = ctx
	}
}
