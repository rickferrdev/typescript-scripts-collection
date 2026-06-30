import { HANDLERS } from "./NewHandlers";

export type Handler = typeof HANDLERS;
export type HandlerName = keyof Handler;
export type HandlerAction = Handler[HandlerName];
export type HandlerMap = Map<HandlerName, Handler[HandlerName]>;
export type HandlerFns = [Handler, HandlerAction][];

export type TextTransformResult =
	| {
			data: {
				text: string;
				outputs?: HandlerOutputs;
			};
			ok: true;
	  }
	| {
			error: Error;
			ok: false;
	  };

export type HandlerOutputs = Array<{
	action: string;
	value: string;
}>;

export const fns: HandlerMap = new Map(
	Object.entries(HANDLERS) as [HandlerName, HandlerAction][],
);

export type HandlersConfig = {
	argc: number;
	run: (input: string, args: string[]) => TextTransformResult;
};
