import { type IComponent } from "../abstracts";
import type { Vector } from "./drawings";

interface PaintbrushInterface {
	renderAtPoint(point: Vector): void;
}

class PaintbrushComponent implements IComponent, PaintbrushInterface {
	width: number
	color: Vector

	constructor(width: number, color: Vector) {
		this.width = width
		this.color = color
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	renderAtPoint(_: Vector): void {
		console.warn("renderAtPoint called on base paintbrush class, not on actual paintbrush")
	}
}

export {
	type PaintbrushInterface,
	PaintbrushComponent,
}
