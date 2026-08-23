import { NextResponse } from "next/server";

export function json(data: unknown, statusOrInit: number | ResponseInit = 200) {
  if (typeof statusOrInit === "number") {
    return NextResponse.json(data, { status: statusOrInit });
  }
  return NextResponse.json(data, statusOrInit);
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
