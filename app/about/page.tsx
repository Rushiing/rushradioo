import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于我",
};

const skills = ["产品管理", "业务运营", "AIGC", "团队协同"];

const highlights = [
  "在这里写一句你最想被记住的成就或方向。",
  "第二句：可替换为具体项目、数据或方法论。",
  "第三句：补充个人兴趣、长期目标或价值观。",
];

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-14">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-muted)]">
          About
        </p>
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-[var(--color-ink)] md:text-[2.75rem]">
          你的名字
        </h1>
        <p className="text-lg text-[var(--color-muted)]">一句话职业 / 身份定位</p>
      </header>

      <section className="space-y-4">
        <h2 className="font-serif text-xl font-medium text-[var(--color-ink)]">
          职业概况
        </h2>
        <ul className="space-y-3 text-[var(--color-muted)] leading-relaxed">
          <li>当前角色与公司 — 用一两行写清职责与领域。</li>
          <li>上一段经历 — 行业、团队规模、核心贡献。</li>
          <li>更早经历 — 可简述，保持与整体叙事一致。</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-xl font-medium text-[var(--color-ink)]">
          核心能力
        </h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span
              key={s}
              className="rounded-full border border-[var(--color-line)] bg-white px-3 py-1 text-sm text-[var(--color-ink)]"
            >
              {s}
            </span>
          ))}
        </div>
        <p className="text-[var(--color-muted)] leading-relaxed">
          用一段话概括你的方法论：如何做决策、如何推动复杂项目、如何与业务和技术协作。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-xl font-medium text-[var(--color-ink)]">
          教育背景
        </h2>
        <p className="text-[var(--color-muted)] leading-relaxed">
          学校 · 学院 / 专业 · 可选：年份或荣誉。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-xl font-medium text-[var(--color-ink)]">
          工作亮点
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-[var(--color-muted)] leading-relaxed marker:text-[var(--color-accent)]">
          {highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-4 border-t border-[var(--color-line)] pt-10">
        <h2 className="font-serif text-xl font-medium text-[var(--color-ink)]">
          联系方式
        </h2>
        <p className="text-[var(--color-muted)]">
          邮箱：{" "}
          <a
            href="mailto:you@example.com"
            className="text-[var(--color-accent)] underline underline-offset-2"
          >
            you@example.com
          </a>
        </p>
        <p className="text-sm text-[var(--color-muted)]">
          微信二维码等可放在{" "}
          <code className="rounded bg-[var(--color-line)] px-1.5 py-0.5 text-xs">
            public/wechat.png
          </code>{" "}
          并在本页用{" "}
          <code className="rounded bg-[var(--color-line)] px-1.5 py-0.5 text-xs">
            next/image
          </code>{" "}
          引用。
        </p>
      </section>
    </article>
  );
}
