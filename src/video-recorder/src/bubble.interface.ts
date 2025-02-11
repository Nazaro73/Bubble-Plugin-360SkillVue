export interface BubblePluginInstance {
	canvas: unknown;
	publishState: (state: string, value: unknown) => void;
	triggerEvent: (event: string, callback?: (err: unknown) => void) => void;
	publishAutobinding: (value: string) => void;
	uploadFile: (file: Blob, callback: (err: unknown, url: string) => void, attachTo?: unknown, progressCallback?: (progress: number) => void) => void;
	canUploadFile: (file: Blob) => boolean;
	data: Record<string, unknown>;
}

export interface BubblePluginContext {
	currentUser: BubbleThing
	uploadContent: (fileName: string, contents: string, callback: (err: unknown, url: string) => void, attachTo?: unknown) => void;
}

export interface BubbleThing {
	get: (fieldName: string) => unknown;
	listProperties: () => string[];
}

export interface BubblePluginProperties {
	videoThing: BubbleThing
	videoThingFieldName: string
	bubble: Record<string, () => unknown>
}

export interface BubblePluginParams {
	instance: BubblePluginInstance;
	context: BubblePluginContext;
	properties: BubblePluginProperties;
}