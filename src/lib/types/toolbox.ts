enum ToolboxTool {
	PointerTool,
	RectangleSelection,
	Pencil,
	Eraser,
}

class ToolboxToolBase {
	type?: ToolboxTool
	name?: string
	icon?: string
	description?: string
	tutorial?: string

	constructor() {}
}

export { ToolboxTool, ToolboxToolBase }
