import { practice } from "../application/practice";
import { openDatabase } from "./database";
import { knexPracticeStore } from "./store";

const runtime = globalThis as typeof globalThis & {
  vertivetPractice?: ReturnType<typeof practice>;
};

export function getPracticeService() {
  runtime.vertivetPractice ??= practice(knexPracticeStore(openDatabase()));
  return runtime.vertivetPractice;
}
