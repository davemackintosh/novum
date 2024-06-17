import { P, match } from "ts-pattern"
import type { IComponent, System } from "../abstracts"
import { QuadrilateralComponent } from "../components/quadrilateral"
import { CanvasPointComponent } from "../components/canvas-point"
import { RasterizedImageComponent } from "../components/rasterized-image"
import { Entity } from "$lib/ecs/entity"

export class DrawingSystem implements System {
	private readonly context: CanvasRenderingContext2D | null = null
	private readonly canvas: HTMLCanvasElement | null = null

	constructor(context: CanvasRenderingContext2D | null, canvas: HTMLCanvasElement | null) {
		if (context === null) {
			console.warn("No context provided to DrawingSystem")
			return
		}

		this.context = context

		if (canvas === null) {
			console.warn("No canvas provided to DrawingSystem")
			return
		}

		this.canvas = canvas
	}

	update(entity: Entity): void {
		if (!this.canvas) {
			console.warn("No canvas provided to DrawingSystem")
			return
		}
		this.context?.clearRect(0, 0, this.canvas.width, this.canvas.height)
		for (const component of entity.getComponents()) {
			match(component)
				.with(P.instanceOf(QuadrilateralComponent), (quad) => this.drawQuadrilateral(quad))
				.with(P.instanceOf(RasterizedImageComponent), (image) => this.renderImage(image))
		}
	}

	accepts(component: IComponent): boolean {
		return match(component)
			.with(P.instanceOf(QuadrilateralComponent), () => true)
			.with(P.instanceOf(CanvasPointComponent), () => true)
			.with(P.instanceOf(RasterizedImageComponent), () => true)
			.otherwise(() => false)
	}

	private renderImage(image: RasterizedImageComponent): void {
		if (!this.context) {
			console.warn("No context provided to DrawingSystem")
			return
		}

		const imageSource = new Image(image.width, image.height)
		imageSource.src = image.icon

		if (image.point) {
			this.context.drawImage(imageSource, image.point.x, image.point.y, image.width!, image.height!)
		}
	}

	private drawQuadrilateral(quadrilateral: QuadrilateralComponent): void {
		if (!this.context) {
			console.warn("No context provided to DrawingSystem")
			return
		}
		if (!quadrilateral.start || !quadrilateral.end) {
			return
		}

		this.context.strokeStyle = quadrilateral.styles.fill

		this.context.beginPath()
		this.context.rect(
			quadrilateral.start.x,
			quadrilateral.start.y,
			quadrilateral.end.x,
			quadrilateral.end.y,
		)
		this.context.stroke()
	}
}
