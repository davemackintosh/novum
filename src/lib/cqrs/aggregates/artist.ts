import { Aggregate, AggregateError } from "$lib/cqrs";
import { P, match } from "ts-pattern";
import { type DrawingEvents, type ArtistCommands, JoinCommand, JoinEvent, LeaveCommand, LeaveEvent, DestroyArtistsArt, StartDrawingCommand, StartLineEvent, StartQuadrilateralEvent, EndDrawingCommand, EndLineEvent, EndQuadrilateralEvent, NewLayerCommand, NewLayerEvent } from "../../../types/commands-events";
import { Line, Quadrilateral } from "../../ecs/components/drawings";
import type { ECS } from "$lib/ecs";

export class ArtistAggregator extends Aggregate<DrawingEvents, ArtistCommands> {
	private readonly ecs: ECS

	constructor(ecs: ECS) {
		super("artists", 1)

		this.ecs = ecs
	}

	handle_command(aggregateId: string, command: ArtistCommands): DrawingEvents[] {
		console.info("handling command", aggregateId, command)
		return match(command)
			.with(P.instanceOf(JoinCommand), (command: JoinCommand) => {
				return [
					new JoinEvent(command.userName, command.userId)
				]
			})
			.with(P.instanceOf(LeaveCommand), (command: LeaveCommand) => {
				const events: DrawingEvents[] = [new LeaveEvent(command.userName, command.userId)]

				if (command.destroy) {
					events.push(new DestroyArtistsArt(command.userId))
				}

				return events
			})
			.with(P.instanceOf(StartDrawingCommand), (command: StartDrawingCommand) => {
				const drawingEntity = this.ecs.createEntity()
				return match(command.type)
					.with(P.instanceOf(Line), () => {
						return [new StartLineEvent(command.userId, command.x, command.y, command.color, command.width)]

					})
					.with(P.instanceOf(Quadrilateral), () => {
						return [new StartQuadrilateralEvent(command.userId, command.x, command.y, command.color, command.width)]

					})
					.otherwise(() => {
						throw new AggregateError("Unknown draw command: " + command)
					})
			})
			.with(P.instanceOf(NewLayerCommand), (command: NewLayerCommand) => {
				return [new NewLayerEvent(command.name)]
			})
			.with(P.instanceOf(EndDrawingCommand), (command: EndDrawingCommand) => {
				return match(command.type)
					.with(P.instanceOf(Line), () => {
						return [new EndLineEvent(command.userId, command.x, command.y, command.color, command.width)]

					})
					.with(P.instanceOf(Quadrilateral), () => {
						return [new EndQuadrilateralEvent(command.userId, command.x, command.y, command.color, command.width)]

					})
					.otherwise(() => {
						throw new AggregateError("Unknown draw command: " + command)
					})
			})
			.otherwise(() => {
				console.error("Unknown command", command)
				throw new AggregateError("Unknown command")
			})
	}
}
