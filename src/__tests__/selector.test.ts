import { selectGeneratedResume } from "@/stores/appData";

test("selector falls back across keys", () => {
  expect(selectGeneratedResume({ outputs: { resume: "A" } } as any)).toBe("A");
  expect(selectGeneratedResume({ outputs: { targetedResume: "B" } } as any)).toBe("B");
  expect(selectGeneratedResume({ outputs: { latest: "C" } } as any)).toBe("C");
  expect(selectGeneratedResume({ outputs: { variants: { targeted: "D" } } } as any)).toBe("D");
  expect(selectGeneratedResume({ outputs: {} } as any)).toBe("");
});
