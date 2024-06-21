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
import type { ECS } from "$lib/ecs"
import { LayerComponent } from "$lib/ecs/components/layer"

export class ProjectAggregator extends Aggregate<ProjectEvents, ProjectCommands> {
	private ecs: ECS

	constructor(ecsInstance: ECS) {
		super("project", 1)
		this.ecs = ecsInstance
	}

	async handle_command(
		aggregateId: string,
		command: ProjectCommands,
		metadata: Metadata,
	): Promise<ProjectEvents[]> {
		console.info("handling command", aggregateId, command)

		return match(command)
			.with(P.instanceOf(JoinCommand), (command: JoinCommand) => {
				return [new JoinEvent(command.userAddress, command.projectId)]
			})
			.with(P.instanceOf(LeaveCommand), (command: LeaveCommand) => [
				new LeaveEvent(metadata.userAddress, command.projectId),
			])
			.with(P.instanceOf(NewProjectCommand), (command: NewProjectCommand) => {
				// Spawn a new ecs entity with the layer component.
				const entity = this.ecs.createEntity()
				entity.addComponent(new LayerComponent(`New Layer 1`))
				this.ecs.addEntity(entity)
				const defaultLayerId = crypto.randomUUID()
				return [
					new NewProjectEvent(command.name, command.id),
					new NewLayerEvent(defaultLayerId),
					new SetLayerNameEvent(defaultLayerId, "Layer 1"),
				]
			})
			.with(P.instanceOf(NewLayerCommand), (command: NewLayerCommand) => {
				// Spawn a new ecs entity with the layer component.
				const entity = this.ecs.createEntity(command.layerId)
				entity.addComponent(new LayerComponent(command.name))
				this.ecs.addEntity(entity)

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
