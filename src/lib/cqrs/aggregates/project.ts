import { P, match } from "ts-pattern"
import { Aggregate, AggregateError, type Metadata } from "$lib/cqrs"
import {
	type ProjectEvents,
	type ProjectCommands,
	JoinEvent,
	LeaveCommand,
	LeaveEvent,
	NewLayerCommand,
	NewLayerEvent,
	JoinCommand,
	NewProjectEvent,
	NewProjectCommand,
	SetLayerNameEvent,
} from "$lib/types/commands-events"

export class ArtistAggregator extends Aggregate<ProjectEvents, ProjectCommands> {
	constructor() {
		super("project", 1)
	}

	async handle_command(
		aggregateId: string,
		command: ProjectCommands,
		metadata: Metadata,
	): Promise<ProjectEvents[]> {
		console.info("handling command", aggregateId, command)

		return match(command)
			.with(P.instanceOf(JoinCommand), (command: JoinCommand) => {
				return [new JoinEvent(command.userAddress)]
			})
			.with(P.instanceOf(LeaveCommand), () => (
				[new LeaveEvent(metadata.userAddress)]
			))
			.with(P.instanceOf(NewProjectCommand), (command: NewProjectCommand) => {
				return [new NewProjectEvent(command.name, command.id)]
			})
			.with(P.instanceOf(NewLayerCommand), (command: NewLayerCommand) => {
				return [
					new NewLayerEvent(command.layerId),
					new SetLayerNameEvent(command.layerId, command.name),
				]
			})
			.otherwise(() => {
				console.error("Unknown command", command)
				throw new AggregateError("Unknown command")
			})
	}
}
