/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
	AnyNode,
	AnyNodes,
	MOCK_JS_ROOT,
	NodeBaseWithComments,
} from "@internal/ast";
import {
	AnyVisitor,
	CompilerContext,
	CompilerPath,
	signals,
} from "@internal/compiler";
import {SourceLocation} from "@internal/parser-core";

function removeProp<T extends {
	loc?: SourceLocation;
}>(obj: T): Omit<T, "loc"> {
	const {loc, ...locless} = obj;
	loc;
	return locless;
}

const removeLocTransform: AnyVisitor[] = [
	{
		name: "removeLocTransform",
		enter(path: CompilerPath) {
			const {node} = path;

			if (node.loc === undefined) {
				return signals.retain;
			} else {
				const newNode: NodeBaseWithComments = removeProp(node);

				// Also remove any `undefined` properties
				// rome-ignore lint/ts/noExplicitAny: future cleanup
				const escaped: any = newNode;
				for (const key in newNode) {
					if (escaped[key] === undefined) {
						// rome-ignore lint/js/noDelete: future cleanup
						delete escaped[key];
					}
				}

				return signals.replace(newNode as AnyNode);
			}
		},
	},
];

export function removeLoc(ast: AnyNode): AnyNodes {
	const context = new CompilerContext({
		ast: MOCK_JS_ROOT,
	});
	return context.reduce(ast, removeLocTransform);
}
