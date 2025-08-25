// 오늘 체중(today)과 프로필 체중(profile)을 비교해서
// 변화량(kg)과 표시 문구/톤을 만들어주는 가벼운 유틸.

export type WeightDeltaTone = "good" | "warn" | "neutral";

export type WeightDeltaResult = {
    hasToday: boolean;        // 오늘 체중 입력 여부
    todayText: string;        // "40.2 kg" | "-"
    profileText: string;      // "41.0 kg" | "-"
    deltaKg: number | null;   // today - profile (소수 1자리 반올림) | null
    deltaText: string;        // "프로필 체중 대비 -0.8kg 감량 👏" 등
    tone: WeightDeltaTone;    // 배지/텍스트 색상에 쓰기
};

export function buildWeightDelta(
    profileWeightKg?: number | null,
    todayWeightKg?: number | null
): WeightDeltaResult {
    const hasToday = typeof todayWeightKg === "number" && todayWeightKg > 0;
    const hasProfile = typeof profileWeightKg === "number" && profileWeightKg > 0;

    const todayText = hasToday ? `${todayWeightKg!.toFixed(1)} kg` : "-";
    const profileText = hasProfile ? `${profileWeightKg!.toFixed(1)} kg` : "-";

    if (!hasProfile && !hasToday) {
        return {
            hasToday,
            todayText,
            profileText,
            deltaKg: null,
            deltaText: "프로필 체중과 오늘 체중이 없습니다.",
            tone: "neutral",
        };
    }

    if (!hasToday) {
        return {
            hasToday,
            todayText,
            profileText,
            deltaKg: null,
            deltaText: "오늘의 체중을 아직 기록하지 않았습니다 📉",
            tone: "warn",
        };
    }

    if (!hasProfile) {
        return {
            hasToday,
            todayText,
            profileText,
            deltaKg: null,
            deltaText: "프로필 체중이 없습니다. 프로필에서 체중을 등록해 주세요.",
            tone: "neutral",
        };
    }

    const raw = todayWeightKg! - profileWeightKg!;
    const delta = Math.round(raw * 10) / 10; // 소수 1자리

    let deltaText: string;
    let tone: WeightDeltaTone = "neutral";
    if (delta < 0) {
        deltaText = `프로필 체중 대비 ${delta}kg 감량 👏`;
        tone = "good";
    } else if (delta > 0) {
        deltaText = `프로필 체중 대비 +${delta}kg 증가 ⚠️`;
        tone = "warn";
    } else {
        deltaText = "프로필 체중과 동일합니다 ⚖️";
        tone = "neutral";
    }

    return {
        hasToday,
        todayText,
        profileText,
        deltaKg: delta,
        deltaText,
        tone,
    };
}