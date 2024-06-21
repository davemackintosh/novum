import type { IComponent } from "../abstracts"

export class Canvas2DContext implements IComponent {
	private ctx?: CanvasRenderingContext2D

	constructor(ctx?: CanvasRenderingContext2D) {
		this.ctx = ctx
	}

	public getCtx(): CanvasRenderingContext2D {
		if (!this.ctx) {
			throw new Error("Canvas 2D context not initialized.")
		}
		return this.ctx
	}

	public setCtx(ctx: CanvasRenderingContext2D): void {
		this.ctx = ctx
	}

	public hasCtx(): boolean {
		return !!this.ctx
	}
}
