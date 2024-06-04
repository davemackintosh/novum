import { P, match } from "ts-pattern";
import { IComponent, Entity, System } from "$lib/ecs"
import { Quadrilateral } from "$lib/ecs/components/drawings";

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

	update(entity: Entity, component: IComponent): void {
		console.log("update", entity, component)
		for (const component of entity.getComponents()) {
			console.log(1)
			match(component)
				.with(P.instanceOf(Quadrilateral), this.drawQuadrilateral)
				.otherwise(() => {
					console.warn("Unknown component type", component)
				})
		}
	}

	accepts(component: IComponent): boolean {
		return match(component)
			.with({ name: "Quadrilateral" }, () => true)
			.otherwise(() => false)
	}

	private drawQuadrilateral(quadrilateral: Quadrilateral): void {
		if (!this.context) {
			console.warn("No context provided to DrawingSystem")
			return
		}
		this.context.strokeStyle = quadrilateral.styles.fill

		this.context.beginPath()
		this.context.moveTo(quadrilateral.start.x, quadrilateral.start.y)
		this.context.lineTo(quadrilateral.end.x, quadrilateral.end.y)
		this.context.closePath()
		this.context.stroke()
	}
}
