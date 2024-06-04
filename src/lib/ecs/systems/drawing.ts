import { P, match } from "ts-pattern"
import { IComponent, System } from "../abstracts"
import { QuadrilateralComponent } from "../components/quadrilateral"
import { Entity } from "$lib/ecs/entity"

export class DrawingSystem extends System {
	private readonly context: CanvasRenderingContext2D | null = null

	constructor(context: CanvasRenderingContext2D | null) {
		super()
		if (context === null) {
			console.warn("No context provided to DrawingSystem")
			return
		}

		this.context = context
	}

	update(entity: Entity): void {
		for (const component of entity.getComponents()) {
			match(component)
				.with(P.instanceOf(QuadrilateralComponent), (quad) => this.drawQuadrilateral(quad))
				.otherwise(() => {
					console.warn("Unknown component type", component)
				})
		}
	}

	accepts(component: IComponent): boolean {
		return match(component)
			.with(P.instanceOf(QuadrilateralComponent), () => true)
			.otherwise(() => false)
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
