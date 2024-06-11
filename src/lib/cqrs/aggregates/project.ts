import { P, match } from "ts-pattern"
import { Aggregate, AggregateError, type Metadata } from "$lib/cqrs"
import {
	type DrawingEvents,
	type ArtistCommands,
	JoinEvent,
	LeaveCommand,
	LeaveEvent,
	DestroyArtistsArt,
	StartDrawingCommand,
	StartLineEvent,
	StartQuadrilateralEvent,
	EndDrawingCommand,
	EndLineEvent,
	EndQuadrilateralEvent,
	NewLayerCommand,
	NewLayerEvent,
	JoinCommand,
	NewProjectEvent,
	NewProjectCommand,
} from "$lib/types/commands-events"
import { Line, Quadrilateral } from "$lib/ecs/components/drawings"

export class ArtistAggregator extends Aggregate<DrawingEvents, ArtistCommands> {
	constructor() {
		super("artists", 1)
	}

	async handle_command(
		aggregateId: string,
		command: ArtistCommands,
		metadata: Metadata,
	): Promise<DrawingEvents[]> {
		console.info("handling command", aggregateId, command)

		return match(command)
			.with(P.instanceOf(JoinCommand), (command: JoinCommand) => {
				return [new JoinEvent(command.userName)]
			})
			.with(P.instanceOf(LeaveCommand), (command: LeaveCommand) => {
				const events: DrawingEvents[] = [new LeaveEvent(metadata.userAddress)]

				if (command.destroy) {
					events.push(new DestroyArtistsArt(command.userId))
				}

				return events
			})
			.with(P.instanceOf(NewProjectCommand), (command) => {
				return [new NewProjectEvent(command.name, command.id)]
			})
			.with(P.instanceOf(StartDrawingCommand), (command: StartDrawingCommand) => {
				return match(command.type)
					.with(P.instanceOf(Line), () => {
						return [new StartLineEvent(command.point, command.style)]
					})
					.with(P.instanceOf(Quadrilateral), () => {
						return [new StartQuadrilateralEvent(command.point, command.style)]
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
						return [new EndLineEvent(command.point, command.style)]
					})
					.with(P.instanceOf(Quadrilateral), () => {
						return [new EndQuadrilateralEvent(command.point, command.style)]
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
