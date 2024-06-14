enum ToolboxTool {
	RectangleSelection,
	Pencil,
	Eraser,
	Rectangle,
	Line,
	Quadrilateral,
}

class ToolboxToolBase {
	type?: ToolboxTool
	name?: string
	icon?: string
	isSingleStrokeTool?: boolean
	description?: string
	tutorial?: string

	constructor() {
		this.isSingleStrokeTool = true
	}
}

class RectangleSelection extends ToolboxToolBase {
	constructor() {
		super()
		this.type = ToolboxTool.RectangleSelection
		this.name = "Rectangle Selection"
		this.icon = "rectangle"
		this.description = "Select a rectangle on the canvas."
		this.tutorial = "Click and drag to create a rectangle."
		this.isSingleStrokeTool = true
	}
}

export { ToolboxTool, ToolboxToolBase, RectangleSelection }
