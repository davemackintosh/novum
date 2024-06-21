import { match } from "ts-pattern"
import { Vector } from "../drawings"

interface PaintbrushStroke {
	points: Vector[]
	brush: PaintbrushInterface
}

interface PaintbrushStyles {
	width: number
	height: number
	pressure: number
	color: Vector
	brushType: PaintbrushType

	rotation?: number
	dryness?: number
	bristleDensity?: number
}

interface PaintbrushInterface {
	paint(
		ctx: CanvasRenderingContext2D,
		styles: PaintbrushStyles,
		point: Vector,
		lastPoint?: Vector,
	): void
}

enum PaintbrushType {
	Filbert,
	Fan,
}

class PaintbrushStylesComponent implements PaintbrushStyles {
	width: number
	height: number
	pressure: number
	color: Vector
	brushType: PaintbrushType
	rotation?: number | undefined
	dryness?: number | undefined
	bristleDensity?: number | undefined

	constructor(styles: PaintbrushStyles) {
		this.width = styles.width
		this.height = styles.height
		this.pressure = styles.pressure
		this.color = styles.color
		this.brushType = styles.brushType
		this.rotation = styles.rotation
		this.dryness = styles.dryness
		this.bristleDensity = styles.bristleDensity
	}
}

class PaintbrushComponent implements PaintbrushInterface {
	paint(
		ctx: CanvasRenderingContext2D,
		styles: PaintbrushStyles,
		point: Vector,
		prevPoint?: Vector,
	): void {
		return match(styles.brushType)
			.with(PaintbrushType.Filbert, () =>
				this.paintFilbertStroke(ctx, styles, point, prevPoint),
			)
			.otherwise(() => this.paintFilbertStroke(ctx, styles, point, prevPoint))
	}

	private paintFilbertStroke(
		ctx: CanvasRenderingContext2D,
		styles: PaintbrushStyles,
		point: Vector,
		prevPoint?: Vector,
	): void {
		const mouseX = point.x
		const mouseY = point.y
		const lastX = prevPoint?.x ?? mouseX
		const lastY = prevPoint?.y ?? mouseY

		const dx = mouseX - lastX
		const dy = mouseY - lastY
		const angle = Math.atan2(dy, dx)
		const perpendicularAngle = angle + Math.PI / 2

		// Clear the brush path for smoother strokes
		ctx.globalCompositeOperation = "source-over"

		const numBristles = styles.bristleDensity ?? 75

		for (let i = 0; i < numBristles; i++) {
			const offset = (Math.random() - 0.5) * styles.width
			const bristleLength = styles.height * (Math.random() * 0.5 + 0.5)

			const brushXStart = lastX + Math.cos(perpendicularAngle) * offset
			const brushYStart = lastY + Math.sin(perpendicularAngle) * offset
			const brushXEnd = brushXStart + Math.cos(angle) * bristleLength
			const brushYEnd = brushYStart + Math.sin(angle) * bristleLength

			ctx.beginPath()
			ctx.moveTo(brushXStart, brushYStart)
			ctx.lineTo(brushXEnd, brushYEnd)
			ctx.strokeStyle = styles.color.toRGBAString(styles.dryness ?? 1)
			ctx.lineWidth = Math.random() * 2 + 1
			ctx.stroke()
		}
	}
}

export {
	PaintbrushComponent,
	PaintbrushStylesComponent,
	PaintbrushType,
	type PaintbrushInterface,
	type PaintbrushStyles,
	type PaintbrushStroke,
}
