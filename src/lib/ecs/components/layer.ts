import { Component } from "../index"

export class Layer extends Component {
	public readonly name: string

	constructor(name: string) {
        super()
        this.name = name
    }
}