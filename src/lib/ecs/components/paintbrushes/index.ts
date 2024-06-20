import { match } from "ts-pattern";
import type { Vector } from "../drawings";

interface PaintbrushInterface {
	width: number
	color: Vector

	paint(ctx: CanvasRenderingContext2D, point: Vector, lastPoint?: Vector): void;
}

enum PaintbrushType {
	Filbert,
	Fan
}

class PaintbrushComponent implements PaintbrushInterface {
	color: Vector;
	width: number;
	dryness: number
	brushType: PaintbrushType
	brushWidth = 30
	brushLength = 60
	numBristles = 30

	constructor(width: number, color: Vector, brushType: PaintbrushType = PaintbrushType.Filbert, dryness: number = 0.0) {
		this.color = color
		this.width = width
		this.dryness = dryness
		this.brushType = brushType
	}

	paint(ctx: CanvasRenderingContext2D, point: Vector, prevPoint?: Vector): void {
		return match(this.brushType)
			.with(PaintbrushType.Filbert, () => this.paintFilbertStroke(ctx, point, prevPoint))
			.otherwise(() => this.paintFilbertStroke(ctx, point, prevPoint))
	}

	private paintFilbertStroke(ctx: CanvasRenderingContext2D, point: Vector, prevPoint?: Vector): void {
		const mouseX = point.x
		const mouseY = point.y
		const lastX = prevPoint?.x ?? mouseX
		const lastY = prevPoint?.y ?? mouseY

		const dx = mouseX - lastX;
		const dy = mouseY - lastY;
		const angle = Math.atan2(dy, dx);
		const perpendicularAngle = angle + Math.PI / 2;

		// Clear the brush path for smoother strokes
		ctx.globalCompositeOperation = 'source-over';

		for (let i = 0; i < this.numBristles; i++) {
			const offset = (Math.random() - 0.5) * this.brushWidth
			const bristleLength = this.brushLength * (Math.random() * 0.5 + 0.5)

			const brushXStart = lastX + Math.cos(perpendicularAngle) * offset
			const brushYStart = lastY + Math.sin(perpendicularAngle) * offset
			const brushXEnd = brushXStart + Math.cos(angle) * bristleLength
			const brushYEnd = brushYStart + Math.sin(angle) * bristleLength

			ctx.beginPath()
			ctx.moveTo(brushXStart, brushYStart)
			ctx.lineTo(brushXEnd, brushYEnd)
			ctx.strokeStyle = `rgba(0, 0, 0, ${Math.random() * 0.4 + 0.6})`
			ctx.lineWidth = Math.random() * 2 + 1
			ctx.stroke()
		}
	}
}

export {
	PaintbrushComponent,
	type PaintbrushInterface,
}
