import { describe, expect, it, jest } from "@jest/globals";

import type { Disposable } from "./disposable.js";
import { AutoDisposable } from "./disposable.js";

describe("Event", () => {
    describe("AutoDisposable", () => {
        it("should dispose its dependencies", () => {
            const myDisposable = {
                dispose: jest.fn(),
            };
            class MyAutoDisposable extends AutoDisposable {
                constructor(disposable: Disposable) {
                    super();
                    this.addDisposable(disposable);
                }
            }

            const myAutoDisposable = new MyAutoDisposable(myDisposable);
            myAutoDisposable.dispose();
            expect(myDisposable.dispose).toBeCalledTimes(1);
        });
    });
});
