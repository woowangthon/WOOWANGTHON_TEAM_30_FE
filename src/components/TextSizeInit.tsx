"use client";

import { useEffect } from "react";
import { applyTextSize, readTextSize } from "@/lib/prefs";

/** 큰 글씨 설정을 첫 화면부터 적용한다 (이 기기에 저장된 값). */
export function TextSizeInit() {
  useEffect(() => {
    applyTextSize(readTextSize());
  }, []);
  return null;
}
