import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "RUSHING",
  },
  description:
    "在比特与原子的缝隙间采样——关于 Rush：数字炼金术士、信号采集器与直觉工程化。",
};

export default function HomePage() {
  return (
    <article className="mx-auto max-w-3xl space-y-16 md:space-y-20">
      <header className="space-y-4">
        <h1 className="font-serif text-3xl font-semibold leading-snug tracking-tight text-[var(--color-ink)] md:text-[2.125rem]">
          Rush
        </h1>
        <p className="text-lg text-[var(--color-muted)]">现居杭州</p>
      </header>

      <section className="space-y-5">
        <div className="space-y-2">
          <h2 className="font-serif text-xl font-medium leading-snug text-[var(--color-ink)] md:text-2xl">
            采样：于比特与原子的缝隙间存在
          </h2>
          <p className="text-xs uppercase tracking-[0.15em] text-[var(--color-muted)]">
            Input &amp; Identity
          </p>
        </div>
        <div className="space-y-4 text-[var(--color-muted)] leading-[1.85]">
          <p>
            我是一个在 0 与 1 的荒原中修筑花园的「数字炼金术士」。我的生命由两个看似相悖的维度缝合而成：一半沉溺于
            INFP 那种宏大且细腻的直觉采样，另一半则执迷于 AI Native
            严丝合缝的生产力节律。
          </p>
          <p>
            我不仅是一个开发者或创作者，我是一个「信号采集器」。在比特（数字架构）与原子（物理世界）的缝隙间，我寻找那种被称为「真实」的震动频率。
          </p>
        </div>
      </section>

      <section className="space-y-5 border-t border-[var(--color-line)] pt-16 md:pt-20">
        <div className="space-y-2">
          <h2 className="font-serif text-xl font-medium leading-snug text-[var(--color-ink)] md:text-2xl">
            溯源：一场关于自我开颅的认知实验
          </h2>
          <p className="text-xs uppercase tracking-[0.15em] text-[var(--color-muted)]">
            Process &amp; Philosophy
          </p>
        </div>
        <div className="space-y-4 text-[var(--color-muted)] leading-[1.85]">
          <p>我拥有一种近乎严苛的「自省觉知」。</p>
          <p>
            对我而言，生活不是顺流而下，而是一场旷日持久的「自我开颅」实验。我习惯于审视自己的认知逻辑，在意志力的崩塌与节律化的重建中寻找平衡。我有着难以掩饰的「认知洁癖」，对平庸的同步率容忍度极低，但我正在学习如何弯下腰，去观察一个乱糟糟的插线板，并承认其中的混乱亦有其尊严。
          </p>
          <p>
            我是一个「修正案」。我不仅在生活，我还在观察并修正「我如何生活」。这种偏见与傲慢是我的动力，而对「不确定性」的敬畏则是我的安全阀。
          </p>
        </div>
      </section>

      <section className="space-y-6 border-t border-[var(--color-line)] pt-16 md:pt-20">
        <div className="space-y-2">
          <h2 className="font-serif text-xl font-medium leading-snug text-[var(--color-ink)] md:text-2xl">
            映射：在创造力过载下的感官重构
          </h2>
          <p className="text-xs uppercase tracking-[0.15em] text-[var(--color-muted)]">
            Output &amp; Expertise
          </p>
        </div>
        <p className="text-[var(--color-muted)] leading-[1.85]">
          我最引以为傲的特长，是「将直觉工程化」的能力。
        </p>
        <div className="space-y-8 text-[var(--color-muted)] leading-[1.85]">
          <div className="space-y-3">
            <h3 className="font-medium text-[var(--color-ink)]">
              逻辑缝合（The Logic）
            </h3>
            <p>
              执迷于构建 AI-native
              的分布式架构。我追求代码的严谨与系统在熵增世界里的反脆弱性。
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="font-medium text-[var(--color-ink)]">
              深层感知（The Sense）
            </h3>
            <p>
              无论是摄影、播客，还是对人类的长期观测，我擅长从噪点中提取信号。对我而言，快门与麦克风都是对「存在」的采样工具。
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="font-medium text-[var(--color-ink)]">
              感官重构（The Synthesis / Sensory Re-architecting）
            </h3>
            <p>
              正处于一种「创造力过载」的并行期。拒绝接受物理世界既定的交互边界，致力于各种底层协议的缝合。从数字逻辑到物理触感的每一次跨越，都是一场夺回「定义权」的实验——我不仅在连接世界，我正在用代码强行重塑生命感知的物理横截面。
            </p>
          </div>
        </div>
      </section>
    </article>
  );
}
