import React from "react";

type Props = {
    comments: string[];
    className?: string;
};

/**
 * CoachStrip (list style)
 * - 코칭 문구를 단순 1줄 리스트로 렌더링
 * - 칩/박스 스타일 제거, 가독성 중심
 */
export default function CoachStrip({ comments, className }: Props) {
    if (!comments || comments.length === 0) return null;
    const wrapClass = `m-0 p-0 space-y-1.5 ${className ?? ""}`;

    return (
        <ul className={wrapClass}>
            {comments.map((c, idx) => (
                <li
                    key={idx}
                    className="flex items-start gap-2 text-[13px] leading-relaxed text-gray-800"
                >
                    <span className="mt-[2px]">•</span>
                    <span>{c}</span>
                </li>
            ))}
        </ul>
    );
}